"""
Recolours the lavender dragon art into another colour, keeping the gold horns, mint belly
and all the shading. Works on stills (.png) and animated loops (.webp), writing the same
tree under the output folder.

  python3 scripts/recolour.py blue assets/images/dragon assets/images/dragon-blue
  python3 scripts/recolour.py pink assets/images/dragon assets/images/dragon-pink

Needs numpy and pillow. Only pixels whose hue sits in the lavender band are shifted, so
anything gold, mint, white or dark stays as drawn. The WebP settings match video-cutout.py.
"""

import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageSequence

# How far round the colour wheel each colour sits from lavender (degrees).
COLOURS = {'blue': -45, 'pink': 60, 'mint': -120}
# The lavender band: hue in degrees, and the minimum saturation (0-255) so greys stay put.
BAND = (230, 310)
MIN_SAT = 25
FALLBACK_FRAME_MS = round(1000 / 15)


def shift(frame: Image.Image, delta: int) -> Image.Image:
    rgba = frame.convert('RGBA')
    alpha = rgba.getchannel('A')
    hsv = np.asarray(rgba.convert('RGB').convert('HSV')).astype(np.int16)
    hue = hsv[..., 0].astype(np.float32) * 360 / 255
    lavender = (hue >= BAND[0]) & (hue <= BAND[1]) & (hsv[..., 1] > MIN_SAT)
    hue[lavender] = (hue[lavender] + delta) % 360
    hsv[..., 0] = np.round(hue * 255 / 360).astype(np.int16)
    out = Image.frombytes('HSV', rgba.size, hsv.astype(np.uint8).tobytes()).convert('RGBA')
    out.putalpha(alpha)
    return out


def recolour_file(src: str, dst: str, delta: int):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with Image.open(src) as im:
        if src.endswith('.webp') and getattr(im, 'n_frames', 1) > 1:
            frames, durations = [], []
            for frame in ImageSequence.Iterator(im):
                frames.append(shift(frame, delta))
                durations.append(frame.info.get('duration') or FALLBACK_FRAME_MS)
            frames[0].save(
                dst,
                save_all=True,
                append_images=frames[1:],
                duration=durations,
                loop=0,
                quality=72,
                alpha_quality=100,
                method=6,
            )
        else:
            shift(im, delta).save(dst)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('colour', choices=COLOURS)
    p.add_argument('src')
    p.add_argument('out')
    p.add_argument('--only', help='only files whose path contains this text')
    p.add_argument('--skip', help='leave out files whose path contains this text')
    args = p.parse_args()
    delta = COLOURS[args.colour]
    done = 0
    for root, _dirs, files in os.walk(args.src):
        for name in sorted(files):
            if not name.endswith(('.png', '.webp')):
                continue
            src = os.path.join(root, name)
            if args.only and args.only not in src:
                continue
            if args.skip and args.skip in src:
                continue
            dst = os.path.join(args.out, os.path.relpath(src, args.src))
            recolour_file(src, dst, delta)
            done += 1
            print(f'{dst}  ({os.path.getsize(dst) // 1024} KB)', flush=True)
    print(f'{done} files recoloured {args.colour}')
    return 0 if done else 1


if __name__ == '__main__':
    sys.exit(main())
