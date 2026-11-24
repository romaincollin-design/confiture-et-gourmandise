# REX — retours d'expérience (mémoire des agents)

> Les agents ne retiennent rien d'une session à l'autre : **ce fichier est leur mémoire**. Il est court exprès
> (moins de jetons que CLAUDE.md, qui reste la référence métier). À lire AVANT de travailler, à compléter
> après chaque erreur : une règle de plus ici vaut mieux qu'une explication de plus au propriétaire.

## Règles apprises (23-24/11/2026)
1. **Refaire un écran ne veut jamais dire en retirer des fonctions.** Avant de coder : `scripts/qa-inventaire.py`
   (libellés disparus entre ancien et nouveau fichier) + liste écrite des fonctions de l'ancien écran. Tout ce qui
   disparaît est soit rétabli, soit demandé au propriétaire. (Régression du 24/11 : camembert, barres, tuiles
   cliquables, bouton « Nouveau coffret », panier moyen.)
2. **Une maquette se montre en image** (PNG envoyé avec SendUserFile), jamais via Vercel ni un lien. Elle reprend
   les **vrais dessins** des produits (`Illu`) et ingrédients, les vrais libellés, les vraies données. Une maquette
   validée devient la référence : le code la reproduit à l'identique.
3. **Alignement vérifié par script, pas à l'œil** : `scripts/qa-maquettes-alignement.js` (entêtes/cellules,
   débordements, textes coupés). Zéro défaut avant d'envoyer. Mêmes gabarits de tuile (libellé 2 lignes, valeur,
   jauge, détail) pour qu'une valeur ne soit jamais d'une ligne à l'autre.
4. **Chiffres de même hauteur** (lining). Dans une maquette HTML, Raleway local est « à l'ancienne » : mettre les
   chiffres et la ponctuation numérique en Work Sans (`unicode-range`). Dans l'app : `lining-nums` global.
5. **Conversions kilo → unité** : coût unité = prix d'achat/kg × poids du conditionnement (`grammesUnite`) ; un achat
   à l'unité n'est jamais converti. Toujours afficher achat saisi, coût/unité, vente/unité, marge/unité.
6. **La recette passe avant les options** : dans la fiche de fournée, les ingrédients préremplis sont visibles sans
   défiler ; les cases « Estimation » / « Ne pas compter » sont en bas.
7. **Le point d'entrée de Production = les produits en pictogrammes** (comme la Caisse), pas une liste de familles ;
   une nouvelle fournée ne préremplit rien tant qu'on n'a pas choisi départ + type.
8. **Pas d'emoji** (pictogrammes lucide). **Jamais de donnée inventée** présentée comme réelle.
9. **Une donnée absente se dit** (« à saisir », « manquant »), elle ne se devine pas.

## Méthode agents (économie de jetons)
- Donner à l'agent la **dernière base** (branche à jour), pas un vieux commit : sinon conflits de fusion (24/11 : 3 fusions
  conflictuelles).
- Brief court + renvoi à `docs/REX.md` et aux **numéros de lignes** utiles ; ne pas faire relire un fichier de 8 000 lignes
  en entier (`grep -n`, puis lire 40 lignes).
- Agents du dépôt (`.claude/agents/`) : `implementeur-ui` (code), `qa-regression` (relecture indépendante, lecture seule),
  `maquettes` (HTML → PNG + contrôle d'alignement). Un agent de QA relit **après** l'implémentation, avec le diff et
  l'ancienne version, pas avec la conclusion de l'implémenteur.
- Réutiliser les scripts existants (`scripts/`) plutôt que d'en réécrire.
- Après une erreur : ajouter UNE règle ci-dessus (quoi, pourquoi, comment l'éviter) dans le même commit que le correctif.

## Pièges d'outils
- `mcp__Supabase__execute_sql` en **écriture** demande une confirmation humaine (délai 230 s) : pour un texte d'annonce,
  passer par l'écran Enseigne ou attendre la confirmation.
- Vérifier un déploiement : chercher une chaîne **sans accent** dans les `static/chunks/*.js` de `/admin` (le minifieur
  encode les accents).
- Tuer les `next-server` résiduels avant un test navigateur ; compter les éléments rendus (un écran planté mesure « 0 px »).
