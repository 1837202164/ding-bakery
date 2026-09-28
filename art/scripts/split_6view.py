from pathlib import Path
from PIL import Image

ROOT = Path(r"F:\AIProject\game\art\views")
FACES = ["front", "back", "left", "right", "top", "bottom"]


def split_sheet(path: Path) -> None:
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    cols, rows = 3, 2
    cw, ch = w // cols, h // rows
    stem = path.name.replace("-6view.png", "").replace("_6view.png", "")
    print(f"{path.name}: {w}x{h} -> cell {cw}x{ch}")
    for i, face in enumerate(FACES):
        r, c = divmod(i, cols)
        box = (c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)
        crop = im.crop(box)
        out = path.parent / f"{stem}-{face}.png"
        crop.save(out, "PNG")
        print(f"  wrote {out.name}")


def main() -> None:
    for sheet in sorted(ROOT.rglob("*-6view.png")):
        split_sheet(sheet)
    print("done (art/views only; not synced to preview/public)")
    for p in sorted(ROOT.rglob("*.png")):
        print(p.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main()
