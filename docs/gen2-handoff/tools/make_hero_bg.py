"""Renders the hero background images: img/hero-bg-desktop.jpg and img/hero-bg-mobile.jpg.

The light is lilac on the left and blue on the right. It dips in the middle: strong on the
sides, light behind the headline and the centre of the board. The image fades to the page
colour #FDFCFB at its top and bottom, so it meets the next section with no seam. A fine dither
stops the soft gradient from banding into rings.

(Designer's script from the Gen 2 gradients package. Optional: pass an output folder as the
first argument; default is ../img next to this file.)
"""
import os
import sys
import numpy as np
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'img')
PAGE = np.array([253, 252, 251], float)          # #FDFCFB
LILAC = (168, 154, 255)
SKY = (148, 190, 255)


def smoothstep(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def render(name, w, h, glows, top_start, top_dip, top_fade, bottom_fade):
    """glows: (centre x, centre y, radius x, radius y, colour, strength); centre and radius are fractions of w/h.
    top_start/top_dip: the light starts top_start px down at the sides and top_start + top_dip px down in the middle.
    top_fade / bottom_fade: length (px) of the soft fade at the top and bottom edges."""
    y, x = np.mgrid[0:h, 0:w].astype(float)
    img = np.tile(PAGE, (h, w, 1))
    for cx, cy, rx, ry, colour, strength in glows:
        g = strength * np.exp(-(((x - cx * w) / (rx * w)) ** 2 + ((y - cy * h) / (ry * h)) ** 2) / 2)
        img = img * (1 - g[..., None]) + np.array(colour, float) * g[..., None]

    middle = 1 - ((x - w / 2) / (w / 2)) ** 2      # 1 in the centre, 0 at the sides
    top = top_start + top_dip * middle
    fade = smoothstep((y - top) / top_fade) * smoothstep((h - y) / bottom_fade)
    img = PAGE + (img - PAGE) * fade[..., None]

    rng = np.random.default_rng(7)
    img += rng.random(img.shape) - rng.random(img.shape)   # triangular dither
    Image.fromarray(np.clip(img.round(), 0, 255).astype('uint8'), 'RGB').save(
        os.path.join(OUT, name), quality=98, subsampling=0)


# Desktop 1440×920, shown bottom-anchored at 100% × 920px
render('hero-bg-desktop.jpg', 1440, 920,
       glows=[(.06, .46, .22, .26, LILAC, .26), (.94, .44, .22, .26, SKY, .24),
              (.30, .84, .26, .16, LILAC, .08), (.70, .86, .26, .16, SKY, .08)],
       top_start=80, top_dip=330, top_fade=320, bottom_fade=340)

# Mobile 390×680, shown bottom-anchored at 100% × 680px
render('hero-bg-mobile.jpg', 390, 680,
       glows=[(.00, .40, .42, .22, LILAC, .24), (1.0, .38, .42, .22, SKY, .22),
              (.28, .80, .45, .14, LILAC, .08), (.74, .84, .45, .14, SKY, .08)],
       top_start=20, top_dip=200, top_fade=180, bottom_fade=220)
