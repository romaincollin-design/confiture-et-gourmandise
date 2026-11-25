# Comme Avant : l'essentiel (chargé à chaque session)

**Qui** : Romain, propriétaire, non développeur, pressé. Français simple, réponses de 10 lignes max. « Fait » = preuve ; sinon « non vérifié ». Pas de questions déductibles. Pas d'emoji : pictogrammes lucide.
**Produit** : POS + production + boutique (Next.js, un fichier `app/boutique-ui.js`, Supabase, Vercel auto sur `main`). Boutique `/`, admin `/admin` (PIN).

## Au démarrage
1. Lis ton fichier dans `docs/claude/univers/` (nom de ta session), la section utile de `docs/claude/univers/COMMUN.md`, et tes lignes de `docs/claude/kit/A-FAIRE.md`. Rien d'autre. Détail à la demande : `grep -n` dans `docs/claude/kit/ARCHIVE-CLAUDE.md` (renvois §).
2. Une session = une section, plusieurs demandes d'affilée jusqu'à ~60 % de contexte ; puis réécris l'état dans le fichier de ta section et dis à Romain d'ouvrir la suivante. Pas de session vide.

## Règles qui ne bougent pas
1. Jamais de suppression de données Supabase ; désactiver (`active=false`). Aucune écriture en base sans accord.
2. Auditer avant de modifier ; refaire un écran ne retire aucune fonction.
3. `npm run lint` puis `npm run build` verts avant tout push ; vérifier le déploiement avant d'annoncer « en ligne ».
4. Une maquette validée se reproduit à l'identique ; on compare image contre image avant de pousser (`docs/claude/kit/MAQUETTES.md`).
5. Prix de vente jamais recalculé. Le CA se calcule seulement par `caPeriode` (règles d'argent : `univers/Gestion.md`).
6. Aucun email exigé côté client. Le stock n'est jamais affiché au client.
7. Rien ne sort à l'extérieur (mail, SMS, réseaux) sans validation de Romain.
8. Jamais de secret ni de PIN dans le dépôt.

## Retours de Romain
Il écrit `[Section] écran — problème — capture`. La session « Entrée » classe dans `A-FAIRE.md` ; elle ne corrige rien.
