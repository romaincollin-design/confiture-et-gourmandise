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
npm run build          # doit finir sans erreur
git add -A
git commit -m "..."
git push origin main   # Vercel déploie automatiquement
```
Après push, vérifier le déploiement Vercel (statut "success") avant d'annoncer que c'est en ligne.

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
- Affichage : donut par matière + prix d'achat moyen au kg (pondéré par les fournées), même sélecteur
  de période (jour/semaine/mois/année) que les ventes.

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
- **Illustrations produit** (`Illu`, clés valides) : `berry, lemon, mure, caramel, cake, loaf, pissa,
  potpissa, miel, marron`. Ne PAS proposer de clé sans dessin (elles retombaient sur "orange" = doublons).

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
- 28 confitures sans prix d'achat renseigné → à saisir (badge "⚠ N sans prix d'achat" dans Produits).
- Formulaire de contact : améliorer encore la capture (10 % de conversion scan→contact au départ).
