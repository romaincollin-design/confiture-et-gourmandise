# COMMUN : Design, règles communes, circuits
Propriétaire du style commun : la session **Admin**. Personne d'autre ne modifie le menu latéral, l'en-tête, les couleurs ni les composants partagés.

## Design
- **Ce qui est propre** : ergonomie (une main, au marché), fluidité, nombre de clics, fidélité aux maquettes, menu latéral et en-tête (logo script, libellés sans icône sur ordinateur, barre du bas sur téléphone). Palette, typographie, pictogrammes (`Illu`), alignement : kit/ARCHIVE-CLAUDE.md §7, §7.1, §7.2.
- **Règles** : pas d'emoji ; chiffres en `tabular-nums` ; grille et jamais flex qui enroule (§7.1) ; `auto-fill` et pas `auto-fit` ; champs 16 px ; aucun débordement horizontal (320/390/768/1280) ; jamais `both`/`forwards` sur `.ca-anim` (§7.4) ; composants à champs de saisie au niveau module (§5.1 ter).
- **Vérifier** : `node scripts/verif-ecran.js <écran>` puis comparer à la maquette ou à la capture de référence (`kit/MAQUETTES.md`). Un comportement (sticky, clic) se vérifie au navigateur, pas par lecture du code (§7.3).

## Règles communes
Erreurs RPC lues, jamais avalées. `window.confirm` avant toute suppression. Virgule française. `0` est falsy. Agrégation par `cleProduit`, clé client par `cleClient` (§8).

## Circuits
Qui crée / valide / consomme : fournée (Gestion) crée le coût et le stock ; Caisse et retrait (Commandes) consomment le stock ; CRM (Croissance) consomme les clients créés par la boutique (Client).

## Argent
Renvoi : `univers/Gestion.md`. Aucune copie ici.
