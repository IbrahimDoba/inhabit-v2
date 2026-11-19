"""Cut the generated stage sheets into baseline-aligned PNGs and frame animations.

No images are drawn here: every frame comes from the built-in generator's
saved strips. Source sheets and prompts stay in assets/generated and prompts.
Run after generation: python3 scripts/prepare-codex-stage-art.py
"""
from pathlib import Path
import importlib.util
import json
import argparse
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('cutout', ROOT/'scripts/cutout.py')
cutout = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cutout)


def cut(im):
    rgb = np.asarray(im.convert('RGB')).astype(float)
    alpha, bg = cutout.alpha_mask(rgb)
    return Image.fromarray(cutout.unblend(rgb, alpha, bg))


def cells(path, count):
    im = Image.open(path)
    return [cut(im.crop((round(i*im.width/count), 0, round((i+1)*im.width/count), im.height))) for i in range(count)]


def bbox(im):
    return im.getchannel('A').point(lambda a: 255 if a > 100 else 0).getbbox()


def trim(im, height):
    box = bbox(im)
    if box is None:
        raise ValueError('Empty subject')
    im = im.crop(box)
    im = im.resize((max(1, round(im.width*height/im.height)), height), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (im.width+24, height+24))
    canvas.alpha_composite(im, (12,12))
    return canvas


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--stage', choices=['teen','grown','young'])
    ap.add_argument('--house', action='store_true')
    args=ap.parse_args()
    stages=[args.stage] if args.stage else [] if args.house else ['teen','grown','young']
    meta_path=ROOT/'assets/generated/codex-stage/geometry.json'
    metadata=json.loads(meta_path.read_text()) if meta_path.exists() else {}
    for stage in [s for s in stages if s != 'young']:
        out = ROOT/'assets/images/dragon'/stage
        out.mkdir(parents=True, exist_ok=True)
        for name, im in zip(['front','three-quarter','side','back'], cells(ROOT/f'assets/generated/codex-stage/{stage}-sheet.png', 4)):
            trim(im, 800).save(out/f'{name}.png')
        for name, im in zip(['neutral','happy','sleepy','proud','curious'], cells(ROOT/f'assets/generated/codex-stage/{stage}-expressions.png', 5)):
            trim(im, 600).save(out/f'{name}.png')
    for stage in stages:
        poses = ['sleep-v2'] if stage == 'young' else ['idle','walk','stroll','water','sleep']
        metadata[stage] = {}
        for pose in poses:
            frames = cells(ROOT/f'assets/generated/codex-stage/{stage}-anim-{pose}.png', 4)
            boxes = [bbox(f) for f in frames]
            # One shared crop preserves scale between frames; no per-frame stretching.
            box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
            h = 400 if pose.startswith('sleep') else 600
            w = round((box[2]-box[0])*h/(box[3]-box[1]))
            frames = [f.crop(box).resize((w,h),Image.Resampling.LANCZOS) for f in frames]
            # Small transparent perimeter avoids clipped outlines while the ground line stays fixed.
            padded=[]
            for f in frames:
                canvas=Image.new('RGBA',(w+24,h+24));canvas.alpha_composite(f,(12,12));padded.append(canvas)
            out=ROOT/'assets/images/dragon'/stage
            out.mkdir(parents=True,exist_ok=True)
            path=out/f'anim-{pose}'
            padded[0].save(path.with_suffix('.png'))
            duration=[1000,850,160,1000] if pose=='idle' else [900]*4 if pose.startswith('sleep') else [170]*4 if pose in ['walk','stroll'] else [220]*4
            padded[0].save(path.with_suffix('.webp'),save_all=True,append_images=padded[1:],duration=duration,loop=0,lossless=True,method=6)
            a=np.asarray(padded[0].getchannel('A'))
            low=a[round(a.shape[0]*.88):] > 128
            xs=np.where(low)[1]
            feet=float(xs.mean()/a.shape[1]) if len(xs) else .5
            metadata[stage][pose]={'aspect':(w+24)/(h+24),'feet':round(feet,4),'width':w+24,'height':h+24}
            print(stage,pose,metadata[stage][pose],flush=True)
    (ROOT/'assets/generated/codex-stage/geometry.json').write_text(json.dumps(metadata,indent=2)+'\n')
    if args.stage: return
    house=ROOT/'assets/images/house'
    house.mkdir(parents=True,exist_ok=True)
    for name in ['room-day','room-night']:
        Image.open(ROOT/f'assets/generated/codex-house/{name}.png').convert('RGB').resize((1200,1200),Image.Resampling.LANCZOS).save(house/f'{name}.webp',quality=90)
    for name in ['bed','rug','lamp','lamp-night']:
        trim(cut(Image.open(ROOT/f'assets/generated/codex-house/{name}.png')),420 if name!='rug' else 200).save(house/f'{name}.png')
    print('House assets prepared.')


if __name__=='__main__': main()
