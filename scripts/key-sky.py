"""Cut the flat "sky" colour out of a generated landscape layer.

Dev-only. Needs numpy, pillow and scipy (pip install numpy pillow scipy).

Usage:
  python3 scripts/key-sky.py <layer.png> <out.webp> [--width 1200] [--tile 0.12] [--denoise] [--near 38 --far 70]

The sky is the flat colour touching the top edge; only pixels connected to it
are removed, so similar colours inside the scene (flowers, mushrooms) stay.
--tile F blends the last F of the width into the start, so the layer repeats
seamlessly side by side (the output gets that much narrower).
--denoise smooths grain before keying (useful on night scenes).
"""

import argparse
import os

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage


def main():
    p = argparse.ArgumentParser()
    p.add_argument('layer')
    p.add_argument('out')
    p.add_argument('--width', type=int, default=1200)
    p.add_argument('--tile', type=float, default=0.0)
    p.add_argument('--denoise', action='store_true')
    p.add_argument('--quality', type=int, default=85)
    # Colour distance from the sky: fully sky below --near, fully scene above --far.
    # Lower both for dark scenes whose shapes sit close to the sky colour.
    p.add_argument('--near', type=float, default=38)
    p.add_argument('--far', type=float, default=70)
    args = p.parse_args()

    img = Image.open(args.layer).convert('RGB')
    if args.denoise:
        img = img.filter(ImageFilter.MedianFilter(5))
    rgb = np.asarray(img).astype(float)

    sky = np.median(rgb[:24].reshape(-1, 3), axis=0)
    dist = np.linalg.norm(rgb - sky, axis=2)

    # Only the region connected to the top edge counts as sky.
    near = dist < args.far
    labels, _ = ndimage.label(near)
    top = np.unique(labels[0][labels[0] > 0])
    is_sky_region = np.isin(labels, top)
    alpha = np.where(is_sky_region, np.clip((dist - args.near) / (args.far - args.near), 0, 1), 1.0)
    # Smooth the edge into one clean line.
    alpha = ndimage.uniform_filter(alpha, 3)
    alpha = np.clip((alpha - 0.35) / 0.4, 0, 1)

    # Edge pixels are part sky: take their colour from the solid scene just below.
    solid = alpha >= 0.98
    acc = rgb * solid[..., None]
    weight = solid.astype(float)
    for _ in range(4):
        acc = ndimage.uniform_filter(acc, (3, 3, 1)) * 9
        weight = ndimage.uniform_filter(weight, 3) * 9
    bled = acc / np.maximum(weight, 1e-6)[..., None]
    colour = np.where(solid[..., None] | (weight[..., None] == 0), rgb, bled)

    rgba = np.dstack([colour, alpha * 255])

    if args.tile > 0:
        w = rgba.shape[1]
        overlap = int(w * args.tile)
        t = (np.arange(overlap) / overlap)[None, :, None]
        head = rgba[:, :overlap] * t + rgba[:, w - overlap:] * (1 - t)
        rgba = np.concatenate([head, rgba[:, overlap:w - overlap]], axis=1)

    out = Image.fromarray(np.clip(rgba, 0, 255).astype('uint8'))
    height = round(out.height * args.width / out.width)
    out = out.resize((args.width, height), Image.LANCZOS)
    out.save(args.out, quality=args.quality, alpha_quality=100, method=6)
    print(f'{args.out}: {out.width}x{out.height}, {os.path.getsize(args.out) // 1024} KB')


if __name__ == '__main__':
    main()
