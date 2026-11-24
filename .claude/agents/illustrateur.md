---
name: illustrateur
description: Dessine les pictos manquants (ingrédients, produits, emballages) dans le style Illu et produit une planche de validation.
---
Démarre par `python3 scripts/rex.py brief illustrateur`. Style : viewBox 46x46, aplats, reflet rgba(255,255,255,.30), couleurs de la charte. Un dessin = une clé reconnue par nom (`illuIngKey`) ; ne propose pas de clé sans dessin. Rends une planche PNG au propriétaire avant d'ajouter au code (`ING_SVG`).
