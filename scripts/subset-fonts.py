# Small font cuts that keep large font files off the first load.
#   1. The masthead's Marathi mark: Anek Devanagari at weight 700, only the mark's glyphs
#      (710 KB -> about 2.6 KB).
#   2. The rupee sign: U+20B9 sits in the Latin Extended range, so one ₹ would otherwise
#      pull in each family's whole latin-ext file (Anek 81 KB, Mukta 15 KB per weight).
#      These cuts hold only ₹; tokens.css declares them after the full faces, so the
#      browser uses them for ₹ and fetches latin-ext only for other extended letters.
# Needs: pip install fonttools brotli
# Run from the repo root: python scripts/subset-mark-font.py
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

MARK = 'मेट्रो १२'  # must match .masthead__mr in src/components/Masthead.astro
RUPEE = '₹'
OUT = 'src/assets/fonts/'
ANEK_DEV = 'node_modules/@fontsource-variable/anek-devanagari/files/anek-devanagari-devanagari-standard-normal.woff2'
ANEK_EXT = 'node_modules/@fontsource-variable/anek-latin/files/anek-latin-latin-ext-standard-normal.woff2'
MUKTA_EXT = 'node_modules/@fontsource/mukta/files/mukta-latin-ext-{w}-normal.woff2'


def cut(font: TTFont, text: str, out: str) -> None:
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']  # keep conjunct and matra shaping
    options.name_IDs = ['*']
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    font.flavor = 'woff2'
    font.save(OUT + out)
    print(f'Wrote {OUT + out}')


cut(instancer.instantiateVariableFont(TTFont(ANEK_DEV), {'wght': 700, 'wdth': 100}), MARK, 'anek-devanagari-mark.woff2')
cut(TTFont(ANEK_EXT), RUPEE, 'anek-latin-rupee.woff2')  # stays variable: weight and width axes kept
for w in (400, 500, 700):
    cut(TTFont(MUKTA_EXT.format(w=w)), RUPEE, f'mukta-rupee-{w}.woff2')
