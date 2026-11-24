"""
Make a smooth resting loop for the teen and grown dragons from one drawing.

Their generated idle strips are four separate drawings, so played back the whole
body jumps. This bends the first drawing a little each frame instead: the chest
rises and widens, the head tips, the wings and tail drift, and the eyes blink.
Writes `anim-idle.webp` next to each `anim-idle.png` for both colours.

    python3 scripts/breathing-idle.py            # write the loops
    python3 scripts/breathing-idle.py --preview DIR   # also save contact sheets

Needs numpy, pillow, scipy.
"""

import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import map_coordinates

ROOT = Path(__file__).resolve().parent.parent / 'assets' / 'images'
FRAMES = 54
FRAME_MS = 66
BLINK_AT = 36
BLINK = [0.55, 1.0, 1.0, 0.5]

# Landmarks in pixels on each look's 624-high idle drawing.
LOOKS = {
    'grown': dict(
        cx=197, neck=172, chest=265, hips=430,
        eyes=[(162, 98, 184, 122), (208, 98, 232, 122)],
        wing_from=88, wing_band=(180, 540),
        tail=(262, 500),
        lift=4.0, widen=0.028, tilt=1.1, wing=2.6, tail_turn=2.2,
    ),
    'teen': dict(
        cx=232, neck=190, chest=270, hips=410,
        eyes=[(195, 96, 218, 127), (247, 96, 272, 127)],
        wing_from=52, wing_band=(140, 345),
        tail=(285, 455),
        lift=3.6, widen=0.03, tilt=1.2, wing=3.0, tail_turn=2.4,
    ),
}


def smooth(lo, hi, v):
    """0 at lo, 1 at hi, eased; lo may be above hi."""
    t = np.clip((v - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def closed_eyes(img, eyes, amount):
    """The drawing with its eyelids `amount` (0..1) of the way down."""
    if amount <= 0:
        return img
    out = img.copy()
    px = np.asarray(img).astype(float)
    for (x0, y0, x1, y1) in eyes:
        # Skin colour from just outside the eye; the darkest eye colour for the lash line.
        ring = np.concatenate([
            px[y0 - 5:y0 - 2, x0:x1].reshape(-1, 4),
            px[y0:y1, x0 - 5:x0 - 3].reshape(-1, 4),
            px[y0:y1, x1 + 3:x1 + 5].reshape(-1, 4),
        ])
        skin = tuple(int(v) for v in np.median(ring[:, :3], axis=0)) + (255,)
        inside = px[y0:y1, x0:x1, :3].reshape(-1, 3)
        dark = tuple(int(v) for v in inside[inside.sum(axis=1).argmin()]) + (255,)

        k = 6  # draw big, shrink for soft edges
        w, h = (x1 - x0 + 8) * k, (y1 - y0 + 8) * k
        lid_bottom = (4 + (y1 - y0) * amount) * k
        mask = Image.new('L', (w, h), 0)
        m = ImageDraw.Draw(mask)
        m.ellipse([2 * k, 2 * k, w - 2 * k, h - 2 * k], fill=255)
        m.rectangle([0, lid_bottom, w, h], fill=0)
        patch = Image.new('RGBA', (w, h), skin)
        d = ImageDraw.Draw(patch)
        # The lash line sits on the lid's edge and curves like a closed, smiling eye.
        sag = 3.2 * k * amount
        d.arc(
            [3.5 * k, lid_bottom - 2 * sag - 1.2 * k, w - 3.5 * k, lid_bottom],
            20, 160, fill=dark, width=int(1.7 * k),
        )
        lash = Image.new('L', (w, h), 0)
        ImageDraw.Draw(lash).arc(
            [3.5 * k, lid_bottom - 2 * sag - 1.2 * k, w - 3.5 * k, lid_bottom],
            20, 160, fill=255, width=int(1.7 * k),
        )
        mask = Image.fromarray(np.maximum(np.asarray(mask), np.asarray(lash)))
        mask = mask.filter(ImageFilter.GaussianBlur(k * 0.5))
        small = patch.resize((w // k, h // k), Image.LANCZOS)
        small_mask = mask.resize((w // k, h // k), Image.LANCZOS)
        # Never paint outside the dragon.
        alpha = img.crop((x0 - 4, y0 - 4, x0 - 4 + w // k, y0 - 4 + h // k)).split()[3]
        small_mask = Image.fromarray(
            (np.asarray(small_mask).astype(float) * np.asarray(alpha) / 255).astype(np.uint8)
        )
        out.paste(small, (x0 - 4, y0 - 4), small_mask)
    return out


def frame(img, p, i):
    """One frame of the loop; `i` is the frame number for the blink."""
    blink = BLINK[i - BLINK_AT] if BLINK_AT <= i < BLINK_AT + len(BLINK) else 0
    src = np.asarray(closed_eyes(img, p['eyes'], blink)).astype(float)
    # Premultiply so soft edges do not pick up fringe colour when bent.
    src[..., :3] *= src[..., 3:4] / 255
    h, w = src.shape[:2]
    y, x = np.mgrid[0:h, 0:w].astype(float)
    phase = 2 * math.pi * i / FRAMES
    breath = (1 - math.cos(phase)) / 2

    sx, sy = x.copy(), y.copy()
    cx = p['cx']

    # Tail drifts around its base.
    tx, ty = p['tail']
    tail_w = smooth(tx, tx + 45, x) * smooth(ty - 25, ty + 25, y)
    a = math.radians(p['tail_turn']) * math.sin(phase + 2.0) * tail_w
    dx, dy = sx - tx, sy - ty
    sx = tx + dx * np.cos(a) + dy * np.sin(a)
    sy = ty - dx * np.sin(a) + dy * np.cos(a)

    # Wings drift out and in, a beat behind the chest.
    top, bottom = p['wing_band']
    wing_w = smooth(p['wing_from'], p['wing_from'] + 70, np.abs(x - cx))
    wing_w *= smooth(top - 30, top + 30, y) * smooth(bottom + 30, bottom - 30, y)
    sx -= np.sign(x - cx) * p['wing'] * math.sin(phase - 0.9) * wing_w

    # Head tips around the base of the neck.
    head_w = smooth(p['neck'], p['neck'] - 45, y)
    a = math.radians(p['tilt']) * math.sin(phase + 0.6) * head_w
    dx, dy = sx - cx, sy - p['neck']
    sx = cx + dx * np.cos(a) + dy * np.sin(a)
    sy = p['neck'] - dx * np.sin(a) + dy * np.cos(a)

    # Chest widens as it fills.
    swell = 1 + p['widen'] * breath * np.exp(-((y - p['chest']) / 70) ** 2)
    sx = cx + (sx - cx) / swell

    # Everything above the hips rises with the breath.
    sy += p['lift'] * breath * smooth(p['hips'], p['chest'], y)

    out = np.stack(
        [map_coordinates(src[..., c], [sy, sx], order=1, mode='constant', cval=0) for c in range(4)],
        axis=-1,
    )
    alpha = out[..., 3:4]
    out[..., :3] = np.where(alpha > 0, out[..., :3] * 255 / np.maximum(alpha, 1e-6), 0)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA')


def main():
    preview = Path(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[1] == '--preview' else None
    for colour in ('dragon', 'dragon-blue'):
        for look, p in LOOKS.items():
            still = ROOT / colour / look / 'anim-idle.png'
            img = Image.open(still).convert('RGBA')
            frames = [frame(img, p, i) for i in range(FRAMES)]
            out = still.with_suffix('.webp')
            frames[0].save(
                out, save_all=True, append_images=frames[1:], duration=FRAME_MS, loop=0,
                lossless=False, quality=88, method=4, minimize_size=True,
            )
            print(out.relative_to(ROOT), f'{out.stat().st_size // 1024} KB')
            if preview:
                picks = [0, FRAMES // 4, FRAMES // 2, BLINK_AT, BLINK_AT + 1, FRAMES * 3 // 4]
                sheet = Image.new('RGBA', (img.width * len(picks), img.height), (255, 255, 255, 255))
                for n, i in enumerate(picks):
                    sheet.paste(frames[i], (n * img.width, 0), frames[i])
                sheet.save(preview / f'breathing-{colour}-{look}.png')


if __name__ == '__main__':
    main()
