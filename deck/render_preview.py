#!/usr/bin/env python3
"""Render an approximate PIL preview of each slide (background + overlay text) for visual QA.
Not pixel-identical to PowerPoint's renderer, but same coordinates/font/text -- enough to catch
overlap, clipping, or wrong-text issues before final delivery."""
import argparse
from pathlib import Path

import yaml
from PIL import Image, ImageDraw, ImageFont

FONT_PATH = r"C:\Users\phili\AppData\Local\Microsoft\Windows\Fonts\jf-openhuninn-2.1.ttf"


def resolve_color(palette, token):
    hexval = palette.get(token, token)
    return hexval.lstrip("#")


def wrap_and_draw(draw, block, palette, px_per_in):
    x = block["x"] * px_per_in
    y = block["y"] * px_per_in
    w = block["w"] * px_per_in
    h = block["h"] * px_per_in
    font_px = int(block.get("font_pt", 18) * px_per_in / 72)
    font = ImageFont.truetype(FONT_PATH, font_px)
    color = "#" + resolve_color(palette, block.get("color", "text"))
    lines = str(block["text"]).split("\n")

    line_heights = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        line_heights.append(bbox[3] - bbox[1])
    total_h = sum(line_heights) * 1.25
    cur_y = y + (h - total_h) / 2

    for line, lh in zip(lines, line_heights):
        bbox = draw.textbbox((0, 0), line, font=font)
        line_w = bbox[2] - bbox[0]
        align = block.get("align", "left")
        if align == "center":
            draw_x = x + (w - line_w) / 2
        elif align == "right":
            draw_x = x + w - line_w
        else:
            draw_x = x
        draw.text((draw_x, cur_y), line, font=font, fill=color)
        cur_y += lh * 1.25


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--spec", required=True)
    parser.add_argument("--images-dir", required=True)
    parser.add_argument("--out-dir", required=True)
    args = parser.parse_args()

    spec = yaml.safe_load(Path(args.spec).read_text(encoding="utf-8"))
    palette = spec["design_system"]["palette"]
    images_dir = Path(args.images_dir)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    for slide_spec in spec["slides"]:
        img_name = Path(slide_spec["output"]).name
        img = Image.open(images_dir / img_name).convert("RGB")
        px_per_in = img.width / spec["canvas"]["pptx_size_in"]["width"]
        draw = ImageDraw.Draw(img)
        for block in slide_spec.get("overlay_blocks", []):
            wrap_and_draw(draw, block, palette, px_per_in)
        out_path = out_dir / img_name
        img.save(out_path)
        print(f"rendered {out_path}")


if __name__ == "__main__":
    main()
