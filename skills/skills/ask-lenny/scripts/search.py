#!/usr/bin/env python3
"""
lenny-wisdom: Search the index and return top-N relevant chunks.

Usage:
  python3 search.py "<query>" [--top N] [--guest "Name"] [--data <data_dir>]

Output: JSON array of matching chunks with scores.
"""

import sys
import json
import re
import math
import argparse
from pathlib import Path
from collections import defaultdict


def tokenize(text):
    return re.findall(r'[a-z0-9]+', text.lower())


def load_index(data_dir: Path):
    index_path = data_dir / 'search_index.json'
    if not index_path.exists():
        print(json.dumps({"error": f"Index not found at {index_path}. Run: python3 build_index.py"}))
        sys.exit(1)
    return json.loads(index_path.read_text())


def load_chunk(data_dir: Path, chunk_id: str) -> dict | None:
    source = chunk_id.split('::')[0]
    safe = source.replace('/', '__').replace('.md', '.json')
    chunk_file = data_dir / 'chunks' / safe
    if not chunk_file.exists():
        return None
    chunks = json.loads(chunk_file.read_text())
    for c in chunks:
        if c['id'] == chunk_id:
            return c
    return None


def search(query: str, data_dir: Path, top_n: int = 5, guest_filter: str = None):
    index = load_index(data_dir)
    tokens = tokenize(query)

    # Score chunks via TF-IDF sum
    scores = defaultdict(float)
    for token in tokens:
        if token in index:
            for chunk_id, score in index[token]:
                scores[chunk_id] += score

    if not scores:
        return []

    # Sort by score
    ranked = sorted(scores.items(), key=lambda x: -x[1])

    # Load and filter chunks
    results = []
    seen_sources = set()  # prefer diversity: max 2 chunks per source
    source_counts = defaultdict(int)

    for chunk_id, score in ranked:
        if len(results) >= top_n * 3:  # over-fetch then trim
            break
        chunk = load_chunk(data_dir, chunk_id)
        if chunk is None:
            continue

        # Guest filter
        if guest_filter:
            guest_lower = chunk.get('guest', '').lower()
            if guest_filter.lower() not in guest_lower:
                continue

        # Diversity: max 2 chunks per source file
        src = chunk['source']
        if source_counts[src] >= 2:
            continue
        source_counts[src] += 1

        results.append({
            'score': round(score, 4),
            'id': chunk_id,
            'guest': chunk.get('guest', ''),
            'title': chunk.get('title', ''),
            'date': chunk.get('date', ''),
            'source': chunk.get('source', ''),
            'speaker_context': chunk.get('speaker_context'),
            'text': chunk['text'][:2000],  # cap per-chunk to ~300 words preview
        })

        if len(results) >= top_n:
            break

    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('query', nargs='?', default='')
    parser.add_argument('--top', type=int, default=5)
    parser.add_argument('--guest', type=str, default=None)
    parser.add_argument('--data', type=str, default=None)
    parser.add_argument('--full', action='store_true', help='Return full chunk text (no truncation)')
    args = parser.parse_args()

    if not args.query:
        print(json.dumps({"error": "No query provided. Usage: search.py \"<query>\""}))
        sys.exit(1)

    if args.data:
        data_dir = Path(args.data)
    else:
        data_dir = Path(__file__).parent.parent / 'data'

    results = search(args.query, data_dir, top_n=args.top, guest_filter=args.guest)

    if args.full:
        # Re-load full text
        for r in results:
            chunk = load_chunk(data_dir, r['id'])
            if chunk:
                r['text'] = chunk['text']

    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
