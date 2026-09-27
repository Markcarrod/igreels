#!/usr/bin/env python3
"""
=============================================================================
move_to_igreelout.py - Move & Organize IG Reels into /IGREELOUT/<artist>/
=============================================================================
Moves rendered video reels from /home/kayan/Desktop/IGVIDGEN/Output/
into /home/kayan/Desktop/IGREELOUT/<artist>/<randomstring>_<index>.mp4

Features:
  - Detects the artist from the video filename (e.g. ashaari, dende, Devin Donnell).
  - Creates artist subfolder under IGREELOUT (e.g. IGREELOUT/ashaari/).
  - Renames to random 8-character string + sequential counter (<randomstring>_<index>.mp4).
  - Checks existing files in destination so counters continue sequentially without overwriting.
  - Automatically writes / updates /home/kayan/Desktop/Fbreelout.txt for downstream FB tools.
=============================================================================
"""

import os
import re
import sys
import shutil
import random
import string
import argparse
from pathlib import Path

# Known artists mapping (pattern to normalized folder name)
KNOWN_ARTISTS = [
    ("ashaari", "ashaari"),
    ("dende", "dende"),
    ("devin donnell", "Devin Donnell"),
    ("washington", "Washington"),
    ("ray lozano", "Ray Lozano"),
    ("dylan wild", "Dylan Wild"),
    ("manana", "Manana"),
    ("earl hondo", "Earl Hondo"),
    ("justine darcenne", "Justine Darcenne"),
    ("kalisway", "Kalisway"),
    ("laya", "LAYA"),
    ("safa", "SAFA"),
    ("cyanca", "Cyanca"),
    ("chuka the destroyer", "Chuka the destroyer"),
    ("chuka, the destroyer", "Chuka, The Destroyer"),
    ("chuka", "Chuka the destroyer"),
    ("venus anon", "Venus Anon"),
]

def generate_random_string(length=8):
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def sanitize_folder_name(name):
    if not name:
        return "Artist"
    clean = re.sub(r'[\\/:*?"<>|]', '', name).strip()
    clean = re.sub(r'\.+$', '', clean).strip()
    return clean or "Artist"

def detect_artist(filename):
    """
    Detect artist from filename (e.g. 'Devin Donnell Wait_3.mp4' -> 'Devin Donnell')
    """
    stem = Path(filename).stem
    # Remove trailing _<number>
    base_title = re.sub(r'_\d+$', '', stem).strip().lower()

    for pattern, folder_name in KNOWN_ARTISTS:
        if pattern in base_title:
            return folder_name

    # Fallback heuristic: take words before known song words or first 2 words
    parts = base_title.split()
    if len(parts) >= 2:
        return parts[0].capitalize() + " " + parts[1].capitalize()
    elif parts:
        return parts[0].capitalize()
    return "Artist"

def get_next_index(target_dir):
    r"""
    Find highest existing index _(\d+).mp4 in target_dir and return next index.
    """
    if not target_dir.exists():
        return 1
    existing_indices = []
    for f in target_dir.glob("*.mp4"):
        m = re.search(r'_(\d+)\.mp4$', f.name, re.IGNORECASE)
        if m:
            existing_indices.append(int(m.group(1)))
    return (max(existing_indices) + 1) if existing_indices else 1

def find_existing_artist_dir(dest_base, artist_folder):
    """
    Check if a folder with the same name (case-insensitive) already exists.
    """
    if not dest_base.exists():
        return dest_base / artist_folder
    for item in dest_base.iterdir():
        if item.is_dir() and item.name.lower() == artist_folder.lower():
            return item
    return dest_base / artist_folder

def main():
    parser = argparse.ArgumentParser(description="Move video reels to /IGREELOUT/<artist>/<randomstring>_<index>.mp4")
    parser.add_argument("--src", type=str, default="", help="Source directory containing .mp4 files")
    parser.add_argument("--dest", type=str, default="", help="Destination IGREELOUT directory")
    parser.add_argument("--copy", action="store_true", help="Copy instead of move")
    parser.add_argument("--no-fbreelout", action="store_true", help="Do not write/update Fbreelout.txt")
    args = parser.parse_args()

    # Determine default source directory
    src_candidates = [
        Path(args.src) if args.src else None,
        Path("/home/kayan/Desktop/IGVIDGEN/Output"),
        Path.cwd() / "Output",
        Path("C:/Users/kayan/Desktop/IGVIDGEN/Output"),
        Path.cwd()
    ]
    src_dir = None
    for cand in src_candidates:
        if cand and cand.exists() and any(cand.glob("*.mp4")):
            src_dir = cand
            break

    if not src_dir:
        # Fallback to candidate that exists even if empty
        for cand in src_candidates:
            if cand and cand.exists():
                src_dir = cand
                break
    if not src_dir:
        src_dir = Path("/home/kayan/Desktop/IGVIDGEN/Output")

    # Determine default destination directory
    dest_candidates = [
        Path(args.dest) if args.dest else None,
        Path("/home/kayan/Desktop/IGREELOUT"),
        Path("C:/Users/kayan/Desktop/IGREELOUT"),
        Path.cwd().parent / "IGREELOUT"
    ]
    dest_dir = None
    for cand in dest_candidates:
        if cand and (cand.exists() or cand.parent.exists()):
            dest_dir = cand
            break
    if not dest_dir:
        dest_dir = Path("/home/kayan/Desktop/IGREELOUT")

    print("=" * 65)
    print("  🎬 IG REELS ORGANIZER & MOVER")
    print(f"  Source Directory : {src_dir}")
    print(f"  Target Directory : {dest_dir}")
    print(f"  Mode             : {'COPY' if args.copy else 'MOVE'}")
    print("=" * 65)

    if not src_dir.exists():
        print(f"[ERROR] Source directory does not exist: {src_dir}")
        sys.exit(1)

    mp4_files = sorted(list(src_dir.glob("*.mp4")))
    if not mp4_files:
        print(f"[!] No .mp4 files found in {src_dir}")
        sys.exit(0)

    print(f"[+] Found {len(mp4_files)} video(s) to process.\n")

    dest_dir.mkdir(parents=True, exist_ok=True)
    moved_paths = []
    artist_counters = {}

    for idx, video_file in enumerate(mp4_files, 1):
        artist = detect_artist(video_file.name)
        artist_dir = find_existing_artist_dir(dest_dir, artist)
        artist_dir.mkdir(parents=True, exist_ok=True)

        if str(artist_dir) not in artist_counters:
            artist_counters[str(artist_dir)] = get_next_index(artist_dir)
        else:
            artist_counters[str(artist_dir)] += 1

        curr_num = artist_counters[str(artist_dir)]
        rand_str = generate_random_string(8)
        new_filename = f"{rand_str}_{curr_num}.mp4"
        target_path = artist_dir / new_filename

        action_name = "Copied" if args.copy else "Moved"
        if args.copy:
            shutil.copy2(video_file, target_path)
        else:
            shutil.move(str(video_file), str(target_path))

        moved_paths.append(str(target_path))
        print(f"  [{idx:02d}/{len(mp4_files):02d}] {action_name}: {video_file.name}")
        print(f"       -> {target_path.parent.name}/{target_path.name}")

    # Optional: Write / append to /home/kayan/Desktop/Fbreelout.txt
    if not args.no_fbreelout and moved_paths:
        fbreel_candidates = [
            Path("/home/kayan/Desktop/Fbreelout.txt"),
            Path("C:/Users/kayan/Desktop/Fbreelout.txt"),
        ]
        fbreel_file = None
        for cand in fbreel_candidates:
            if cand.parent.exists():
                fbreel_file = cand
                break

        if fbreel_file:
            try:
                with open(fbreel_file, "a", encoding="utf-8") as f:
                    for p in moved_paths:
                        f.write(p.replace("\\", "/") + "\n")
                print(f"\n[+] Added {len(moved_paths)} paths to: {fbreel_file}")
            except Exception as e:
                print(f"[WARN] Could not update {fbreel_file}: {e}")

    print("\n" + "=" * 65)
    print(f"  🎉 SUCCESS! Processed {len(moved_paths)} reels into {dest_dir}")
    print("=" * 65)

if __name__ == "__main__":
    main()
