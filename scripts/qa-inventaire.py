#!/usr/bin/env python3
"""Inventaire des libellés : quels textes d'interface existaient dans l'ancienne version et ont disparu ?
Usage : git show <ancien_commit>:app/boutique-ui.js > /tmp/old.js ; python3 scripts/qa-inventaire.py /tmp/old.js app/boutique-ui.js
À lancer AVANT de proposer un écran refait : tout libellé absent doit être justifié (retiré volontairement) ou rétabli."""
import re, sys
def strs(p):
    t = open(p).read(); out = set()
    for m in re.finditer(r'>([^<>{}\n]{6,80})<', t): out.add(m.group(1).strip())
    for m in re.finditer(r'"([A-Za-zÀ-ÿ\'’ /%()·-]{8,60})"', t): out.add(m.group(1).strip())
    return out
o, n = strs(sys.argv[1]), strs(sys.argv[2])
miss = sorted(x for x in o - n if re.search(r'[a-zà-ÿ]{4}', x))
print(f"{len(o)} libellés avant, {len(n)} après, {len(miss)} disparus")
for x in miss: print(" -", x)
