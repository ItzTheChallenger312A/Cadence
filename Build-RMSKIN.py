import os
import struct
import zipfile

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT_FILE = os.path.join(ROOT, "Cadence-v2.0.1.rmskin")

INCLUDE_DIRS = ["Skins", "Layouts", "Plugins"]
INCLUDE_FILES = ["RMSKIN.ini"]

with zipfile.ZipFile(OUT_FILE, "w", zipfile.ZIP_DEFLATED) as zf:
    for fn in INCLUDE_FILES:
        fp = os.path.join(ROOT, fn)
        if os.path.exists(fp):
            zf.write(fp, fn)
    for folder in INCLUDE_DIRS:
        base = os.path.join(ROOT, folder)
        if not os.path.isdir(base):
            continue
        for dirpath, _, filenames in os.walk(base):
            for fn in filenames:
                fp = os.path.join(dirpath, fn)
                arc = os.path.relpath(fp, ROOT).replace("\\", "/")
                zf.write(fp, arc)

zip_size = os.path.getsize(OUT_FILE)
with open(OUT_FILE, "ab") as f:
    f.write(struct.pack("<QB7s", zip_size, 0, b"RMSKIN\x00"))

print(f"Built {OUT_FILE} ({os.path.getsize(OUT_FILE):,} bytes)")
