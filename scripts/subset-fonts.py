# Small font cuts that keep large font files off the first load.
#   1. The masthead's Marathi mark: Anek Devanagari at weight 700, only the mark's glyphs
#      (710 KB -> about 2.6 KB).
#   2. Marathi text on the pages: every Marathi station name in src/data/stations.json plus the
#      fixed phrases below, at weight 700 like the mark (a variable cut would be about 450 KB).
#   3. The rupee sign: U+20B9 sits in the Latin Extended range, so one ₹ would otherwise
#      pull in each family's whole latin-ext file (Anek 81 KB, Mukta 15 KB per weight).
#      These cuts hold only ₹; tokens.css declares them after the full faces, so the
#      browser uses them for ₹ and fetches latin-ext only for other extended letters.
# Needs: pip install fonttools brotli
# Run from the repo root: python scripts/subset-mark-font.py
import json

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

MARK = 'मेट्रो १२'  # must match .masthead__mr in src/components/Masthead.astro
RUPEE = '₹'
# Fixed Marathi phrases used in the pages (keep in step with the .astro files that print them).
PHRASES = 'मेट्रो स्थानक कल्याण-तळोजा मेट्रो १२ सर्व स्थानके'
with open('src/data/stations.json', encoding='utf-8') as f:
    NAMES = ' '.join(s['name_mr'] for s in json.load(f)['stations'])
OUT = 'src/assets/fonts/'
ANEK_DEV = 'node_modules/@fontsource-variable/anek-devanagari/files/anek-devanagari-devanagari-standard-normal.woff2'
ANEK_EXT = 'node_modules/@fontsource-variable/anek-latin/files/anek-latin-latin-ext-standard-normal.woff2'
MUKTA_EXT = 'node_modules/@fontsource/mukta/files/mukta-latin-ext-{w}-normal.woff2'


def word_glyphs(font: TTFont, text: str) -> set[str]:
    """Every glyph the shaping rules can reach from each word's own letters, word by word.

    A closure over all the letters at once keeps every conjunct the letters could form (about
    50 KB). Keeping only the final shaped glyphs drops the intermediate forms the rules pass
    through, and conjuncts then break. Per-word closure keeps exactly what these words need.
    """
    import io

    buf = io.BytesIO()
    font.flavor = None
    font.save(buf)
    data = buf.getvalue()
    names: set[str] = set()
    for word in set(text.split()):
        f = TTFont(io.BytesIO(data))
        options = subset.Options()
        options.layout_features = ['*']
        options.notdef_outline = True
        sub = subset.Subsetter(options)
        sub.populate(text=word)
        sub.subset(f)
        names.update(f.getGlyphOrder())
    return names


def cut(font: TTFont, text: str, out: str, exact: bool = False) -> None:
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']  # keep conjunct and matra shaping
    options.name_IDs = ['*']
    subsetter = subset.Subsetter(options)
    if exact:
        # Keep each word's own closure; lookups that would add other conjuncts are dropped.
        options.layout_closure = False
        subsetter.populate(text=text, glyphs=word_glyphs(font, text))
    else:
        subsetter.populate(text=text)
    subsetter.subset(font)
    font.flavor = 'woff2'
    font.save(OUT + out)
    print(f'Wrote {OUT + out}')


cut(instancer.instantiateVariableFont(TTFont(ANEK_DEV), {'wght': 700, 'wdth': 100}), MARK, 'anek-devanagari-mark.woff2')
cut(instancer.instantiateVariableFont(TTFont(ANEK_DEV), {'wght': 700, 'wdth': 100}), MARK + ' ' + PHRASES + ' ' + NAMES, 'anek-devanagari-text.woff2', exact=True)
cut(TTFont(ANEK_EXT), RUPEE, 'anek-latin-rupee.woff2')  # stays variable: weight and width axes kept
for w in (400, 500, 700):
    cut(TTFont(MUKTA_EXT.format(w=w)), RUPEE, f'mukta-rupee-{w}.woff2')
