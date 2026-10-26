"""Reproducible licensed, local atlas assets. Not a physical astronomy renderer.

Requires Python 3, Pillow, NumPy and fonttools. Source maps are CC BY 4.0.
Outputs sphere projections with illustrative directional lighting, plus tilted,
schematic Saturn rings. Portraits are explicitly not spacecraft photographs.
"""
from pathlib import Path
import json
import subprocess
import tempfile
import hashlib
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
for folder in ["textures", "images", "fonts", "licenses"]:
    (PUBLIC / folder).mkdir(parents=True, exist_ok=True)
MANIFEST = []
BASE = "https://www.solarsystemscope.com/textures/"
MAPS = {
    "mercury": "2k_mercury.jpg", "venus": "2k_venus_atmosphere.jpg",
    "earth": "2k_earth_daymap.jpg", "mars": "2k_mars.jpg",
    "jupiter": "2k_jupiter.jpg", "saturn": "2k_saturn.jpg",
    "uranus": "2k_uranus.jpg", "neptune": "2k_neptune.jpg"
}


def fetch(url, destination, referer=None):
    args = ["curl", "-sS", "-L", "--fail", "--retry", "2", "--max-time", "60", "-A", "Mozilla/5.0"]
    if referer:
        args += ["-e", referer]
    subprocess.run(args + [url, "-o", str(destination)], check=True)


def record(filename, source, creator, license, attribution, modifications):
    p = PUBLIC / filename
    MANIFEST.append({"filename": f"public/{filename}", "sourceUrl": source,
                     "creator": creator, "license": license,
                     "attribution": attribution, "modifications": modifications,
                     "verified": "2026-10-17", "bytes": p.stat().st_size,
                     "sha256": hashlib.sha256(p.read_bytes()).hexdigest()})


def sphere(texture, size=900, ring=None):
    # Orthographic sphere. Fixed lighting and orientation are artistic, not ephemerides.
    tex = np.asarray(texture.convert("RGB"), dtype=float)
    w = size
    h = size if ring is None else int(size * .76)
    radius = size * (.475 if ring is None else .235)
    yy, xx = np.mgrid[0:h, 0:w]
    x, y = (xx - w / 2) / radius, -(yy - h / 2) / radius
    # Rotate the portrait by 20 degrees; ring plane shares this orientation.
    angle = np.radians(-22 if ring is not None else -9)
    u, v = np.cos(angle) * x + np.sin(angle) * y, -np.sin(angle) * x + np.cos(angle) * y
    mask = x*x + y*y <= 1
    z = np.sqrt(np.clip(1 - x*x - y*y, 0, 1))
    lon = (np.arctan2(u, z) / (2*np.pi) + .54) % 1
    lat = np.arccos(np.clip(v, -1, 1)) / np.pi
    sampled = tex[(lat * (tex.shape[0] - 1)).astype(int), (lon * (tex.shape[1] - 1)).astype(int)]
    light = np.clip(-.62*x + .44*y + .65*z, 0, 1)
    shade = .065 + .92 * light**.78
    rgb = np.clip(sampled * shade[..., None], 0, 255)
    alpha = np.clip((1 - np.sqrt(x*x+y*y)) * radius, 0, 1) * 255
    out = np.dstack([rgb, alpha]).astype(np.uint8)
    if ring is not None:
        # Project concentric rings with the actual licensed radial color/alpha strip.
        # Relative extent is illustrative; sphere radius and ring scale are not measured here.
        ring_data = np.asarray(ring.convert("RGBA"), dtype=float)
        ring_r = np.sqrt(u*u + (v/.40)**2)
        ring_mask = (ring_r > 1.27) & (ring_r < 2.10)
        t = np.clip((ring_r - 1.27) / .83, 0, 1)
        sample = ring_data[ring_data.shape[0]//2, (t * (ring_data.shape[1]-1)).astype(int)]
        brightness = np.clip(.73 - .12*u + .10*v, .28, 1)
        sample[..., :3] *= brightness[..., None]
        sample[..., 3] *= ring_mask
        # Front half composites over the sphere; transparent ring gaps must NOT
        # erase the globe. Back half is hidden by the globe's silhouette.
        visible = ring_mask & ((v < 0) | ~mask)
        src_alpha = sample[..., 3] / 255 * visible
        dst_alpha = out[..., 3].astype(float) / 255
        final_alpha = src_alpha + dst_alpha * (1-src_alpha)
        final_rgb = (sample[..., :3] * src_alpha[..., None] + out[..., :3] * dst_alpha[..., None] * (1-src_alpha[..., None])) / np.maximum(final_alpha[..., None], .000001)
        out = np.dstack([np.clip(final_rgb, 0, 255), final_alpha * 255]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


with tempfile.TemporaryDirectory(prefix="afterlight-assets-") as tmp:
    tmp = Path(tmp)
    ringfile = tmp / "rings.png"
    fetch(BASE + "download/2k_saturn_ring_alpha.png", ringfile, BASE)
    ring = Image.open(ringfile).convert("RGBA")
    ring.save(PUBLIC / "textures/saturn-rings.webp", "WEBP", lossless=True)
    record("textures/saturn-rings.webp", BASE + "download/2k_saturn_ring_alpha.png", "Solar System Scope", "CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/", "Solar System Scope (CC BY 4.0)", "Converted PNG to lossless WebP.")
    for name, filename in MAPS.items():
        f = tmp / filename
        fetch(BASE + "download/" + filename, f, BASE)
        image = Image.open(f).convert("RGB")
        assert image.width >= 1024, "A download must be an actual texture, not an HTML error page"
        image.resize((1536, 768), Image.Resampling.LANCZOS).save(PUBLIC / f"textures/{name}.webp", "WEBP", quality=85)
        sphere(image, 1200 if name == "saturn" else 900, ring if name == "saturn" else None).save(PUBLIC / f"images/{name}.webp", "WEBP", quality=88)
        # Circle-only Saturn for mathematically scaled comparison diagrams.
        if name == "saturn":
            sphere(image).save(PUBLIC / "images/saturn-globe.webp", "WEBP", quality=88)
            record("images/saturn-globe.webp", BASE + "download/" + filename, "Solar System Scope; projection by AFTERLIGHT", "CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/", "Texture: Solar System Scope (CC BY 4.0). Illustrative projection: AFTERLIGHT.", "Orthographic, ring-free portrait for diameter diagrams; artistic lighting; WebP encoding.")
        for target, changes in [(f"textures/{name}.webp", "Resized from 2048 to 1536 pixels wide; WebP encoding."), (f"images/{name}.webp", "Orthographic sphere projection with illustrative lighting and artistic orientation; transparent WebP. Saturn adds schematic rings using the separately credited ring strip.")]:
            record(target, BASE + "download/" + filename, "Solar System Scope; projection by AFTERLIGHT" if target.startswith("images") else "Solar System Scope", "CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/", "Solar System Scope (CC BY 4.0); rendered portraits are illustrations, not spacecraft photographs.", changes)
        print(name, image.size, flush=True)

    FONT_BASE = "https://raw.githubusercontent.com/google/fonts/main/ofl/"
    fonts = [
        ("instrumentserif", "InstrumentSerif-Regular.ttf", "instrument-serif", "Instrument Serif Project Authors"),
        ("instrumentserif", "InstrumentSerif-Italic.ttf", "instrument-serif-italic", "Instrument Serif Project Authors"),
        ("dmsans", "DMSans%5Bopsz%2Cwght%5D.ttf", "dm-sans", "DM Sans Project Authors"),
        ("ibmplexmono", "IBMPlexMono-Regular.ttf", "ibm-plex-mono", "IBM Corp.")
    ]
    from fontTools import subset
    for folder, original, name, creator in fonts:
        url = FONT_BASE + folder + "/" + original
        ttf = tmp / f"{name}.ttf"
        fetch(url, ttf)
        options = subset.Options()
        # WOFF uses bundled zlib; no native Brotli extension is required in Designer.
        options.flavor = "woff"
        font = subset.load_font(str(ttf), options)
        sub = subset.Subsetter(options)
        sub.populate(unicodes=list(range(0x20, 0x250)) + list(range(0x2000, 0x2070)) + [0x2190, 0x2192, 0x2212, 0x00D7])
        sub.subset(font)
        modifications = "Latin + punctuation subset, converted to WOFF."
        if folder == "ibmplexmono":
            # IBM reserves 'Plex'. Subsetting is a modification under OFL, so
            # rename the derivative while preserving original copyright/license.
            # https://openfontlicense.org/webfonts-and-reserved-font-names/
            names = {1: "AFTERLIGHT Journal Mono", 3: "AFTERLIGHTJournalMono-Regular-v1", 4: "AFTERLIGHT Journal Mono Regular", 6: "AFTERLIGHTJournalMono-Regular", 16: "AFTERLIGHT Journal Mono"}
            for entry in list(font["name"].names):
                if entry.nameID in names:
                    font["name"].setName(names[entry.nameID], entry.nameID, entry.platformID, entry.platEncID, entry.langID)
            modifications += " Internal family renamed AFTERLIGHT Journal Mono to respect IBM's Reserved Font Name Plex; original attribution and license retained."
        subset.save_font(font, str(PUBLIC / f"fonts/{name}.woff"), options)
        fetch(FONT_BASE + folder + "/OFL.txt", PUBLIC / f"licenses/{folder}-OFL.txt")
        record(f"fonts/{name}.woff", url, creator, "SIL Open Font License 1.1", f"License and copyright retained in public/licenses/{folder}-OFL.txt", modifications)

# Social image is a local, derived illustration; no remote image dependency.
og = Image.new("RGB", (1200, 630), "#080d12")
saturn = Image.open(PUBLIC / "images/saturn.webp").convert("RGBA").resize((870, 660))
og.paste(saturn, (460, -5), saturn)
draw = ImageDraw.Draw(og)
# Reuse the same licensed, locally hosted typefaces as the website.
draw.text((55, 58), "A F T E R L I G H T", fill="#eeeae1", font=ImageFont.truetype(str(PUBLIC / "fonts/dm-sans.woff"), 27))
draw.text((55, 205), "Find your\nnext world.", fill="#eeeae1", font=ImageFont.truetype(str(PUBLIC / "fonts/instrument-serif.woff"), 104), spacing=-10)
draw.text((55, 553), "AN INTERACTIVE ATLAS OF WORLDS", fill="#e89159", font=ImageFont.truetype(str(PUBLIC / "fonts/ibm-plex-mono.woff"), 16))
og.save(PUBLIC / "images/social.jpg", quality=88, optimize=True)
record("images/social.jpg", BASE, "AFTERLIGHT / Solar System Scope textures", "CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/", "Saturn texture and rings: Solar System Scope (CC BY 4.0). Type: locally credited OFL fonts.", "Composited derived planetary portrait and AFTERLIGHT typography using Instrument Serif, DM Sans and IBM Plex Mono; JPEG.")
original_artwork = [{"filename": filename, "sourceUrl": None, "creator": "AFTERLIGHT", "license": "Original vector artwork created for this project; no third-party imagery", "attribution": "None required", "modifications": "Original observatory symbol or schematic encounter diagram. Not a physical trajectory."} for filename in ["public/icon.svg", "src/components/mission-trajectory.tsx", "src/components/site-header.tsx"]]
(ROOT / "asset-manifest.json").write_text(json.dumps({"verified": "2026-10-17", "licenseEvidence": BASE, "visualizationNotice": "All planet portraits and scene maps are illustrative composites. Colors, lighting, rotation, ring proportions and system spacing are not calibrated observations or a physical simulation.", "assets": MANIFEST, "originalArtwork": original_artwork, "iconLibrary": {"name": "Lucide", "license": "ISC", "sourceUrl": "https://lucide.dev/license", "localLicense": "node_modules/lucide-react/LICENSE"}}, indent=2) + "\n")
(PUBLIC / "asset-manifest.json").write_text((ROOT / "asset-manifest.json").read_text())
print("Manifest:", len(MANIFEST), "assets")