"""Turn a green-screen clip into a looping transparent animated WebP.

Dev-only. Needs ffmpeg on PATH and numpy + pillow (pip install numpy pillow).

Usage:
  python3 scripts/video-cutout.py <clip.mp4> <out.webp> [--height 480] [--fps 15] [--drop-last]

Keys by "greenness" (green minus the larger of red and blue) rather than plain
colour distance, so the dragon's mint belly and wings stay opaque. Edges get a
soft alpha ramp and green spill is removed. Every frame is cropped to the same
box so the character does not jump. --drop-last removes the final frame, which
repeats the first when a clip was generated with the same start and end image.
Also writes <out>.png, the first frame, as a still fallback.
"""

import argparse
import glob
import os
import subprocess
import tempfile

import numpy as np
from PIL import Image

OPAQUE_BELOW = 0.35  # greenness (as a share of the background's) at or below this is fully kept
CLEAR_ABOVE = 0.65   # at or above this is fully removed
PAD = 12


def key(frame: np.ndarray, bg: np.ndarray, bg_green: float) -> np.ndarray:
    rgb = frame.astype(float)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    greenness = (g - np.maximum(r, b)) / bg_green
    alpha = np.clip((CLEAR_ABOVE - greenness) / (CLEAR_ABOVE - OPAQUE_BELOW), 0, 1)
    # Video noise leaves speckles and a dotted outline in the key. Blur the
    # alpha a little, then re-sharpen it: isolated specks vanish and the edge
    # becomes one smooth line, pulled in slightly so no green fringe survives.
    blurred = alpha.copy()
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dy or dx:
                blurred += np.roll(alpha, (dy, dx), axis=(0, 1))
    blurred /= 9
    alpha = np.clip((blurred - 0.45) / 0.35, 0, 1)
    # Edge pixels are noisy blends of dragon and green. Keep their transparency but
    # give them the colour of the solid dragon just inside them ("colour bleed").
    solid = alpha >= 0.98
    acc = rgb * solid[..., None]
    weight = solid.astype(float)
    for _ in range(3):
        acc_n, weight_n = acc.copy(), weight.copy()
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)):
            acc_n += np.roll(acc, (dy, dx), axis=(0, 1))
            weight_n += np.roll(weight, (dy, dx), axis=(0, 1))
        acc, weight = acc_n, weight_n
    bled = acc / np.maximum(weight, 1e-6)[..., None]
    fg = np.where(solid[..., None] | (weight[..., None] == 0), rgb, bled)
    out = np.dstack([fg, alpha * 255])
    return np.clip(out, 0, 255).astype('uint8')


def main():
    p = argparse.ArgumentParser()
    p.add_argument('clip')
    p.add_argument('out')
    p.add_argument('--height', type=int, default=480)
    p.add_argument('--fps', type=int, default=15)
    p.add_argument('--drop-last', action='store_true')
    p.add_argument('--quality', type=int, default=72)
    args = p.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(
            ['ffmpeg', '-v', 'error', '-i', args.clip, '-vf', f'fps={args.fps}',
             os.path.join(tmp, 'f%04d.png')],
            check=True,
        )
        files = sorted(glob.glob(os.path.join(tmp, 'f*.png')))
        if args.drop_last and len(files) > 1:
            files = files[:-1]
        frames = [np.asarray(Image.open(f).convert('RGB')) for f in files]

    first = frames[0].astype(float)
    border = np.concatenate([first[:8].reshape(-1, 3), first[-8:].reshape(-1, 3),
                             first[:, :8].reshape(-1, 3), first[:, -8:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    bg_green = bg[1] - max(bg[0], bg[2])
    if bg_green < 40:
        raise SystemExit(f'Background does not look green enough: {bg}')

    keyed = [key(f, bg, bg_green) for f in frames]

    # One crop box for the whole clip.
    union = np.zeros(keyed[0].shape[:2], bool)
    for k in keyed:
        union |= k[..., 3] > 25
    ys, xs = np.where(union)
    h, w = union.shape
    y0, y1 = max(ys.min() - PAD, 0), min(ys.max() + PAD, h)
    x0, x1 = max(xs.min() - PAD, 0), min(xs.max() + PAD, w)

    scale = args.height / (y1 - y0)
    size = (round((x1 - x0) * scale), args.height)
    images = [Image.fromarray(k[y0:y1, x0:x1]).resize(size, Image.LANCZOS) for k in keyed]

    images[0].save(
        args.out,
        save_all=True,
        append_images=images[1:],
        duration=round(1000 / args.fps),
        loop=0,
        quality=args.quality,
        # Keep the transparency channel lossless-quality; a lossy alpha leaves a dotted fringe.
        alpha_quality=100,
        method=6,
    )
    images[0].save(os.path.splitext(args.out)[0] + '.png')
    kb = os.path.getsize(args.out) // 1024
    print(f'{args.out}: {len(images)} frames, {size[0]}x{size[1]}, {kb} KB')


if __name__ == '__main__':
    main()
