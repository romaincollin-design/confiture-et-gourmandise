# Session « Comme Avant · Commandes & retrait » (rubrique : zéro bug)
## Ce qui est propre
Commande en ligne, statuts `À préparer` → `Prête` → `Remise`, « Valider le retrait », vente en caisse, mouvements de stock correspondants. kit/ARCHIVE-CLAUDE.md §5.3, §5.3 bis.
## Règles
Une commande compte au chiffre d'affaires à `Remise` ; une vente en caisse à sa clôture. Stock : caisse et retrait décrémentent, annuler rend, modifier applique la différence ; idempotent (`enregistrerCommande`). `pid` conservé partout. Jamais d'email exigé. Avant tout push touchant ce circuit : rejouer commande → prête → remise → stock, lire les erreurs RPC.
## Argent
Renvoi : `Gestion.md` (définition du CA).
## Code
`ProOrders`, `CarteCommande`, `ProCaisse`/`closeOrder`, `enregistrerCommande`, RPC `admin_orders`, `admin_validate_order`, `admin_set_order_status`, `admin_update_order`, `admin_delete_order`.
## Où ça vit
Jouée par Admin (écrans), fournie par Client (commandes), consommée par Gestion (CA, stock). Lire aussi : Gestion.md.
## À faire et notes
Cas non testés : suppression d'une commande, modification d'une commande remise, échec réseau au retrait. 3 commandes « prêtes » d'août/septembre jamais validées (hors CA). Lignes « Commandes » de `kit/A-FAIRE.md`.
