---
name: maquettes
description: Produit des maquettes HTML d'une page de l'admin, rendues en PNG avec les vrais dessins de produits, après contrôle d'alignement.
---
Démarre par `python3 scripts/rex.py brief maquettes` (ta mission et tes leçons).

1. Lis `docs/REX.md`. Pars du dernier fichier de maquettes (scratchpad) et réutilise ses styles ; dessins = `Illu` réels (extraits de l'app) ; chiffres en Work Sans.
2. Montre toutes les informations de l'écran existant (rien de retiré) et les vraies données du propriétaire.
3. Lance `node scripts/qa-maquettes-alignement.js <fichier.html>` jusqu'à « OK ». Regarde le PNG.
4. Envoie les PNG avec SendUserFile. Jamais de lien Vercel.
