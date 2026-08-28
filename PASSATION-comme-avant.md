# Passation — Comme Avant (Romain Collin)

## Accès (tout est nécessaire pour travailler en autonomie)

- **Repo GitHub** : `romaincollin-design/confiture-et-gourmandise` (public)
- **Token GitHub** (expire oct 2026) : **ne pas stocker en clair ici — ce repo est public et GitHub bloque le push (push protection/secret scanning)**. Le token est conservé dans la mémoire inter-conversations de Claude (`conversation_search`/`recent_chats` sur les sessions précédentes de ce projet) ; sinon le redemander à Romain.
  - Push : `git push "https://x-access-token:${TOKEN}@github.com/romaincollin-design/confiture-et-gourmandise.git" main:main`
  - **Toujours passer la sortie dans `sed -E 's#https://[^@]*@#https://#g'`** pour ne jamais exposer le token dans les logs
  - **Vérifier le push via l'API GitHub** (`curl -s -H "Authorization: token $TOKEN" https://api.github.com/repos/.../commits?sha=main&per_page=1`), pas via `git log origin/main` (cache local souvent périmé)
- **Supabase** : projet `dntohsnhtqeomllfjood`, EU-Central, FREE tier — accessible via MCP Supabase (apply_migration pour les writes, execute_sql pour les lectures/reads seulement, **execute_sql ne commit PAS les writes**)
- **Site prod** : https://confiture-et-gourmandise.vercel.app | **Admin** : `/admin` | **Mot de passe admin** : `commeavant2026`
- **Déploiement** : Vercel auto-deploy sur push vers `main` (aucune action manuelle nécessaire après un push)
- **Stack** : Next.js 14 App Router, fichier client unique `app/boutique-ui.js` (~4350 lignes), Supabase JS + Supabase MCP, Vercel

## Process de travail établi dans cette session (à respecter)

1. Cloner/puller le repo dans `/home/claude/confiture` (le sandbox peut être réinitialisé entre les messages : si `cd /home/claude/confiture` échoue, recloner avec le token puis `npm install`)
2. Modifier `app/boutique-ui.js`
3. `npm run build` — DOIT afficher `✓ Compiled successfully` avant tout commit
4. Démarrer un serveur de test (`npm run start -- -p 3000`, souvent flaky au premier essai après un `pkill`, relancer une 2e fois si `curl` renvoie `000`)
5. **Toujours tester avec Playwright avant de pousser**, idéalement avec les VRAIES données du client (récupérées via Supabase MCP, pas des données inventées) — mocker `admin_batches`/`admin_check`/`products` via `page.route`, se connecter avec le vrai mot de passe, naviguer, vérifier les chiffres à la main
6. Commit + push (voir ci-dessus), puis vérifier via l'API GitHub que le SHA a bien changé
7. Résumer clairement au client ce qui a été testé et avec quels chiffres

## Client : Romain — points de communication critiques

- Communique en français, avec beaucoup de fautes de frappe/orthographe — relire attentivement, ne pas hésiter à reformuler pour confirmer la compréhension avant de coder si la demande est ambiguë (utiliser des questions à choix rapide/tappable plutôt que des questions ouvertes)
- Réagit très mal aux régressions, aux changements non demandés, aux fonctionnalités mal placées, et aux erreurs répétées
- Préfère l'action à l'explication : éviter les questions inutiles, mais NE PAS deviner sur les points à fort enjeu (argent, données) — mieux vaut une question ciblée
- **Ne jamais modifier ses données Supabase sans confirmation explicite** (incident grave en tout début de collaboration)
- Session actuelle exceptionnellement longue (2 jours) — de nombreux allers-retours, corrections de bugs que j'ai moi-même introduits en cours de route. Rester rigoureux sur les tests avant de pousser.

## Architecture clé — Contrôle de gestion / Pissaladière

### Fournées (batches de production)
Table Supabase `production_batches`, colonne `data` (jsonb). Familles : `pissaladiere`, `grande_fournee`, `kit_farine`, etc. (voir `FAM_DEFAULTS` dans le code).

### Concept central ajouté cette session : les "rondes" (fournées multiples le même jour)
Une fiche "fournée" peut désormais représenter **plusieurs cuissons distinctes le même jour** :
- `f.oignon_kg` etc. = la fournée "principale" (ronde 1)
- `f.rounds_extra` = tableau d'objets `{oignon_kg, huile_cl, sel_g, poivre_g, anchois_g, thym_g, ail_g, nb_feux, temps_cuisson_min, poids_fini_kg}` — chaque élément = une ronde supplémentaire
- Bouton "Dupliquer" clone une ronde (mêmes unités, à ajuster)
- `pfCalc()` (fonction centrale de calcul, ligne ~1088) somme automatiquement matières/poids/oignon sur TOUTES les rondes (principale + rounds_extra) via `oignonTotalRondes`, `poidsCuitTotalRondes`, `ratioMoyenJour`
- **Le "Poids cuit" par ronde est estimé à 90% si non pesé** (`poidsCuitDe()`), avec badge "Estimé"/"Mesuré" par ronde et un flag global `uneEstimationRondes`
- Réf. /kg oignon (colonne dans la liste d'ingrédients) : modifiable par fournée (`f[ing.key+"_ref"]`), remplace la référence par défaut (fournée du 09/08) si renseignée

### Cumul multi-fournées (plusieurs fiches différentes de la liste)
Dans la vue liste (`view === "list"`), bloc "Cumul de plusieurs fournées" :
- Mode plage de dates (Du/Au) OU mode sélection manuelle (cases à cocher, state `selectionManuelle`)
- Calcule le cumul oignon cru / poids cuit / coût de revient sur les fournées choisies
- Mini-calculateur : format en grammes → nb de pots/kits possibles

### ⚠️ EN COURS — PAS ENCORE FAIT (dernière demande de Romain, pas terminée)
1. **Le vin blanc (et les "ingrédients libres"/`extra`) doit apparaître visuellement DANS chaque bloc "Fournée N"**, pas seulement être multiplié en arrière-plan dans le total. Actuellement `f.extra` est une liste unique, affichée une seule fois en bas de la liste d'ingrédients principale, et son coût est multiplié par `nbRondesTotal` dans `pfCalc` — MAIS Romain veut que ce soit VISIBLE et modifiable à l'intérieur de chaque carte de ronde (comme les 7 ingrédients de base), pas juste un multiplicateur caché. À concevoir : soit dupliquer `extra` par ronde (plus de liberté mais plus complexe), soit au minimum afficher un texte explicite du type "× 3 fournées = X €" à côté de chaque ligne d'ingrédient libre.
2. **Cumul d'autres fournées (par date) directement dans l'onglet Contenants & vente d'UNE fournée** — en cours d'implémentation quand la session a été interrompue :
   - `pfCalc(f, rendementEstime, poidsExtraDispo)` a été modifié pour accepter un 3e paramètre qui s'ajoute UNIQUEMENT à `poidsDispoPots` (pas à `poidsFini`/`coutKg`, pour ne pas fausser le coût de revient de CETTE fournée avec le poids d'une autre)
   - `pfBlank` a un nouveau champ `autres_fournees_ids: []` (IDs des autres fournées à inclure)
   - Le calcul `poidsAutresFournees` existe déjà en haut du composant (cherche `autresFourneesSelectionnees`)
   - **IL RESTE À FAIRE** : l'UI pour sélectionner ces autres fournées (checkboxes par date, à placer juste au-dessus de "Prix de vente au kg (repère)" dans l'onglet Contenants & vente), et l'affichage de la quantité totale d'oignons cuits (cette fournée + les autres sélectionnées) bien visible à cet endroit
   - **Vérifier que le build passe** avant de continuer — au moment de l'interruption, le code compilait mais l'UI de sélection n'était pas encore ajoutée

## Bugs corrigés cette session (pour référence, ne pas les réintroduire)

- **Virgule française bloquée à la saisie** : le sélecteur d'unité recalculait la valeur affichée à chaque frappe, effaçant la virgule en cours de frappe. Fix : si l'unité affichée = unité native, afficher/stocker le texte brut tel quel (pas de recalcul par frappe)
- **Coût de revient ignorant les fournées supplémentaires** : les cartes Transformation/Coût de revient en haut ne comptaient que la fournée principale, pas le cumul des rondes. Fix : `hasRondes` bascule `poidsFini`/`rendement` sur le cumul
- **Marge du Tableau de bord fausse à ~100%** : les produits sans coût d'achat renseigné comptaient comme "0€ de coût" donc "100% de marge", ce qui gonflait la marge globale dès qu'UN SEUL produit avait un coût. Fix : la marge ne se calcule que sur le CA des produits à coût réellement connu, avec affichage de la couverture ("70% · calculée sur 75% du CA")
- **Coefficient de vente jamais affiché dans la liste** : pondéré par `nb` (nombre de pots), toujours à 0/vide → coefficient toujours "—" même avec coût ET prix connus. Fix : repli sur une moyenne non pondérée par format quand `nb` n'est pas renseigné
- **Prix de vente pas auto-rempli à la réouverture d'une fournée** : l'auto-remplissage ne se déclenchait qu'en retapant le prix/kg. Fix : le prix affiché ET les calculs (marge/coef) se basent maintenant EN DIRECT sur le prix/kg de référence tant qu'aucun prix n'est saisi manuellement
- **Constantes de référence recette fausses** : sel/poivre étaient hardcodés à 50g/30g au lieu des vraies valeurs de la fournée du 09/08 (5g/3g)
- **Colonne OIGNON de la liste** : n'affichait que la fournée principale, pas le cumul avec les rounds_extra

## Autres infos utiles

- Produits renommés : "Pissaladière" (33€, 1 plaque) → **"1 Pissaladière"** ; existe aussi **"2 Pissaladières"** (60€, 2 plaques)
- Produits ajoutés : **"Part offerte"** (0€, à la part, cat Salé) et **"Pot dégustation"** (0€, petit pot, cat Salé) — catégorie à confirmer avec Romain si besoin
- 58 produits sur 59 n'ont toujours pas de prix d'achat (`cost`) renseigné dans Supabase → la marge du tableau de bord restera peu représentative tant que ce n'est pas fait
- Fournée réelle de référence pour les tests : id `93e368c1-abe8-469d-8529-00afa45a58c1` ("3 fournées", 26/08/2026) — a 2 rounds_extra, sert de bon cas de test pour toute la logique multi-rondes
- Tour de simplification visuelle demandé par Romain, 1 amélioration par zone déjà livrée : stock visible sur les tuiles Caisse (absent avant), couleurs seuils Rdt/Coef dans la liste Contrôle de gestion, projection de fin de période dans le Tableau de bord. Romain n'a pas encore donné de retour dessus.
