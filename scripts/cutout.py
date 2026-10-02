"""Cut sprites out of a generated sheet and save each one as a transparent PNG.

Dev-only. Needs numpy, pillow and scipy (pip install numpy pillow scipy).

Usage:
  python3 scripts/cutout.py <sheet.png> <out-dir> <name> [<name>...] [--rows N] [--row R] [--pieces]

Sprites are found left to right. Names are applied in that order.
  --rows N    the sheet has N rows; only row R (0-based, default 0) is cut
  --pieces    keep every separate piece as its own sprite instead of merging a
              column's pieces into one (used for egg shells: cap and base)
"""

import argparse
import os

import numpy as np
from PIL import Image
from scipy import ndimage

SOFT_LOW, SOFT_HIGH = 10, 40  # colour distance from the background: 0 alpha below, full alpha above
PAD = 16


def alpha_mask(rgb):
    h, w, _ = rgb.shape
    border = np.concatenate([rgb[:8].reshape(-1, 3), rgb[-8:].reshape(-1, 3),
                             rgb[:, :8].reshape(-1, 3), rgb[:, -8:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    dist = np.linalg.norm(rgb - bg, axis=2)

    # Background is only what is connected to the border, so pale interiors
    # (eye highlights, mint bellies) stay opaque.
    near_bg = dist < SOFT_HIGH
    labels, _ = ndimage.label(near_bg)
    edge_labels = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    outside = np.isin(labels, edge_labels[edge_labels > 0])

    alpha = np.ones((h, w))
    ramp = np.clip((dist - SOFT_LOW) / (SOFT_HIGH - SOFT_LOW), 0, 1)
    alpha[outside] = ramp[outside]
    return alpha, bg


def unblend(rgb, alpha, bg):
    a = alpha[..., None]
    fg = np.where(a > 0, (rgb - bg * (1 - a)) / np.maximum(a, 1e-3), 0)
    return np.dstack([np.clip(fg, 0, 255), alpha * 255]).astype('uint8')


def main():
    p = argparse.ArgumentParser()
    p.add_argument('sheet')
    p.add_argument('out_dir')
    p.add_argument('names', nargs='+')
    p.add_argument('--rows', type=int, default=1)
    p.add_argument('--row', type=int, default=0)
    p.add_argument('--pieces', action='store_true')
    args = p.parse_args()

    rgb = np.asarray(Image.open(args.sheet).convert('RGB')).astype(float)
    alpha, bg = alpha_mask(rgb)
    rgba = unblend(rgb, alpha, bg)

    solid = ndimage.binary_opening(alpha > 0.5, iterations=2)
    labels, count = ndimage.label(solid)
    boxes = ndimage.find_objects(labels)
    sizes = ndimage.sum(solid, labels, range(1, count + 1))
    keep = [i for i in range(count) if sizes[i] > solid.size * 0.001]  # drop specks

    # Split into rows by vertical centre, then keep the requested row.
    h = rgb.shape[0]
    top = min(boxes[i][0].start for i in keep)
    bottom = max(boxes[i][0].stop for i in keep)
    band = (bottom - top) / args.rows
    def row_of(i):
        centre = (boxes[i][0].start + boxes[i][0].stop) / 2
        return min(int((centre - top) // band), args.rows - 1)
    keep = [i for i in keep if row_of(i) == args.row]

    # Group pieces that overlap horizontally into one sprite (e.g. wings and body).
    groups = []
    for i in sorted(keep, key=lambda i: boxes[i][1].start):
        x0, x1 = boxes[i][1].start, boxes[i][1].stop
        if not args.pieces and groups and x0 < groups[-1]['x1']:
            groups[-1]['ids'].append(i)
            groups[-1]['x1'] = max(groups[-1]['x1'], x1)
        else:
            groups.append({'ids': [i], 'x1': x1})

    if len(groups) != len(args.names):
        raise SystemExit(f'Found {len(groups)} sprites but got {len(args.names)} names')

    os.makedirs(args.out_dir, exist_ok=True)
    for name, g in zip(args.names, groups):
        ys = [boxes[i][0] for i in g['ids']]
        xs = [boxes[i][1] for i in g['ids']]
        y0 = max(min(s.start for s in ys) - PAD, 0)
        y1 = min(max(s.stop for s in ys) + PAD, h)
        x0 = max(min(s.start for s in xs) - PAD, 0)
        x1 = min(max(s.stop for s in xs) + PAD, rgb.shape[1])
        # Only keep pixels that belong to this group, so neighbours never bleed in.
        grown = ndimage.binary_dilation(np.isin(labels, [i + 1 for i in g["ids"]]), iterations=4)
        crop = rgba[y0:y1, x0:x1].copy()
        crop[..., 3] = np.where(grown[y0:y1, x0:x1], crop[..., 3], 0)
        path = os.path.join(args.out_dir, f'{name}.png')
        Image.fromarray(crop).save(path)
        print(f'{path}  {crop.shape[1]}x{crop.shape[0]}')


if __name__ == '__main__':
    main()
