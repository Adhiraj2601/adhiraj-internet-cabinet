"""
Builds "open sketchbook" spread images from the sketches in src/content/scraps.json,
in the exact 1760x1240 layout the ThreeUI Sketchbook engine expects
(book body x 88-1672, y 270-975, gutter at x=880, transparent margins).

Run from the project root:   python scripts/make-spreads.py
Needs:                       pip install pillow
Writes:                      public/sketchbook/spread-01.webp ...  and  src/content/sketchbookPages.json
Brand knobs are the constants below.
"""
from PIL import Image, ImageDraw
import json, os, random

random.seed(4)
SCRAPS = 'src/content/scraps.json'      # [{src, note, date, rotation, ...}]
PUBLIC = 'public'                        # scraps[].src is relative to this folder
OUT_DIR = 'public/sketchbook'
OUT_JSON = 'src/content/sketchbookPages.json'

INK = (23, 23, 23)          # --foreground
PAPER = (247, 243, 234)     # page colour (slightly lighter than --background #F4F1EA)
TAPE = (227, 184, 89, 205)  # mustard #E3B859
PHOTO_BOX = (600, 560)      # max photo size per page; raise for bigger sketches on phones

W, H = 1760, 1240
L, T, R, B, G = 88, 270, 1672, 975, 880


def book():
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((L + 10, T + 10, R + 10, B + 10), radius=44, fill=INK + (255,))          # hard shadow
    d.rounded_rectangle((L, T, R, B), radius=44, fill=PAPER + (255,), outline=INK + (255,), width=4)
    noise = Image.effect_noise((W, H), 18).convert('L').point(lambda v: int(v * 0.10))
    grain = Image.new('RGBA', (W, H), (120, 110, 90, 0)); grain.putalpha(noise)
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rounded_rectangle((L, T, R, B), radius=44, fill=255)
    im.paste(Image.alpha_composite(im, grain), (0, 0), mask)
    shade = Image.new('RGBA', (W, H), (0, 0, 0, 0)); px = shade.load()
    for x in range(G - 70, G + 70):                                                                # gutter shadow
        a = int(70 * (1 - abs(x - G) / 70) ** 2)
        for y in range(T + 4, B - 3):
            px[x, y] = (60, 50, 35, a)
    im = Image.alpha_composite(im, shade)
    ImageDraw.Draw(im).line((G, T + 2, G, B - 2), fill=INK + (255,), width=3)
    return im


def polaroid(path, rot):
    p = Image.open(path).convert('RGB'); p.thumbnail(PHOTO_BOX, Image.LANCZOS)
    pad = 14
    fr = Image.new('RGBA', (p.width + 2 * pad, p.height + 2 * pad), (255, 255, 255, 255))
    fr.paste(p, (pad, pad))
    ImageDraw.Draw(fr).rectangle((0, 0, fr.width - 1, fr.height - 1), outline=INK + (255,), width=3)
    out = Image.new('RGBA', (fr.width + 40, fr.height + 40), (0, 0, 0, 0)); out.paste(fr, (20, 20))
    ImageDraw.Draw(out).rectangle((out.width // 2 - 60, 8, out.width // 2 + 60, 44), fill=TAPE)  # tape
    return out.rotate(rot * 1.6, resample=Image.BICUBIC, expand=True)


items = json.load(open(SCRAPS))
os.makedirs(OUT_DIR, exist_ok=True)
pages = []
for n in range(0, len(items), 2):
    spread = book()
    for side, it in enumerate(items[n:n + 2]):
        ph = polaroid(os.path.join(PUBLIC, it['src'].lstrip('/')), it.get('rotation', 0))
        cx = (L + G) // 2 if side == 0 else (G + R) // 2
        spread.alpha_composite(ph, (cx - ph.width // 2, (T + B) // 2 - ph.height // 2))
    name = f'spread-{n // 2 + 1:02d}.webp'
    spread.save(os.path.join(OUT_DIR, name), 'WEBP', quality=82, method=6)
    first = items[n]
    pages.append({'file': name, 'title': first['note'].strip().rstrip('.')[:34], 'place': first.get('date', '')})
    print(name, round(os.path.getsize(os.path.join(OUT_DIR, name)) / 1e3), 'KB')

json.dump(pages, open(OUT_JSON, 'w'), indent=2)
print('wrote', OUT_JSON)
