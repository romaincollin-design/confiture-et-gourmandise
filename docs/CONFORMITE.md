# Conformité maquettes → écrans (registre à ne pas oublier)

Règle : on ne pousse un écran en production que lorsque la colonne « Écarts » est vide, après contrôle par `qa-regression`
(captures pleine page 1280 et 390 px comparées image contre image à la maquette). Mettre ce tableau à jour à chaque cycle.

| Écran | Maquette (scratchpad/maquettes/) | État au 24/11/2026 | Écarts connus |
|---|---|---|---|
| Fiche de fournée | v8-16.png | CONFORME (contrôle du 24/11, 2e passe) | écarts mineurs acceptés : lot proposé en lien, refroidissement en deux heures natives |
| Coffrets | v8-17.png | CONFORME (contrôle du 24/11, 2e passe) | mineurs : Valider grisé sans prix, emballages dans un bloc séparé |
| Production, entrée | v6-10.png, v6-13.png | CONFORME (contrôle du 24/11, 2e passe ; liste des intitulés corrigée) | mineurs : pas de carte sélectionnée à l'entrée |
| Clients (CRM) | v6-14.png | CONFORME (contrôle + captures avec données, 24/11) | mineur : titre « Clients · CRM », bouton Export CSV en plus ; édition impossible sans email (RPC par id/téléphone à faire avec le propriétaire) |
| Commandes | v6-15.png | CONFORME (captures avec 5 commandes, 24/11) | non testés : suppression, modification d'une commande déjà remise, échec réseau |
| Stock | v8-5.png | CONFORME (contrôle, 24/11) | mineur : onglet « Lots · DLC » coupé à 390 px (défilement horizontal) |
| Nouveau produit | v8-4.png | CONFORME après correction du titre (24/11) | mineur : lien format → produit à faire dans la fournée ; produit « Créer masqué » à retrouver dans la liste |
| Caisse | v8-6.png | cartes verticales, barre segmentée, ticket complet | conforme (contrôle indépendant 24/11) ; écarts mineurs : ticket mobile en flux, catégorie « Gourmandises » vs « Fêtes » (données), défilement catégories 390 px non vérifié |
| Menu latéral + Tableau de bord | v8-3.png | menu texte avec logo script, tuiles claires, camembert et marge par produit ouverts (24/11) | contrôlé sur capture 1280 px |
