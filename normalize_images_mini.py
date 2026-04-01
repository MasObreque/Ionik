#!/usr/bin/env python3
"""
normalize_images_mini.py
Safely rename all files in images_mini/ to lowercase (avoid collisions) and optionally update project references.
Usage:
  python normalize_images_mini.py [--update-references] [--dry-run] [--remove-accents]

Creates images_mini/rename_map.json with mapping old -> new and prints actions.
"""

from pathlib import Path
import argparse
import unicodedata
import json
import uuid
import re
import sys

PROJECT_ROOT = Path(__file__).resolve().parent
IM_DIR = PROJECT_ROOT / 'images'

EXTS_TO_SCAN = ['.html', '.js', '.md', '.css']


def remove_accents(s: str) -> str:
    nkfd = unicodedata.normalize('NFKD', s)
    return ''.join([c for c in nkfd if not unicodedata.combining(c)])


def safe_lower_name(name: str, remove_acc=False) -> str:
    stem = Path(name).stem
    ext = Path(name).suffix
    if remove_acc:
        stem = remove_accents(stem)
    new = (stem.lower()) + ext.lower()
    # replace spaces with hyphens
    new = re.sub(r"\s+", '-', new)
    # remove any chars except a-z0-9-._
    new = re.sub(r"[^a-z0-9\-\._]", '', new)
    return new


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--update-references', action='store_true', help='Also update references across project files')
    parser.add_argument('--dry-run', action='store_true', help='Show changes without applying them')
    parser.add_argument('--remove-accents', action='store_true', help='Remove accents/diacritics from filenames')
    args = parser.parse_args()

    if not IM_DIR.exists() or not IM_DIR.is_dir():
        print(f"images_mini directory not found: {IM_DIR}")
        sys.exit(1)

    files = [p for p in IM_DIR.iterdir() if p.is_file()]
    mapping = {}
    temp_names = {}

    # Step 1: compute target names and detect collisions
    targets = {}
    for p in files:
        new = safe_lower_name(p.name, remove_acc=args.remove_accents)
        # if different case only and filesystem is case-insensitive, we still handle via temp names
        if new in targets.values():
            # collision: append suffix
            base = Path(new).stem
            ext = Path(new).suffix
            i = 1
            candidate = f"{base}_{i}{ext}"
            while candidate in targets.values():
                i += 1
                candidate = f"{base}_{i}{ext}"
            new = candidate
        targets[p] = new

    if args.dry_run:
        print("Dry run: the following renames would be performed:")
        for oldp, newname in targets.items():
            print(f"  {oldp.name} -> {newname}")
        if args.update_references:
            print('\nReferences would be updated in project files (html/js/md/css).')
        return

    # Step 2: rename to temporary unique names to avoid case-only collisions
    for p in files:
        newname = targets[p]
        if p.name == newname:
            mapping[str(p.name)] = newname
            continue
        tmp = f"__tmp_{uuid.uuid4().hex}_{p.name}"
        tmp_path = p.with_name(tmp)
        p.rename(tmp_path)
        temp_names[tmp_path] = newname
        print(f"Temporarily renamed: {p.name} -> {tmp_path.name}")

    # Step 3: rename temporaries to final names
    for tmp_path, final_name in temp_names.items():
        final_path = tmp_path.with_name(final_name)
        # if final exists (unlikely because we reserved names), append suffix
        i = 1
        base = Path(final_name).stem
        ext = Path(final_name).suffix
        while final_path.exists():
            final_name = f"{base}_{i}{ext}"
            final_path = tmp_path.with_name(final_name)
            i += 1
        tmp_path.rename(final_path)
        mapping[str(tmp_path.name).replace('__tmp_','')] = final_name
        print(f"Renamed: {tmp_path.name} -> {final_name}")

    # For files that didn't need renaming, ensure mapping included
    for p in files:
        if p.name not in mapping:
            newn = targets.get(p, p.name)
            mapping[p.name] = newn

    # Save mapping
    map_file = IM_DIR / 'rename_map.json'
    with map_file.open('w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)
    print(f"Mapping saved to: {map_file}")

    # Optionally update references
    if args.update_references:
        exts = ['.html', '.js', '.md', '.css']
        files_to_scan = [p for p in PROJECT_ROOT.rglob('*') if p.suffix.lower() in exts and p.is_file()]
        for fpath in files_to_scan:
            text = fpath.read_text(encoding='utf-8')
            orig = text
            for old, new in mapping.items():
                # replace occurrences of images_mini/old (case-insensitive)
                pattern = re.compile(re.escape(f"images_mini/{old}"), re.IGNORECASE)
                text = pattern.sub(f"images_mini/{new}", text)
            if text != orig:
                fpath.write_text(text, encoding='utf-8')
                print(f"Updated references in: {fpath.relative_to(PROJECT_ROOT)}")

    print('Done.')

if __name__ == '__main__':
    main()
