# 🍲 Mijo — Anti-gaspi & recettes

> *« Qu'est-ce qui mijote dans ton frigo ? »*

Web app (PWA) **100 % gratuite** qui répond à deux problèmes :

1. **Tu oublies les dates de péremption** → l'appli liste tes aliments, triés par
   urgence, avec un code couleur (vert / orange / rouge) et une alerte « à consommer
   très vite ».
2. **Tu ne sais pas quoi cuisiner avec ce que tu as** → un bouton te propose des
   recettes basées sur ton frigo, en **priorisant les aliments qui périment bientôt** (badge 🔥).

3. **Tu en as marre de tout taper** → bouton **📷 Scanner** : scanne le code-barres
   (nom auto-rempli via Open Food Facts), ou photographie un fruit/légume (reconnu par
   une IA qui tourne sur ton téléphone), et photographie la date imprimée (lue par OCR).

Aucun compte, aucune donnée envoyée ailleurs : **tout reste sur ton téléphone**
(stockage local du navigateur). Les recettes viennent de l'API gratuite
[TheMealDB](https://www.themealdb.com/), les produits emballés de
[Open Food Facts](https://world.openfoodfacts.org/).

---

## 📱 L'utiliser sur iPhone (comme une vraie app)

La PWA doit être servie en **HTTPS** pour s'installer. Le plus simple : l'héberger
gratuitement (voir plus bas), puis sur l'iPhone :

1. Ouvre l'URL dans **Safari**.
2. Bouton **Partager** (carré avec flèche) → **« Sur l'écran d'accueil »**.
3. L'icône « Mijo » apparaît comme une app, plein écran, utilisable hors-ligne
   (la liste du frigo marche sans réseau ; les recettes ont besoin d'internet).

Ça marche aussi sur **Android** (Chrome → menu → « Ajouter à l'écran d'accueil »)
et sur **ordinateur**.

---

## 🚀 Héberger gratuitement (au choix)

L'appli est faite de fichiers statiques : pas de build, pas de serveur.

### Option A — GitHub Pages (gratuit, HTTPS automatique)
1. Crée un dépôt GitHub et pousse le contenu de ce dossier.
2. `Settings → Pages → Source: main / root`.
3. Ton URL : `https://<ton-pseudo>.github.io/<depot>/`.

### Option B — Netlify Drop (le plus rapide)
1. Va sur <https://app.netlify.com/drop>.
2. Glisse-dépose **le dossier `Recipe`** entier. URL HTTPS générée aussitôt.

### Option C — Vercel
`npm i -g vercel` puis `vercel` dans le dossier.

---

## 💻 Tester en local

Un service worker exige `http`/`https` (pas `file://`). Lance un petit serveur :

```bash
cd Recipe
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

---

## 🗂️ Structure

```
Recipe/
├── index.html              écran principal (onglets Frigo / Recettes)
├── css/styles.css          styles (mobile-first, code couleur d'urgence)
├── js/ingredients-fr.js    dictionnaire FR→EN des ingrédients (+ emojis)
├── js/app.js               logique : stock, dates, suggestions, détail recette
├── js/scan.js              scan code-barres + reconnaissance IA + OCR de la date
├── manifest.webmanifest    métadonnées PWA (installation)
├── sw.js                   service worker (hors-ligne + cache)
└── icons/                  icônes générées (192/512/180 + maskable)
```

## ⚙️ Comment ça marche

- **Stockage** : `localStorage` (clés `frigo.items.v1` / `frigo.settings.v1`).
- **Recettes** : `filter.php?i=<ingrédient>` pour chaque aliment, puis agrégation —
  une recette est d'autant mieux classée qu'elle utilise plus de tes ingrédients,
  avec un gros bonus si elle utilise un aliment qui périme dans ≤ 2 jours (🔥).
  `lookup.php` fournit le détail (ingrédients cochés selon ton stock + préparation).
- **Langue** : les recettes TheMealDB sont en anglais. Les ingrédients connus sont
  réaffichés en français, et un bouton **« Traduire en français »** ouvre la
  préparation dans Google Traduction.
- **Rappels** : la cloche (en haut à droite) active des notifications locales quand
  des aliments périment aujourd'hui/demain (selon le support du navigateur).

## 📷 Le scan (code-barres + IA + OCR)

Trois technologies gratuites, chargées **à la demande** depuis un CDN (donc internet
requis à la première utilisation, puis mises en cache) :

| Quoi | Comment | Limite |
|------|---------|--------|
| Nom d'un produit emballé | Code-barres → [Open Food Facts](https://world.openfoodfacts.org/) | Produit doit exister dans la base |
| Nom d'un fruit/légume | IA on-device [MobileNet](https://github.com/tensorflow/tfjs-models) (TensorFlow.js) | Approximatif, libellés limités |
| Date de péremption | OCR [Tesseract.js](https://tesseract.projectnaptha.com/) | Dépend de la lisibilité |

⚠️ **La caméra exige HTTPS** : le scan fonctionne sur la version hébergée (Netlify/
GitHub Pages) ou en `localhost`, pas en ouvrant le fichier directement. Le résultat
pré-remplit le formulaire d'ajout — tu peux toujours corriger avant d'enregistrer.

## 🔧 Personnaliser

- **Ajouter des ingrédients** reconnus : édite `js/ingredients-fr.js` (liste
  `FR_INGREDIENTS`, format `{ fr, en, emoji, cat }`). Le `en` doit correspondre à un
  ingrédient TheMealDB pour que la recherche de recettes fonctionne.

## 📌 Limites connues

- La base de recettes (TheMealDB) est anglophone et internationale.
- Pas de synchro entre appareils (par choix : 100 % local, vie privée).
- Les notifications quand l'app est **fermée** nécessiteraient un serveur push
  (non inclus pour rester 100 % gratuit/sans compte).
