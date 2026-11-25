# Session « Comme Avant · Gestion » (rubrique : argent et contrôle de gestion)
## Ce qui est propre
Production et fournées, produits, coffrets, stock, matières, tableau de bord, prix, marges. kit/ARCHIVE-CLAUDE.md §5.1 à §5.12.
## Règles
Prix de vente figé, jamais recalculé (§5.4) ; la validation de fournée pousse coût, conditionnement, stock, coef (§5.2) ; prix d'achat FIFO (§5.10) ; marge masquée si peu parlante (§5.4 ter) ; une rubrique = un produit fabriqué (§5.9) ; coffrets (§5.12) ; hygiène (§5.8).
## Argent (source unique)
**Seul ce fichier et l'archive §5.3 bis / §5.4 définissent l'argent.** CA : uniquement `caPeriode` (caisse à la clôture + commandes à `Remise`). Marge = prix de vente − prix d'achat ; coef = vente ÷ achat. Arrondi suggéré à l'euro supérieur.
## Code
`ProProduction`, `ProStats`, `ProProduits`, `ProCoffrets`, `ProStock`, `caPeriode`/`fluxCA`, `lotsDepuisFournees`, `pfCalc`.
## Où ça vit
Jouée par Admin (écrans), alimentée par Commandes (ventes), consommée par Croissance (annonce de fournée). Lire aussi : Commandes.md.
## À faire et notes
Prix de vente des 4 coffrets ; prix d'achat thym, orangettes, pots d'oignons ; 12 produits bloqués faute de prix au kilo du fruit (§10). Lignes « Gestion » de `kit/A-FAIRE.md`.
