"""
Builds "open sketchbook" spread images from the sketches in src/content/scraps.json,
in the exact 1760x1240 layout the ThreeUI Sketchbook engine expects
(book body x 88-1672, y 270-975, gutter at x=880, transparent margins).

Run from the project root:   python scripts/make-spreads.py
Needs:                       pip install pillow
Writes:                      public/sketchbook/spread-01.webp ...  and  src/content/sketchbookPages.json
"""
from PIL import Image, ImageDraw, ImageFilter
import json, os, random

random.seed(42)
SCRAPS = 'src/content/scraps.json'      # [{src, note, date, rotation, ...}]
PUBLIC = 'public'                        # scraps[].src is relative to this folder
OUT_DIR = 'public/sketchbook'
OUT_JSON = 'src/content/sketchbookPages.json'

INK = (23, 23, 23)
COVER = (36, 32, 28)          # dark leather cover board
PAPER = (248, 244, 236)        # warm off-white cotton sketch paper
PAPER_SHADE = (226, 220, 208)  # page edge / shade tone
PAPER_EDGE = (215, 208, 195)   # cut paper stack edge
TAPE = (227, 184, 89, 215)     # mustard washi tape
PHOTO_BOX = (620, 580)         # max photo size per page

W, H = 1760, 1240
L, T, R, B, G = 88, 270, 1672, 975, 880


def create_physical_book():
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    # 1. Under-book ambient contact shadow
    shadow_base = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow_base)
    sd.rounded_rectangle((L - 12, T + 18, R + 24, B + 32), radius=48, fill=(18, 16, 14, 90))
    sd.rounded_rectangle((L + 4, T + 24, R + 14, B + 18), radius=38, fill=(18, 16, 14, 140))
    shadow_base = shadow_base.filter(ImageFilter.GaussianBlur(16))
    im.alpha_composite(shadow_base)

    # 2. Hard Cover Board (visible at edges, extending beyond paper)
    cover_box = (L - 8, T - 4, R + 8, B + 12)
    d.rounded_rectangle(cover_box, radius=32, fill=COVER + (255,), outline=(18, 15, 12, 255), width=2)

    # 3. Stacked Paper Pages (Physical Thickness along bottom and sides)
    stack_layers = 5
    for i in range(stack_layers, 0, -1):
        offset_y = int(i * 2.2)
        offset_x = int(i * 1.5)
        layer_color = (
            int(PAPER_SHADE[0] - i * 3),
            int(PAPER_SHADE[1] - i * 3),
            int(PAPER_SHADE[2] - i * 4),
            255
        )
        d.rounded_rectangle((L - offset_x, T + offset_y, G, B + offset_y), radius=26, fill=layer_color, outline=(40, 36, 32, 180), width=1)
        d.rounded_rectangle((G, T + offset_y, R + offset_x, B + offset_y), radius=26, fill=layer_color, outline=(40, 36, 32, 180), width=1)

    # Cut paper striations along bottom edge
    for x in range(L + 20, R - 20, 3):
        h_jitter = random.randint(B + 4, B + 11)
        d.line((x, B + 1, x, h_jitter), fill=(60, 54, 46, 75), width=1)

    # 4. Main Open Spread Page Face
    d.rounded_rectangle((L, T, G + 2, B), radius=24, fill=PAPER + (255,))
    d.rounded_rectangle((G - 2, T, R, B), radius=24, fill=PAPER + (255,))
    d.rounded_rectangle((L, T, R, B), radius=24, outline=(30, 26, 22, 220), width=2)

    # 5. Page Curvature Lighting (Convex arch away from gutter)
    page_shade = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ps_px = page_shade.load()

    left_w = G - L
    for x in range(L, G):
        u = (x - L) / left_w
        for y in range(T, B):
            if u > 0.65:
                intense = ((u - 0.65) / 0.35) ** 1.8
                alpha = int(125 * intense)
                ps_px[x, y] = (35, 28, 20, alpha)
            elif u < 0.15:
                edge_intense = ((0.15 - u) / 0.15) ** 1.5
                alpha = int(55 * edge_intense)
                ps_px[x, y] = (45, 38, 30, alpha)

    right_w = R - G
    for x in range(G, R):
        u = (x - G) / right_w
        for y in range(T, B):
            if u < 0.35:
                intense = ((0.35 - u) / 0.35) ** 1.8
                alpha = int(125 * intense)
                ps_px[x, y] = (35, 28, 20, alpha)
            elif u > 0.85:
                edge_intense = ((u - 0.85) / 0.15) ** 1.5
                alpha = int(55 * edge_intense)
                ps_px[x, y] = (45, 38, 30, alpha)

    for y in range(T, T + 30):
        t_intense = ((T + 30 - y) / 30) ** 1.5
        for x in range(L, R):
            current = ps_px[x, y]
            a = min(255, current[3] + int(40 * t_intense))
            ps_px[x, y] = (40, 32, 24, a)

    for y in range(B - 35, B):
        b_intense = ((y - (B - 35)) / 35) ** 1.5
        for x in range(L, R):
            current = ps_px[x, y]
            a = min(255, current[3] + int(50 * b_intense))
            ps_px[x, y] = (40, 32, 24, a)

    im.alpha_composite(page_shade)

    # 6. Deep Spine Crease & Stitching
    d.line((G - 1, T + 2, G - 1, B - 2), fill=(20, 16, 12, 190), width=2)
    d.line((G, T + 2, G, B - 2), fill=(10, 8, 6, 240), width=2)
    d.line((G + 1, T + 2, G + 1, B - 2), fill=(20, 16, 12, 190), width=2)

    for y in range(T + 40, B - 30, 65):
        d.ellipse((G - 3, y - 5, G + 3, y + 5), fill=(45, 38, 30, 220))
        d.ellipse((G - 1, y - 3, G + 1, y + 3), fill=(18, 14, 10, 255))
        d.line((G, y - 8, G, y + 8), fill=(230, 220, 195, 180), width=1)

    # 7. Paper Grain
    noise = Image.effect_noise((W, H), 24).convert('L').point(lambda v: int(v * 0.08))
    grain = Image.new('RGBA', (W, H), (140, 125, 105, 0))
    grain.putalpha(noise)
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rounded_rectangle((L, T, R, B), radius=24, fill=255)
    im.paste(Image.alpha_composite(im, grain), (0, 0), mask)

    # 8. Curled outer corners
    corner_shade = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    cs_draw = ImageDraw.Draw(corner_shade)
    cs_draw.polygon([(L + 2, B - 40), (L + 45, B - 2), (L + 4, B - 4)], fill=(25, 20, 15, 70))
    cs_draw.polygon([(R - 45, B - 2), (R - 2, B - 40), (R - 4, B - 4)], fill=(25, 20, 15, 70))
    corner_shade = corner_shade.filter(ImageFilter.GaussianBlur(4))
    im.alpha_composite(corner_shade)

    return im


def create_scrap_photo(path, rot):
    p = Image.open(path).convert('RGB')
    p.thumbnail(PHOTO_BOX, Image.LANCZOS)
    pad = 12

    card_w = p.width + 2 * pad
    card_h = p.height + 2 * pad

    card = Image.new('RGBA', (card_w, card_h), (255, 253, 248, 255))
    cd = ImageDraw.Draw(card)
    card.paste(p, (pad, pad))
    cd.rectangle((0, 0, card_w - 1, card_h - 1), outline=(40, 36, 30, 220), width=2)
    cd.rectangle((pad - 1, pad - 1, pad + p.width, pad + p.height), outline=(0, 0, 0, 40), width=1)

    shadow_margin = 30
    canvas_w = card_w + shadow_margin * 2
    canvas_h = card_h + shadow_margin * 2
    composite = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))

    shadow = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rectangle((shadow_margin + 4, shadow_margin + 8, shadow_margin + card_w + 6, shadow_margin + card_h + 12), fill=(25, 20, 15, 85))
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    composite.alpha_composite(shadow)

    composite.paste(card, (shadow_margin, shadow_margin))

    tape_w = 110
    tape_h = 34
    tape = Image.new('RGBA', (tape_w, tape_h), TAPE)
    td = ImageDraw.Draw(tape)
    for _ in range(12):
        ty = random.randint(4, tape_h - 4)
        td.line((0, ty, tape_w, ty), fill=(245, 210, 130, 50), width=1)
    for i in range(tape_h):
        if i % 3 == 0:
            td.point((0, i), fill=(0, 0, 0, 0))
            td.point((tape_w - 1, i), fill=(0, 0, 0, 0))

    tape_x = (canvas_w - tape_w) // 2
    tape_y = shadow_margin - 14
    composite.alpha_composite(tape, (tape_x, tape_y))

    return composite.rotate(rot * 1.5, resample=Image.BICUBIC, expand=True)


items = json.load(open(SCRAPS))
os.makedirs(OUT_DIR, exist_ok=True)
pages = []

for n in range(0, len(items), 2):
    spread = create_physical_book()
    for side, it in enumerate(items[n:n + 2]):
        ph = create_scrap_photo(os.path.join(PUBLIC, it['src'].lstrip('/')), it.get('rotation', 0))
        cx = (L + G) // 2 if side == 0 else (G + R) // 2
        spread.alpha_composite(ph, (cx - ph.width // 2, (T + B) // 2 - ph.height // 2))
    name = f'spread-{n // 2 + 1:02d}.webp'
    spread.save(os.path.join(OUT_DIR, name), 'WEBP', quality=82, method=6)
    first = items[n]
    pages.append({'file': name, 'title': first['note'].strip().rstrip('.')[:34], 'place': first.get('date', '')})
    print(name, round(os.path.getsize(os.path.join(OUT_DIR, name)) / 1e3), 'KB')

json.dump(pages, open(OUT_JSON, 'w'), indent=2)
print('wrote', OUT_JSON)
