# Agents du projet : rôles, process, mémoire

## 1. Le back end du projet (ce que tout agent doit savoir)
- **Base** : Supabase, projet `dntohsnhtqeomllfjood`. Tables, RPC et règles : CLAUDE.md §4 (ne pas tout relire : `grep -n`).
- **Toute écriture admin passe par une RPC `admin_*` qui prend le PIN** (`pass`). La RLS bloque l'accès direct ; un produit masqué (`active=false`) n'est lisible que par `admin_products`.
- **Mouvements de stock** : toujours relatifs et atomiques (`admin_adjust_stock`, `admin_assemble_coffret`), jamais une valeur absolue périmée.
- **Interdits** : supprimer des données sans accord ; migration sans accord ; écrire le PIN ou un jeton dans le dépôt.
- **Écriture SQL via l'outil Supabase** : confirmation humaine (délai 230 s) ; sinon passer par l'écran de l'app.
- **Hébergement** : push sur `main` → Vercel déploie ; vérifier en cherchant une chaîne sans accent dans les chunks de `/admin`.

## 2. Qui fait quoi
| Rôle (`.claude/agents/`) | Fonction | Ne fait jamais |
|---|---|---|
| `orchestrateur` | Comprend la demande, découpe en pages, donne la dernière base, enchaîne maquette → validation → code → QA → push, tient la mémoire | coder une page entière lui-même sans brief ; fusionner sans demande |
| `maquettes` | Maquettes HTML → PNG avec vrais pictos, contrôle d'alignement | retirer une info de l'écran existant |
| `implementeur-ui` | Code UNE page depuis une maquette validée | pousser ; élargir le périmètre |
| `backend-supabase` | RPC, migrations (en SQL proposé), cohérence des données | écrire en base sans accord |
| `illustrateur` | Dessine les pictos manquants dans le style `Illu`, planche de validation | ajouter une clé sans dessin |
| `qa-regression` | Relit le diff contre l'ancienne version (lecture seule) | corriger |
| `memoire` | Ajoute les leçons (`rex.py add`), régénère REX, propose des améliorations (`rex.py suggest`) | réécrire l'historique |

## 3. Process (un cycle = une page)
1. **Brief** (`orchestrateur`) : objectif, page, ancienne version (commit), dernière base. Chaque agent démarre par `python3 scripts/rex.py brief <rôle>` (sa mission + SES leçons seulement).
2. **Maquette** (`maquettes`) → PNG envoyés au propriétaire → **validation** explicite.
3. **Code** (`implementeur-ui`) : reproduit la maquette à l'identique ; lint, build, test navigateur, `scripts/qa-inventaire.py`.
4. **QA** (`qa-regression`) : indépendante, avec le diff et l'ancienne version.
5. **Push** : PR, fusion seulement sur demande du propriétaire, vérification du déploiement avant d'annoncer.
6. **Mémoire** (`memoire`) : toute erreur du cycle devient une leçon (`rex.py add`), dans le même commit que le correctif.

## 4. Mémoire, apprentissage, sauvegarde, suggestion
- **Mémoire** : `docs/rex.jsonl` (source, une leçon par ligne : symptôme, cause, règle, contrôle, agents concernés). `docs/REX.md` en est généré.
- **Apprentissage** : un agent n'apprend pas seul ; il lit son brief. Une leçon qui revient 2 fois doit devenir un **contrôle automatique** (script), pas une règle de plus.
- **Sauvegarde** : tout est dans git ; une leçon est commitée avec le correctif ; `rex.py check` valide le fichier avant commit.
- **Suggestion** : `python3 scripts/rex.py suggest` (catégories récurrentes, leçons sans contrôle, idées ouvertes). À lancer en fin de cycle ; les propositions sont soumises au propriétaire, jamais appliquées seules.
- **Économie de jetons et de temps** :
  - brief d'agent de 3 à 5 lignes + renvoi à `docs/BRIEF-COMMUN.md` (règles, contrôle intégré, livraison) ; `rex.py brief <rôle>` pour ses leçons ;
  - `grep -n` puis 40 lignes, jamais un gros fichier entier ; une image lue une seule fois par cycle ;
  - vérification d'un écran en une commande : `NODE_PATH=/opt/node-tools/node_modules node scripts/verif-ecran.js <ecran>` (fixtures partagées `scripts/fixtures-admin.js`) ;
  - itérer avec `npm run lint`, un seul `npm run build` avant le test final ;
  - écrans indépendants en parallèle (worktrees), une fusion, une passe de contrôle, un déploiement ;
  - rapports d'agents de 15 lignes maximum.
