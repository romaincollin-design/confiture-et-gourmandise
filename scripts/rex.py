#!/usr/bin/env python3
"""Mémoire des agents (REX) — portable : copier ce fichier + docs/rex.jsonl dans n'importe quel projet.
Source de vérité : docs/rex.jsonl (une ligne JSON par leçon). docs/REX.md est GÉNÉRÉ (python3 scripts/rex.py render).

  rex.py add --cat ui --symptome "..." --cause "..." --regle "..." [--controle scripts/x.py] [--agents implementeur-ui,qa-regression] [--type erreur|idee]
  rex.py brief <role>     brief compact injecté à un agent : sa mission + SES leçons (moins de jetons que tout relire)
  rex.py suggest          propositions d'amélioration du process (catégories qui reviennent, leçons sans contrôle automatique, idées ouvertes)
  rex.py list [--cat X]   liste courte
  rex.py render           régénère docs/REX.md
  rex.py check            valide le fichier (champs obligatoires, doublons)
"""
import argparse, collections, datetime, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "docs", "rex.jsonl"); MD = os.path.join(ROOT, "docs", "REX.md"); AGENTS = os.path.join(ROOT, ".claude", "agents")
CHAMPS = ("id", "date", "type", "cat", "symptome", "regle")

def charge():
    if not os.path.exists(DATA): return []
    with open(DATA, encoding="utf-8") as f: return [json.loads(l) for l in f if l.strip()]
def sauve(rows):
    os.makedirs(os.path.dirname(DATA), exist_ok=True)
    with open(DATA, "w", encoding="utf-8") as f:
        for r in rows: f.write(json.dumps(r, ensure_ascii=False) + "\n")
def role_corps(role):
    p = os.path.join(AGENTS, role + ".md")
    if not os.path.exists(p): return ""
    t = open(p, encoding="utf-8").read()
    return re.sub(r"^---.*?---\s*", "", t, flags=re.S).strip()

def cmd_add(a):
    rows = charge(); n = max([int(r["id"][1:]) for r in rows if re.match(r"R\d+$", r.get("id", ""))] + [0]) + 1
    r = {"id": f"R{n:03d}", "date": datetime.date.today().isoformat(), "type": a.type, "cat": a.cat, "symptome": a.symptome, "cause": a.cause or "", "regle": a.regle, "controle": a.controle or "", "agents": [x for x in (a.agents or "tous").split(",") if x]}
    rows.append(r); sauve(rows); cmd_render(a); print("ajouté", r["id"])
def cmd_brief(a):
    rows = [r for r in charge() if r["type"] == "erreur" and ("tous" in r["agents"] or a.role in r["agents"])]
    print(f"# Brief {a.role}\n{role_corps(a.role) or '(rôle non défini dans .claude/agents/)'}\n\n## Leçons à respecter ({len(rows)})")
    for r in rows: print(f"- [{r['id']}/{r['cat']}] {r['regle']}" + (f"  (contrôle : {r['controle']})" if r.get("controle") else ""))
def cmd_suggest(a):
    rows = charge(); err = [r for r in rows if r["type"] == "erreur"]; idees = [r for r in rows if r["type"] == "idee"]
    par = collections.Counter(r["cat"] for r in err); sans = [r for r in err if not r.get("controle")]
    print("# Propositions")
    for c, n in par.most_common():
        if n >= 2: print(f"- La catégorie « {c} » revient {n} fois : écrire un contrôle automatique commun (script) plutôt qu'une règle de plus.")
    for r in sans: print(f"- {r['id']} n'a pas de contrôle automatique : « {r['regle'][:90]} » → le transformer en test/script.")
    for r in idees: print(f"- Idée ouverte {r['id']} : {r['regle']}")
    if not (sans or idees or any(n >= 2 for n in par.values())): print("- Rien à proposer : toutes les leçons ont un contrôle.")
def cmd_list(a):
    for r in charge():
        if a.cat and r["cat"] != a.cat: continue
        print(f"{r['id']} {r['date']} [{r['type']}/{r['cat']}] {r['regle'][:110]}")
def cmd_render(a):
    rows = charge(); L = ["# REX — mémoire des agents", "", "> GÉNÉRÉ depuis docs/rex.jsonl par `python3 scripts/rex.py render` : ne pas éditer à la main.", "> Ajouter une leçon : `python3 scripts/rex.py add ...`. Brief d'un agent : `python3 scripts/rex.py brief <role>`.", ""]
    for typ, titre in (("erreur", "Leçons"), ("idee", "Idées / suggestions")):
        sel = [r for r in rows if r["type"] == typ]
        if not sel: continue
        L.append(f"## {titre}")
        for r in sel:
            L.append(f"- **{r['id']} · {r['cat']} · {r['date']}** — {r['regle']}")
            if r.get("symptome"): L.append(f"  - Symptôme : {r['symptome']}")
            if r.get("cause"): L.append(f"  - Cause : {r['cause']}")
            if r.get("controle"): L.append(f"  - Contrôle : `{r['controle']}`")
        L.append("")
    open(MD, "w", encoding="utf-8").write("\n".join(L)); print("docs/REX.md régénéré")
def cmd_check(a):
    rows = charge(); ok = True; vus = set()
    for r in rows:
        for c in CHAMPS:
            if not r.get(c): print("manque", c, "dans", r.get("id")); ok = False
        if r.get("id") in vus: print("doublon", r["id"]); ok = False
        vus.add(r.get("id"))
    print("OK" if ok else "à corriger"); sys.exit(0 if ok else 1)

p = argparse.ArgumentParser(); sp = p.add_subparsers(dest="c", required=True)
x = sp.add_parser("add"); x.add_argument("--cat", required=True); x.add_argument("--symptome", required=True); x.add_argument("--cause"); x.add_argument("--regle", required=True); x.add_argument("--controle"); x.add_argument("--agents"); x.add_argument("--type", default="erreur", choices=["erreur", "idee"]); x.set_defaults(f=cmd_add)
x = sp.add_parser("brief"); x.add_argument("role"); x.set_defaults(f=cmd_brief)
sp.add_parser("suggest").set_defaults(f=cmd_suggest)
x = sp.add_parser("list"); x.add_argument("--cat"); x.set_defaults(f=cmd_list)
sp.add_parser("render").set_defaults(f=cmd_render); sp.add_parser("check").set_defaults(f=cmd_check)
a = p.parse_args(); a.f(a)
