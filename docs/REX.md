# REX — mémoire des agents

> GÉNÉRÉ depuis docs/rex.jsonl par `python3 scripts/rex.py render` : ne pas éditer à la main.
> Ajouter une leçon : `python3 scripts/rex.py add ...`. Brief d'un agent : `python3 scripts/rex.py brief <role>`.

## Leçons
- **R001 · ui · 2026-11-24** — Refaire un écran ne retire jamais de fonction : dresser la liste des fonctions de l'ancien, lancer scripts/qa-inventaire.py, rétablir ou demander.
  - Symptôme : Régression du 24/11 : camembert, barres, tuiles cliquables, bouton Nouveau coffret et panier moyen disparus après refonte.
  - Cause : Les agents ont refait des écrans sans inventorier les fonctions de l'ancien.
  - Contrôle : `scripts/qa-inventaire.py`
- **R002 · maquette · 2026-11-24** — Une maquette se montre en PNG (SendUserFile), jamais via Vercel ; elle reprend les vrais pictos Illu, libellés et données ; validée, elle est reproduite à l'identique.
  - Symptôme : Maquettes envoyées via Vercel ou illisibles, sans les vrais dessins.
  - Cause : Pas de rendu image ni de vraies données.
- **R003 · maquette · 2026-11-24** — Contrôle d'alignement par script avant envoi ; mêmes gabarits de tuile (libellé 2 lignes, valeur, jauge, détail).
  - Symptôme : Colonnes décalées, textes coupés, tuiles dont la valeur n'est pas sur la même ligne.
  - Cause : Alignement jugé à l'œil.
  - Contrôle : `scripts/qa-maquettes-alignement.js`
- **R004 · ui · 2026-11-24** — Chiffres de même hauteur : lining-nums global dans l'app ; en maquette HTML, chiffres et ponctuation numérique en Work Sans (unicode-range).
  - Symptôme : Chiffres « à l'ancienne » (le 5 plus haut que le 1).
  - Cause : Raleway est old-style par défaut.
- **R005 · donnees · 2026-11-24** — Coût/unité = achat au kg × poids du conditionnement (grammesUnite) ; un achat à l'unité n'est jamais converti ; afficher achat saisi, coût/unité, vente/unité, marge/unité.
  - Symptôme : Marges fausses : achats au kilo et ventes à l'unité non convertis.
  - Cause : Pas de conversion kilo vers unité.
- **R006 · ui · 2026-11-24** — Le contenu principal d'abord (la recette préremplie visible sans défiler) ; les options en bas.
  - Symptôme : Fiche de fournée : recette invisible sous deux grandes cases à cocher.
  - Cause : Options placées avant le contenu principal.
- **R007 · ui · 2026-11-24** — Point d'entrée = les produits en pictogrammes comme la Caisse ; une nouvelle fournée ne préremplit rien avant le choix départ + type.
  - Symptôme : Production : liste de familles plutôt que les produits ; nouvelle fournée préremplie sans choix.
  - Cause : Point d'entrée mal pensé.
- **R008 · ui · 2026-11-24** — Jamais d'emoji : pictogrammes lucide-react ou dessins Illu.
  - Symptôme : Emoji dans l'interface.
  - Cause : Règle du propriétaire.
- **R009 · process · 2026-11-24** — Donner à l'agent la dernière base (branche à jour), brief court, numéros de lignes ; ne pas faire relire un fichier de 8 000 lignes.
  - Symptôme : Trois fusions conflictuelles en fin de refonte.
  - Cause : Les agents étaient partis d'une ancienne base.
- **R010 · process · 2026-11-24** — La QA relit avec le diff et l'ancienne version, pas avec la conclusion de l'implémenteur.
  - Symptôme : Agent de QA qui valide sa propre conclusion.
  - Cause : Relecture ancrée sur le rapport de l'implémenteur.
- **R011 · outils · 2026-11-24** — Pour une écriture en base, passer par l'écran de l'app ou prévenir le propriétaire d'accepter la confirmation ; ne jamais boucler.
  - Symptôme : Écriture SQL Supabase bloquée 230 s, annonce non publiée.
  - Cause : execute_sql en écriture exige une confirmation humaine.
- **R012 · outils · 2026-11-24** — Vérifier un déploiement en cherchant une chaîne sans accent dans les chunks de /admin.
  - Symptôme : Déploiement annoncé sans vérification fiable.
  - Cause : Chaînes accentuées encodées par le minifieur.
- **R013 · outils · 2026-11-24** — Tuer les next-server avant, compter les éléments rendus, 0 erreur JS hors React #418/#423/#425.
  - Symptôme : Test navigateur qui mesure 0 px de débordement sur un écran vide.
  - Cause : next start résiduel ou écran planté.
- **R014 · process · 2026-11-24** — Ne jamais retirer du contenu existant sans le demander ; ajouter, pas remplacer.
  - Symptôme : Fonctions de l'app retirées sans demande.
  - Cause : Réflexe de simplifier.
- **R016 · process · 2026-11-24** — Avant d'annoncer qu'un écran est fait : capture PLEINE PAGE 1280 et 390 px, comparée image contre image à la maquette par l'agent qa-regression (liste d'écarts BLOQUANT/MOYEN/MINEUR) ; on ne dit « conforme » que quand la liste est vide.
  - Symptôme : Fiche de fournée, coffrets et Production annoncés « faits » alors que les écrans n'étaient pas conformes aux maquettes validées (résumé collant, fiche sanitaire dans la page, tuiles de suivi, disposition deux colonnes).
  - Cause : Aucun contrôle de conformité maquette contre capture avant d'annoncer ; tests limités au fonctionnement.
- **R017 · process · 2026-11-24** — Une page = un implémenteur dans son worktree, puis qa-regression sur le résultat, puis correction ; l'orchestrateur ne code pas à la place des agents.
  - Symptôme : Un agent unique code seul plusieurs pages d'un coup.
  - Cause : Pas de boucle implémenteur puis contrôle.
- **R018 · outils · 2026-11-24** — Tuer uniquement son propre next-server (pid retrouvé par le port ou le répertoire de travail), jamais pkill global quand plusieurs agents tournent ; capture pleine page : .pro-content{height:auto;overflow:visible} ; formats de fournée valides en test : pot et kit.
  - Symptôme : Un test navigateur sert un ancien build ; un pkill tue le serveur d'un autre agent.
  - Cause : Le processus s'appelle next-server (pkill -f "next start -p PORT" ne le trouve pas) ; deux agents partagent les noms de processus.
- **R019 · process · 2026-11-24** — Un point de comportement (sticky, défilement, clic) se vérifie en le mesurant dans le navigateur (position après défilement), pas par grep ni sur une capture ; l'orchestrateur recoupe les points bloquants du contrôle avant de renvoyer un chantier.
  - Symptôme : Le contrôle qa-regression a signalé « aucun sticky » alors que le résumé collant fonctionnait.
  - Cause : Il a cherché position: sticky dans le JSX alors que la règle est dans le CSS (.fiche-side) ; une capture pleine page ne montre pas un sticky.
- **R020 · tokens · 2026-11-24** — Un brief d'agent = 3 à 5 lignes (écran, maquette, port) + « lis docs/BRIEF-COMMUN.md » ; vérifier un écran avec la commande `NODE_PATH=/opt/node-tools/node_modules node scripts/verif-ecran.js <ecran>` (captures pleine page 1280 et 390, éléments rendus, débordement, erreurs JS) au lieu d'écrire un script.
  - Symptôme : Chaque agent recevait un brief de 2 000 jetons recopié par l'orchestrateur ; chaque écran réécrivait un script Playwright de 80 lignes.
  - Cause : Pas de brief commun ni de script de vérification partagés.
  - Contrôle : `scripts/verif-ecran.js`
- **R021 · tokens · 2026-11-24** — Lire une image une seule fois par cycle (maquette, puis capture finale) ; pour les contrôles de routine, se fier aux mesures chiffrées de verif-ecran.js ; en itération, lint seulement ; UN seul npm run build avant le test final (≈ 1 min) ; rapports d'agents de 15 lignes maximum.
  - Symptôme : Images relues plusieurs fois, builds complets à chaque retouche.
  - Cause : Vérification par réflexe plutôt que par mesure.
- **R022 · process · 2026-11-24** — Plusieurs écrans indépendants = plusieurs agents en parallèle dans des worktrees, une seule fusion, une seule passe de contrôle, un seul déploiement ; les agents se contrôlent eux-mêmes (captures contre maquette) avant de rendre.
  - Symptôme : Écrans livrés l'un après l'autre avec une fusion, un contrôle et un déploiement chacun.
  - Cause : Séquentiel par habitude.
- **R023 · process · 2026-11-24** — Les fixtures de scripts/fixtures-admin.js suivent la forme BRUTE des RPC ; un écran de liste se contrôle toujours avec des données (au moins 4 lignes), jamais à vide.
  - Symptôme : Captures Clients et Commandes à l'état vide : le contrôle n'a rien pu vérifier.
  - Cause : Les fixtures de test avaient la forme déjà transformée alors que les RPC renvoient des lignes brutes (ref, items_count, created_at, opt_in…).

## Idées / suggestions
- **R015 · ui · 2026-11-24** — Signaler « sans dessin » sur le produit validé, puis l'agent illustrateur dessine dans le style Illu et le propriétaire valide sur une planche.
  - Symptôme : Produit sans dessin après validation.
