# CLAUDE.md — Comme Avant (confiture-et-gourmandise)

> Fichier de reprise pour toute session Claude Code ou humain qui reprend ce projet.
> **Règle d'or : aucune régression. Auditer avant de modifier. Ne jamais pousser sans build vert.**

---

## 1. Le produit

**Comme Avant** — association artisanale (Vence, 06) qui vend confitures, gourmandises,
miel, pissaladière et produits locaux sur les marchés. Propriétaire : Romain.

L'app est un **POS + gestion de production + boutique client** en une seule application Next.js.
Un client scanne un QR code sur le stand → arrive sur la boutique. Le commerçant gère tout
depuis un espace admin protégé par PIN.

- **Boutique client** : `/` (racine) — après le flash QR.
- **Espace commerçant (admin)** : `/admin` — protégé par un PIN (RPC `admin_check`).

Déployé sur **Vercel**, auto-déploiement à chaque push sur `main`.
URL prod : https://confiture-et-gourmandise.vercel.app

---

## 2. Stack & accès

- **Framework** : Next.js 14 (App Router), React 18. Un seul gros fichier UI : `app/boutique-ui.js` (~4700 lignes).
- **Icônes** : lucide-react 0.383.0 (version figée).
- **Export** : xlsx.
- **Base de données** : Supabase (Postgres + RPC + RLS).
  - Project ref : `dntohsnhtqeomllfjood`
  - URL : `https://dntohsnhtqeomllfjood.supabase.co`
  - Clé publishable (anon) en dur dans `lib/supabase.js` (fallback si pas de var d'env).
  - **Toutes les écritures admin passent par des RPC `admin_*`** (jamais d'insert/update direct
    sur les tables sensibles). La RLS bloque l'accès direct ; les RPC prennent un `pass` (le PIN).
- **Hébergement** : Vercel (compte du propriétaire du repo).
- **Repo** : GitHub `romaincollin-design/confiture-et-gourmandise`, branche `main`.

### Séquence de push (IMPORTANT)
Ne jamais committer le token GitHub en clair (repo public, GitHub bloque le push).
Build **obligatoire** avant tout push :
```bash
npm run lint           # no-undef : attrape les variables hors de portée
npm run build          # doit finir sans erreur (lance aussi ESLint)
git add -A
git commit -m "..."
git push origin main   # Vercel déploie automatiquement
```
Après push, vérifier le déploiement Vercel (statut "success") avant d'annoncer que c'est en ligne.

⚠️ **Le build vert ne prouve pas que l'app tourne.** Le 17/09/2026, `/admin` affichait
« Application error: a client-side exception has occurred » en production alors que le build
passait : `ProStats` lisait une variable d'un autre composant. C'est pourquoi `no-undef` est
désormais une **erreur** bloquante (`.eslintrc.json`), et pourquoi `next build` lance ESLint.
Pour un changement d'interface, charger réellement `/` et `/admin` (`npx next start` + navigateur)
et vérifier qu'aucune exception n'apparaît : une erreur de render remplace **toute la page**.

---

## 3. Fichiers

- `app/boutique-ui.js` — TOUT : boutique client + admin (Caisse, Tableau de bord, Commandes,
  Produits, Clients CRM, Fournisseurs, Production, Publimail, Promos, Enseigne, Réglages).
- `app/page.js` — monte la boutique client.
- `app/admin/page.js` — monte l'espace commerçant.
- `app/api/contact/route.js` — génère la vCard (coordonnées de l'enseigne).
- `lib/supabase.js` — client Supabase.
- `PASSATION-comme-avant.md` — historique de passation (garder à jour).

---

## 4. Schéma Supabase (tables `public`)

- `profile` — enseigne (nom, tagline, tél, email, WhatsApp, PIN, bandeau d'annonce).
- `products` — catalogue. Colonnes clés : `id`, `name`, `cat`, `unit` (= conditionnement, ex "pot 170g"),
  `price` (prix de vente), `cost` (prix d'achat), `coef`, `stock`, `illu`, `col`, `soon`, `active`, `sort`.
- `sales` — ventes en caisse. `items` = jsonb `[{name, qty, price, cost, pid?}]`.
- `orders` + `order_items` — commandes en ligne (retrait à préparer, système séparé des ventes caisse).
- `customers` — clients CRM.
- `promos`, `reviews`, `visits` (compteur QR anonyme), `suppliers`, `supplier_invoices`.
- `materials` — référentiel des matières premières : `nom`, `unite` (kg/L/piece), `categorie`,
  `seuil` (alerte), `actif`, `alias[]` (libellés de fournée rattachés à cette matière).
- `material_purchases` — achats de matières : `material_id`, `date_achat`, `qte`, `prix_total`,
  `supplier_id` (facultatif). **C'est la seule donnée que l'app ne pouvait pas déduire.**
- Vues : `v_material_usage` (consommation dépliée depuis les fournées, tout ramené en kg/L/pièce)
  et `v_material_stock` (= achats − consommation). Fonction `norm_matiere()` pour le rattachement
  par nom (minuscules, sans accents, ligatures œ/æ développées, pluriel ignoré).
- `production_batches` — fournées. Colonnes : `id` (uuid), `data` (jsonb = toute la fournée),
  `batch_date`, `created_at`, `updated_at`.

### RPC publiques (boutique client, sans PIN)
`track_visit`, `save_lead` (enregistre un contact **avec ou sans email** : sans email, la fiche est
identifiée par les **9 derniers chiffres du téléphone**, ce qui unifie `06 99…`, `0699…` et `+336 99…`),
`save_customer` (ancienne version, exige un email — conservée, plus appelée par l'app), `mark_wa_sent`.

### RPC utilisés (tous préfixés `admin_`, prennent `pass`)
`admin_check`, `admin_orders`, `admin_customers`, `admin_sales`, `admin_visits`, `admin_batches`,
`admin_suppliers`, `admin_save_product`, `admin_delete_product`, `admin_import_product`,
`admin_save_batch`, `admin_delete_batch`, `admin_set_rendement`, `admin_save_customer`,
`admin_save_supplier`, `admin_save_invoice`, `admin_set_announce`, `admin_set_order_status`,
`admin_update_order`, `admin_validate_order`, `admin_update_sale`, `admin_delete_sale`,
`admin_delete_order`, `admin_delete_supplier`, et les `admin_restore_*`.

---

## 5. LOGIQUE MÉTIER (le cœur — à ne jamais casser)

### 5.1 Production (onglet "Production", ancien "Contrôle de gestion")
Une **fournée** (`production_batches.data`) contient une recette et produit un poids fini.
Deux familles : `pissaladiere` et `grande_fournee` (= `isPissaFam`), plus les confitures.

- **Pissaladière** : ingrédients portés par champs dédiés dans `data` :
  `oignon_kg`, `sel_g`, `huile_cl`, `anchois_g`, `thym_g`, `ail_g`, + prix `px_*` associés.
  Vendue en **plaques** et/ou en **pots** (formats multiples). **Ratio : ~750 g d'oignons cuits par plaque.**
- **Confitures** : recette dans `data.extra` = `[{label, qty, unit, price}]` (ex. fraises + sucre + citron).
  Chaque fournée a `data.poids_fini_kg` (poids fini produit) et des formats de pots.
- `pfCalc(f, rendementEstime, poidsExtraDispo)` calcule coût de revient, poids fini, marges, nb de pots.
  Rendement de cuisson par défaut : ~64,3 % (oignons crus → cuits ; réglable via `admin_set_rendement`).

### 5.2 Chaîne Production → Produit → Caisse (fonctionnalité centrale)
Quand on **valide une fournée** (bouton "Valider la fournée" → pop-up récapitulatif plein écran) :
pour chaque format **relié à un produit du catalogue** (menu "Produit lié"), on pousse vers ce produit :
- **prix d'achat** (`cost`) = coût de revient réel calculé (matières + main d'œuvre + frais ÷ poids fini),
- **prix de vente** (`price`) = **on n'y touche jamais** s'il existe déjà ; sinon = prix/kg × poids arrondi à l'euro supérieur,
- **conditionnement** (`unit`, ex "pot 170g"),
- **coef** = prix de vente ÷ prix d'achat (recalculé),
- **stock** += nombre de pots/plaques produits.
La validation est **idempotente** : `data.stock_applique` mémorise ce qui a déjà été poussé,
donc re-valider n'ajoute que le delta (jamais de double comptage).

### 5.3 Caisse → Stock (dans les deux sens)
Fermer une vente en caisse (`closeOrder`) **décrémente le stock** des produits vendus
(hors offerts, hors articles libres sans fiche catalogue). `Math.max(0, ...)`.
Symétriquement : **annuler** une vente rend le stock, **modifier** une vente applique la différence,
et **« Valider le retrait »** d'une commande en ligne décrémente le stock (la commande n'est donc
pas à repasser en caisse — elle compte déjà dans le chiffre d'affaires).

### 5.4 Règle de prix / marge
- Le **prix de vente est figé** (fixé par le commerçant). On ne le recalcule jamais depuis la marge.
- Coef et marge se déduisent tout seuls : `marge = prix_vente − prix_achat`, `coef = prix_vente / prix_achat`.
- Arrondi des prix de vente suggérés en Production : **euro supérieur** (`Math.ceil`) — ex. 170 g × 42 €/kg = 7,14 € → **8 €**.

### 5.4 bis — Ce qui peut / ne peut pas bouger un prix de vente
- Validation de fournée : pousse `cost`, `unit`, `stock`, `coef`. **N'écrase jamais un `price` > 0.**
- Onglet Produits, champ **Prix d'achat** : recalcule le **coef** seulement.
- Onglet Produits, champ **Coef** : c'est le **seul** geste qui fixe volontairement `price = cost × coef`.
- Onglet Produits, champ **Prix de vente** : recalcule le coef.
- Toutes les saisies numériques acceptent la **virgule** (brouillon conservé pendant la frappe,
  normalisation à la sortie du champ).

### 5.5 Consommation matières (Tableau de bord)
Section "Consommation matières (crues)" : croise les **ventes de la période** avec les **recettes des fournées**
pour estimer les quantités crues consommées (oignons, sel, huile, anchois, fruits, sucre…).
- Lien vente ↔ recette **par nom normalisé** (`normNom` : minuscules, sans accents, sans "confiture/de/la/les",
  singulier/pluriel ignorés). "confiture fraise" == "confiture de fraises".
- **Grammage d'une unité vendue** : toujours via `grammesUnite(unit, estPissa)`, jamais en extrayant
  tous les chiffres de `unit` ("part ≈ 272 g · 35 €/kg" donnerait 27 235 g). Plaque = 750 g,
  part = 1/12 de plaque.
- **Fournées comptées** : `fourneeComptee()` écarte celles marquées « estimation », celles cochées
  « Ne pas compter dans les statistiques », et celles au rendement impossible (poids cuit > poids cru).
  Les fournées de démonstration faussaient le ratio oignons/produit fini d'un facteur ~2.
- Recette exprimée en g d'ingrédient cru **par g de produit fini** (ingrédients ÷ poids fini de la fournée).
- **Un ingrédient libellé en contenant n'est pas une matière première** : `estProduitFini(label)`
  (mots `pot / bocal / plaque / barquette / sachet / boîte`) écarte les lignes qui sont un produit
  **déjà fabriqué**, réintroduit dans une fournée de type kit. La fournée « Kit Pissaladière » du
  16/08 porte `Pissaladière (pot 300 g) — d'après ta fournée du 09/08`, 200 kg à 21,09 €/kg :
  comptée comme matière, elle ajoutait **187,73 kg fantômes sur 402 kg**, soit 47 % du total, et
  arrivait en tête du donut devant les oignons. Aucune des 56 matières réelles ne porte un de ces
  mots — la règle est sûre sur les données existantes. Même filtre dans `recettes` et `prixMatiere`.
- Affichage : donut **cliquable** par matière (→ détail segmenté : quels produits l'ont consommée,
  part de chacun, coût estimé, rythme semaine/mois/an) + prix d'achat moyen au kg, même sélecteur
  de période (jour/semaine/mois/année) que les ventes.
- **Consommation par produit** : vue semaine / mois / année, mesurée sur les **8 dernières semaines**
  glissantes (indépendante de la période affichée), avec les matières de chaque produit et leur coût.
- **« Vendu sans recette de fournée »** : ce qui s'est vendu sans qu'aucune fournée n'en donne la
  recette (Miel, Crème de marron, Caramels, Reine Claude…) est estimé **sur les ventes seules**
  (unités + poids). C'est la marchandise à produire ou racheter pour tenir le même rythme.
- ⚠️ **Ne jamais rattacher une vente à une recette par préfixe de nom.** Testé sur les données
  réelles : une fournée au titre `C` (saisie incomplète) captait Citron, Citron Bergamotte, Crème de
  marron, clafoutis et caramel à tartiner. Rattachement **exact** uniquement (`normNom`) ; ce qui ne
  matche pas va dans « vendu sans recette », visible, plutôt que deviné.

### 5.5 bis — Réassort & rythme de vente
- **« À refaire »** = produit en vente (`active`), non `soon`, stock ≤ 5. Même règle partout :
  chip dans Produits (liste triée du plus urgent au moins urgent) et bandeau repliable en Caisse.
- **Rythme** (Tableau de bord) = unités vendues sur les **8 dernières semaines ÷ 8**, indépendant de la
  période affichée. La couverture (`stock ÷ rythme`) dit combien de temps le stock tient — c'est ce
  chiffre qui déclenche une fournée, pas le CA.

### 5.6 bis — Matières premières (onglet « Matières & achats »)
**Le stock de matières ne se saisit pas, il se déduit : `stock = achats − consommé par les fournées`.**
La consommation était déjà entièrement connue (chaque fournée porte ses ingrédients et leurs prix,
champs dédiés pissaladière + `data.extra`) ; seuls les **achats** manquaient.
- Le référentiel a été amorcé automatiquement depuis les 36 fournées existantes (40 matières).
- Une matière au stock **négatif** = elle a servi sans qu'aucun achat soit enregistré. Ce n'est pas
  une erreur, c'est l'historique d'achats qui manque.
- Les ingrédients de fournée qui ne correspondent à aucune matière apparaissent dans
  « non rattachés » — souvent une unité différente (pièce vs kg) ou un libellé écrit autrement.
  On les rattache via `alias`, jamais en supprimant.
- ⚠️ Les **emballages** (bocaux, capuchons, étiquettes) ne sont pas encore suivis : leurs prix sont
  dans les formats de fournée (`px_bocal`…) mais sans quantité achetée. Chantier suivant.

### 5.2 bis — Relier un format à un produit (sans ça, rien ne descend)
La chaîne §5.2 ne s'amorce que si le format porte un `pid`. **Au 17/09/2026, aucun des 40 formats
n'était relié** : c'est la seule raison pour laquelle 59 produits sur 60 n'avaient pas de prix
d'achat. Le prix d'achat n'est PAS à saisir à la main, il descend de la fournée.
L'onglet « Contenants & vente » propose désormais l'appariement automatique (nom réduit via
`normNom` + grammage via `grammesUnite`, tolérance 2 %). En cas d'ambiguïté — plusieurs produits au
même grammage, ou plusieurs homonymes — **aucune suggestion n'est faite** : on ne devine pas.

### 5.7 Boucle production → clients
Après « Valider la fournée », un écran propose un **message d'annonce prêt à copier** listant les
produits réellement entrés en stock (delta > 0 seulement). Il compte les clients ayant coché le
consentement. WhatsApp interdisant l'envoi groupé par lien, le geste est : copier → coller dans la
liste de diffusion. **Le consentement se récolte via la case du formulaire client** (§6.1) : sans
elle, aucune annonce n'est possible.

### 5.6 Stock oignons cuits (Production)
Compteur = (oignons cuits produits par toutes les fournées pissaladière) − (consommés par les ventes de
pissaladière, 750 g cuits/plaque). Trois tuiles : stock actuel, produit, consommé. Purement dérivé, non stocké.

---

## 6. Boutique client (parcours)

1. **Flash QR → écran de coordonnées OBLIGATOIRE** (step `coords`). On demande prénom + nom + téléphone
   (email et adresse **facultatifs**, complétés plus tard dans le profil). Autofill natif iOS/Android activé.
   ⚠️ **Aucun écran ne doit exiger d'email** : la commande part par **WhatsApp**, pas par mail.
   Trois verrous email (commande, avis, enregistrement du contact) ont bloqué toute commande
   du 16/09 au 17/09/2026 — ne pas les réintroduire.
   **Case « Prévenez-moi des nouvelles fournées »** : c'est la seule source de `opt_in`, donc la seule
   source d'audience pour Publimail et les annonces de fournée. Elle était absente du formulaire alors
   que le champ existait en base — ne pas la retirer. `save_lead` ne **rétrograde jamais** un
   consentement (`opt_in = opt_in or excluded`) : passer commande effaçait l'accord donné à l'inscription.
2. **Verrouillage strict** : impossible de voir la carte, le panier ou de commander sans coordonnées valides.
   Garde-fou dans `ClientView` : tout accès à `shop/cart/checkout/done` sans `coordsOk` renvoie à `coords`.
   Le bandeau promo ("Announce") ne s'affiche pas sur l'écran `coords`.
3. Une personne déjà enregistrée (localStorage `ca_cust`) arrive sur l'accueil normal, pas de re-saisie.
4. **Boutique** : bouton "+ Ajouter" (texte visible), sélecteur −/qté/+ une fois au panier.
   Produit épuisé → "· sur commande" **cliquable** (s'ajoute au panier), jamais "Rupture" bloquant.
   **Le stock n'est JAMAIS affiché côté client** (pas de "plus que X", pas de chiffre).
5. États produit côté admin : `active` (masqué si false), `soon` ("Bientôt"), et sur-commande auto si stock 0.

---

## 7. Style UI (respecter absolument)

Palette `C` : cream `#EFE7D5`, paper `#FBF6EA`, board `#16140F`, ink `#241F17`, soft `#8C8068`,
jam (bordeaux) `#7A2B33`, caramel `#B5722B`, ok (vert) `#3F7A4B`.
Palette Production `PF` : navy `#123A52`, ochre `#C65A35`, good `#4b7a57`, warn `#a6482a`.
- Titres en police script (Pacifico via `SCRIPT`).
- Boutons principaux : bordeaux `C.jam`. Pas de noir pour les boutons de la boutique client.
- Encarts de calcul : texte **en gras uniforme**, une seule couleur — pas de mélange gras/normal.
- Récap chiffrés : **vignettes** (pastilles fond crème), pas de lignes de texte brut.
- Formatage : `eur()`, `eur2()`, `eur3()` pour les montants ; virgule française.
- **Illustrations produit** (`Illu`, clés ayant un dessin propre) : `fraise, berry, mure, cerise, figue,
  peche, apricot, plum, melon, orange, lemon, apple, quince, oignon, pissa, potpissa, caramel, miel,
  marron, cake, loaf`. Ne PAS proposer de clé sans dessin (elle retombe sur le rond générique).
- **L'icône suit le nom du produit** : `illuAuto(name)` (table `ILLU_PAR_NOM`, du plus spécifique au
  plus général) et `illuDe(p)`. La valeur stockée ne l'emporte que si le commerçant l'a réellement
  choisie : `""` et `"orange"` sont les défauts de seed, jamais choisis. Au 17/09/2026, **25 produits
  sur 60 portaient `illu = "orange"`** avec la même couleur `#C25E1E` — fraises, pêche, figues, prunes,
  melon, cerises et oignons s'affichaient en rond orange identique. La règle en requalifie 22.
  Les icônes encore partagées (6 pots d'oignons, 8 prunes) sont des doublons de nom, pas d'icône.

---

## 8. PIÈGES CONNUS (déjà corrigés — ne pas réintroduire)

- **Virgule française** : normaliser `,` → `.` sur toute saisie numérique (`.replace(",", ".")`).
  Ne pas recalculer la valeur à chaque frappe pour l'unité native (la virgule saute sinon).
- **`0` est falsy en JS** : tester `!= null` / `> 0` explicitement, pas `if (valeur)`.
  Bug déjà vu : calcul auto du nb de pots caché quand poids dispo = 0. Champ nb de pots gardait un "0" de tête.
- **Vue "Total" du dashboard** : ancre interne année 2020 → utiliser `new Date().getFullYear()` au drill-down.
- **Agrégation produits par `pid`** (identifiant stable), pas par nom : des produits différents partagent
  le même nom (doublons "pot d'oignons", "Pissaladière de ma mère" 250 g / 500 g).
- **"Pissaladière" et "Grande fournée"** sont deux onglets séparés (clé de famille `kit_pissaladiere` obsolète).
- **Décalage de cellules** : un label sur 2 lignes (ex. suffixe "(auto)") désaligne toute la rangée flex.
- **Champs de saisie** : plafonner la largeur (`maxWidth`) sinon ils s'étirent sur toute la ligne.
- **Fournées orphelines en base** : quelques entrées test (`pissaladiere_volume`, titre vide). Ne pas
  supprimer de données sans accord explicite du propriétaire. Elles sont désormais visibles dans
  l'onglet **« Non classées »** de Production et reclassables via le sélecteur de famille.
- **`pid` des lignes de vente et de commande** : toujours le conserver au chargement (`admin_sales`,
  `admin_orders`) et à l'enregistrement. Sans lui, l'agrégation retombe sur le nom, et 15 noms sont
  partagés par plusieurs produits.
- **Portée des variables dans ce gros fichier** : `ProStats` a référencé `rendementEstime`, un état de
  `ProProduction`. Le build passe, mais l'onglet plante au render (`ReferenceError`). Aucun type-check
  ici : vérifier à l'œil que chaque identifiant est bien dans la portée du composant.
- **Actions destructrices** : suppression d'un produit, d'une commande ou d'une vente = `window.confirm`
  obligatoire. Pour un produit, préférer « Masquer ».

---

## 9. RÈGLES DE TRAVAIL (attentes du propriétaire)

- **Jamais de suppression de données Supabase sans accord explicite.** Désactiver (`active=false`) plutôt que supprimer.
- Toujours **auditer / proposer avant d'appliquer** sur un gros changement ; ne pas se disperser.
- Réponses **directes et concises**, pas de commentaire superflu, pas de données inventées.
- Ne **jamais retirer** du texte/contenu existant sans le demander (ajouter, pas remplacer, par défaut).
- Communication en **français**.
- Toujours : build vert → push → vérifier le déploiement avant d'annoncer "en ligne".

---

## 10. Idées / chantiers en cours (backlog)

- Kit Apéro (confit d'oignons + biscuits + tapenade + anchois) — à monter via le type "Kit" en Production.
- Prix d'achat manquants : **ne pas les saisir à la main**. Deux chemins, tous deux automatiques :
  relier les formats de fournée aux produits (§5.2 bis) puis valider la fournée, **ou** le bouton
  « Calculer N prix d'achat depuis les fournées » de l'onglet Produits (`coutsDepuisFournees`), qui
  applique la même définition sans passer par la validation. Au 17/09/2026 : **21 applicables**,
  **12 bloqués** (le fruit lui-même n'a pas de prix au kilo dans sa fournée — 67 % du poids : CERISES,
  FIGUES BLANCHES, PÊCHES, PRUNES ROUGES/JAUNES, ORANGES AMÈRES/DOUCES), 27 sans recette.
  Un ingrédient sans prix pesant **plus de 5 % du poids bloque le calcul** : un coût amputé du fruit
  principal serait faux et gonflerait les marges. Sous ce seuil (citron, vanille, menthe) on calcule
  et on affiche ce qui est exclu. Saisir ces 7 prix en Production débloque les 12 produits.
- Formulaire de contact : améliorer encore la capture (10 % de conversion scan→contact au départ).
- **Emballages en matières suivies** (bocaux, capuchons, étiquettes) : la quantité consommée se déduit
  du nb de pots produits par fournée, le prix est déjà dans les formats. À brancher sur `materials`.
- **WhatsApp** : envoi groupé à la main pour l'instant (liste de diffusion). Pistes évoquées par le
  propriétaire : brancher l'app sur WhatsApp pour dialoguer avec les clients, un chat, puis un envoi
  automatique. Nécessiterait l'API WhatsApp Business (compte + coût) — à décider ensemble.
- Doublons de noms de produits (15 noms partagés) : gênent l'appariement automatique format → produit.
  À fusionner ou différencier (le grammage dans le nom suffirait).
