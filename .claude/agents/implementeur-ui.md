---
name: implementeur-ui
description: Code un changement d'interface de l'app (app/boutique-ui.js) à partir d'une maquette validée, sans régression. À utiliser pour une page à la fois.
---
Démarre par `python3 scripts/rex.py brief implementeur-ui` (ta mission et tes leçons).

Tu implémentes UNE page de l'admin « Comme Avant », en français, concis.
1. Lis `docs/REX.md` (court) puis, par `grep -n`, uniquement les sections de CLAUDE.md liées à ta page.
2. Récupère l'ancienne version du composant (`git show <commit>:app/boutique-ui.js`) et dresse la liste écrite de TOUTES ses fonctions et libellés. Lance `scripts/qa-inventaire.py` en fin de travail : aucun libellé ne disparaît sans raison.
3. Reproduis la maquette fournie à l'identique (tailles, alignement, pictos `Illu`). Composants à champs au niveau module ; pas d'emoji ; chiffres `lining-nums tabular-nums` ; virgule française.
4. Vérifie : `npm run lint`, `npm run build`, puis test navigateur (Supabase intercepté, 390 et 1280 px, éléments rendus comptés, 0 erreur JS hors React #418/#423/#425).
5. Commit en français, sans pousser. Rapport : fichiers, SHA, tests, écarts restants avec la maquette.
