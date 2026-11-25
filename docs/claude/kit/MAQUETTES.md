# Index des visuels
**Constat (25/11/2026) : les maquettes v8 étaient dans le dossier temporaire d'une session, jamais dans le dépôt ; le conteneur a été remplacé et elles ont disparu.** Quatre ont pu être récupérées depuis le journal de la conversation et sont maintenant dans `docs/maquettes/`. Les autres (v8-4 Nouveau produit, v8-5 Stock, v8-6 Caisse, v6-10/13/14/15 Production entrée, CRM, Commandes) sont perdues.
**Règle désormais** : tout visuel validé est copié dans `docs/maquettes/` du dépôt le jour de sa validation, et ajouté ici.

| Écran | Visuel | Statut |
|---|---|---|
| Menu latéral + Tableau de bord | `docs/maquettes/v8-3-tableau-de-bord.png` | production alignée le 24/11 |
| Production, accueil | `docs/maquettes/v8-1-production-accueil.png` | |
| Fiche de production | `docs/maquettes/v8-2-fiche-production.png` | |
| Caisse | maquette 6 (perdue) | conforme, contrôle du 24/11 |
| Coffrets | `docs/maquettes/v8-17-coffrets.png` | conforme, contrôle du 24/11 |
| Autres écrans | voir `docs/CONFORMITE.md` | |

**Référence de remplacement** : captures de l'écran en production, générées par `node scripts/verif-ecran.js <écran> --out docs/maquettes` (1280 et 390 px). Elles servent de base de comparaison pour détecter une régression ; une nouvelle maquette validée par Romain les remplace.
