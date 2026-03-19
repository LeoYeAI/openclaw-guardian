#!/usr/bin/env python3
"""
lenny-wisdom: Build search index from Lenny's Podcast/Newsletter data.

Usage:
  python3 build_index.py <data_dir> <output_dir>

  data_dir:   path to cloned lennys-newsletterpodcastdata repo
  output_dir: where to write chunks/ and search_index.json (defaults to script dir/../data)

Creates:
  data/chunks/        - chunked markdown files (~800 words each)
  data/search_index.json - inverted index for fast retrieval
  data/meta.json      - episode/article metadata
"""

import os
import sys
import json
import re
import math
from pathlib import Path
from collections import defaultdict

CHUNK_SIZE = 800  # words per chunk
OVERLAP = 80      # word overlap between chunks


def tokenize(text):
    """Simple word tokenizer, lowercased, alphanumeric only."""
    return re.findall(r'[a-z0-9]+', text.lower())


def chunk_text(content, filename, meta, chunk_size=CHUNK_SIZE, overlap=OVERLAP):
    """Split content into overlapping word chunks, preserving speaker context."""
    # Strip frontmatter
    if content.startswith('---'):
        end = content.find('---', 3)
        if end != -1:
            content = content[end+3:].strip()

    words = content.split()
    chunks = []
    i = 0
    chunk_idx = 0

    while i < len(words):
        chunk_words = words[i:i+chunk_size]
        chunk_text = ' '.join(chunk_words)

        # Try to find the nearest speaker attribution before this chunk
        preceding = ' '.join(words[max(0, i-50):i])
        speaker_match = re.findall(r'\*\*([^*]+)\*\*', preceding)
        speaker = speaker_match[-1] if speaker_match else None

        chunks.append({
            'id': f"{filename}::{chunk_idx}",
            'source': filename,
            'guest': meta.get('guest', ''),
            'title': meta.get('title', ''),
            'date': meta.get('date', ''),
            'chunk_idx': chunk_idx,
            'word_start': i,
            'speaker_context': speaker,
            'text': chunk_text,
        })

        i += chunk_size - overlap
        chunk_idx += 1

    return chunks


def build_tfidf_index(all_chunks):
    """Build TF-IDF inverted index over all chunks."""
    N = len(all_chunks)
    df = defaultdict(int)   # document frequency per term
    tf_store = []           # list of {term: tf} per chunk

    for chunk in all_chunks:
        tokens = tokenize(chunk['text'])
        total = len(tokens)
        freq = defaultdict(int)
        for t in tokens:
            freq[t] += 1
        tf = {t: c / total for t, c in freq.items()}
        tf_store.append(tf)
        for t in freq:
            df[t] += 1

    # Build inverted index: term -> [(chunk_id, tfidf_score)]
    index = defaultdict(list)
    for chunk_idx, (chunk, tf) in enumerate(zip(all_chunks, tf_store)):
        for term, tf_val in tf.items():
            if df[term] < 2:   # skip hapax legomena
                continue
            idf = math.log(N / df[term])
            score = tf_val * idf
            if score > 0.001:  # threshold to keep index small
                index[term].append((chunk['id'], round(score, 5)))

    # Sort each posting list by score desc
    for term in index:
        index[term].sort(key=lambda x: -x[1])
        index[term] = index[term][:50]  # keep top-50 per term

    return dict(index)


def main():
    if len(sys.argv) < 2:
        # Try to auto-detect data dir relative to script
        script_dir = Path(__file__).parent
        data_dir = script_dir.parent / 'data' / 'source'
        out_dir = script_dir.parent / 'data'
    else:
        data_dir = Path(sys.argv[1])
        out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).parent.parent / 'data'

    if not data_dir.exists():
        print(f"[ERROR] Data dir not found: {data_dir}")
        print("Run setup.sh first to download the data.")
        sys.exit(1)

    print(f"[1/4] Reading source data from {data_dir} ...")

    # Load index.json for metadata
    index_path = data_dir / 'index.json'
    meta_by_file = {}
    if index_path.exists():
        raw = json.loads(index_path.read_text())
        for entry in raw.get('podcasts', []):
            meta_by_file[entry['filename']] = entry
        for entry in raw.get('newsletters', []):
            meta_by_file[entry['filename']] = entry

    # Collect all markdown files
    all_chunks = []
    file_list = list((data_dir / 'podcasts').glob('*.md')) + list((data_dir / 'newsletters').glob('*.md'))

    for md_path in sorted(file_list):
        rel = str(md_path.relative_to(data_dir))
        meta = meta_by_file.get(rel, {})
        content = md_path.read_text(encoding='utf-8', errors='ignore')
        chunks = chunk_text(content, rel, meta)
        all_chunks.extend(chunks)

    print(f"    → {len(file_list)} files, {len(all_chunks)} chunks")

    print(f"[2/4] Building TF-IDF index ...")
    index = build_tfidf_index(all_chunks)
    print(f"    → {len(index):,} unique terms indexed")

    print(f"[3/4] Writing output files ...")
    out_dir.mkdir(parents=True, exist_ok=True)
    chunks_dir = out_dir / 'chunks'
    chunks_dir.mkdir(exist_ok=True)

    # Write chunks as individual JSON files (grouped by source)
    by_source = defaultdict(list)
    for chunk in all_chunks:
        by_source[chunk['source']].append(chunk)

    for source, chunks in by_source.items():
        safe = source.replace('/', '__').replace('.md', '.json')
        (chunks_dir / safe).write_text(json.dumps(chunks, ensure_ascii=False, indent=2))

    # Write search index
    (out_dir / 'search_index.json').write_text(
        json.dumps(index, ensure_ascii=False, separators=(',', ':'))
    )

    # Write metadata
    meta_out = []
    for entry in meta_by_file.values():
        meta_out.append(entry)
    (out_dir / 'meta.json').write_text(json.dumps(meta_out, ensure_ascii=False, indent=2))

    # Write chunk manifest (id -> source file for fast lookup)
    manifest = {chunk['id']: chunk['source'] for chunk in all_chunks}
    (out_dir / 'chunk_manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, separators=(',', ':'))
    )

    print(f"    → search_index.json ({(out_dir / 'search_index.json').stat().st_size // 1024} KB)")
    print(f"    → {len(list(chunks_dir.iterdir()))} chunk files in chunks/")

    print(f"[4/4] Done! Index ready at {out_dir}")
    print(f"\nStats:")
    print(f"  Files:  {len(file_list)}")
    print(f"  Chunks: {len(all_chunks)}")
    print(f"  Terms:  {len(index):,}")


if __name__ == '__main__':
    main()
