#!/bin/bash
# YouTube KOL Evaluation Tool - JSON Output
URL="$1"
if [ -z "$URL" ]; then
  echo '{"error":"Missing URL"}'
  exit 1
fi

if ! command -v yt-dlp &> /dev/null; then
  echo '{"error":"yt-dlp not installed"}'
  exit 1
fi

if [[ "$URL" == *"/watch"* || "$URL" == *"youtu.be"* ]]; then
  # Single video - try full dump
  yt-dlp --js-runtimes node --remote-components ejs:github --dump-json --no-download "$URL" 2>/dev/null | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    result = {
        'type': 'video',
        'title': d.get('title', 'N/A'),
        'channel': d.get('channel', d.get('uploader', 'N/A')),
        'channelUrl': d.get('channel_url', d.get('uploader_url', '')),
        'subscribers': d.get('channel_follower_count', 0) or 0,
        'views': d.get('view_count', 0) or 0,
        'likes': d.get('like_count', 0) or 0,
        'comments': d.get('comment_count', 0) or 0,
        'duration': d.get('duration_string', 'N/A'),
        'uploadDate': d.get('upload_date', 'N/A'),
        'description': (d.get('description', '') or '')[:500],
        'tags': (d.get('tags', []) or [])[:20],
        'thumbnail': d.get('thumbnail', ''),
    }
    views = result['views']
    likes = result['likes']
    comments = result['comments']
    result['engagementRate'] = round(((likes + comments) / views * 100), 2) if views > 0 else 0
    print(json.dumps(result, ensure_ascii=False))
except Exception as e:
    print(json.dumps({'error': str(e)}))
" || echo '{"error":"Failed to fetch video data. YouTube may be blocking requests."}'
else
  # Channel analysis - hybrid approach:
  # 1. yt-dlp flat-playlist for video list + basic metadata
  # 2. returnyoutubedislike API for likes/engagement data per video
  CHANNEL_URL="$URL"
  [[ "$CHANNEL_URL" != */videos ]] && CHANNEL_URL="${CHANNEL_URL}/videos"

  TMPDIR=$(mktemp -d)
  trap "rm -rf $TMPDIR" EXIT

  # Step 1: Get video list via flat-playlist (reliable, no bot detection)
  yt-dlp --js-runtimes node --remote-components ejs:github --flat-playlist --dump-json --playlist-items 1:10 "$CHANNEL_URL" 2>/dev/null > "$TMPDIR/playlist.jsonl"

  if [ ! -s "$TMPDIR/playlist.jsonl" ]; then
    echo '{"error":"Could not fetch channel data. Try a different URL format."}'
    exit 0
  fi

  # Step 2: Extract video IDs and fetch engagement data in parallel
  python3 -c "
import json, sys
videos = []
for line in open('$TMPDIR/playlist.jsonl'):
    line = line.strip()
    if line:
        try:
            videos.append(json.loads(line))
        except:
            pass
# Write video IDs for engagement fetch
ids = [v.get('id','') for v in videos if v.get('id')]
with open('$TMPDIR/video_ids.txt','w') as f:
    f.write('\n'.join(ids))
print(len(ids))
" > "$TMPDIR/id_count.txt"

  # Fetch engagement data from returnyoutubedislike API (parallel)
  while IFS= read -r VID; do
    [ -z "$VID" ] && continue
    curl -s --max-time 10 "https://returnyoutubedislikeapi.com/votes?videoId=$VID" > "$TMPDIR/engage_${VID}.json" &
  done < "$TMPDIR/video_ids.txt"
  wait

  # Step 3: Combine playlist data + engagement data
  python3 -c "
import json, sys, os, glob

tmpdir = '$TMPDIR'

# Load playlist data
videos_raw = []
for line in open(os.path.join(tmpdir, 'playlist.jsonl')):
    line = line.strip()
    if line:
        try:
            videos_raw.append(json.loads(line))
        except:
            pass

if not videos_raw:
    print(json.dumps({'error': 'Could not parse channel data.'}))
    sys.exit()

# Load engagement data
engagement = {}
for f in glob.glob(os.path.join(tmpdir, 'engage_*.json')):
    try:
        with open(f) as fh:
            d = json.loads(fh.read().strip())
            if d.get('id'):
                engagement[d['id']] = d
    except:
        pass

first = videos_raw[0]
channel_name = first.get('playlist_uploader', first.get('playlist_channel', first.get('channel', first.get('uploader', 'Unknown'))))
handle = first.get('playlist_uploader_id', first.get('uploader_id', ''))

video_list = []
total_views = 0
total_likes = 0

for v in videos_raw:
    vid_id = v.get('id', '')
    views = v.get('view_count', 0) or 0
    duration = v.get('duration', 0) or 0
    
    # Get engagement from API
    eng = engagement.get(vid_id, {})
    likes = eng.get('likes', 0) or 0
    # API viewCount may be more accurate
    if eng.get('viewCount'):
        views = eng['viewCount']
    
    total_views += views
    total_likes += likes
    
    thumb = ''
    thumbs = v.get('thumbnails', [])
    if thumbs:
        thumb = thumbs[-1].get('url', '')
    
    engagement_rate = round((likes / views * 100), 2) if views > 0 else 0
    
    video_list.append({
        'title': v.get('title', 'N/A'),
        'views': views,
        'likes': likes,
        'engagementRate': engagement_rate,
        'duration': v.get('duration_string', 'N/A'),
        'durationSec': duration,
        'uploadDate': v.get('upload_date', ''),
        'thumbnail': thumb,
        'url': v.get('webpage_url', v.get('url', ''))
    })

n = len(video_list)
avg_views = round(total_views / n) if n > 0 else 0
avg_likes = round(total_likes / n) if n > 0 else 0
avg_engagement = round((total_likes / total_views * 100), 2) if total_views > 0 else 0
total_duration = sum(v.get('durationSec', 0) for v in video_list)
avg_duration_sec = round(total_duration / n) if n > 0 else 0

sorted_by_views = sorted(video_list, key=lambda x: x['views'], reverse=True)

result = {
    'type': 'channel',
    'channel': channel_name,
    'handle': handle,
    'videoCount': n,
    'avgViews': avg_views,
    'avgLikes': avg_likes,
    'avgEngagement': avg_engagement,
    'totalViews': total_views,
    'avgDurationSec': avg_duration_sec,
    'topVideo': sorted_by_views[0] if sorted_by_views else None,
    'videos': video_list
}
print(json.dumps(result, ensure_ascii=False))
"
fi
