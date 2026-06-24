/* Dictionnaire d'ingrédients FR -> EN (ingrédient TheMealDB) + emoji.
   Les valeurs "en" ont été choisies pour maximiser le nombre de recettes
   renvoyées par l'API filter.php (ex. "Tomato" plutôt que "Tomatoes",
   "Mushrooms" plutôt que "Mushroom", "Spaghetti" pour les pâtes). */
window.FR_INGREDIENTS = [
  // Viandes
  { fr: "Poulet",            en: "Chicken",        emoji: "🍗", cat: "viande" },
  { fr: "Blanc de poulet",   en: "Chicken Breast", emoji: "🍗", cat: "viande" },
  { fr: "Cuisse de poulet",  en: "Chicken Legs",   emoji: "🍗", cat: "viande" },
  { fr: "Bœuf",              en: "Beef",           emoji: "🥩", cat: "viande" },
  { fr: "Steak haché",       en: "Minced Beef",    emoji: "🥩", cat: "viande" },
  { fr: "Porc",              en: "Pork",           emoji: "🥓", cat: "viande" },
  { fr: "Agneau",            en: "Lamb",           emoji: "🍖", cat: "viande" },
  { fr: "Veau",              en: "Veal",           emoji: "🍖", cat: "viande" },
  { fr: "Dinde",             en: "Turkey",         emoji: "🦃", cat: "viande" },
  { fr: "Canard",            en: "Duck",           emoji: "🦆", cat: "viande" },
  { fr: "Jambon",            en: "Ham",            emoji: "🍖", cat: "viande" },
  { fr: "Lardons",           en: "Bacon",          emoji: "🥓", cat: "viande" },
  { fr: "Bacon",             en: "Bacon",          emoji: "🥓", cat: "viande" },
  { fr: "Saucisse",          en: "Sausages",       emoji: "🌭", cat: "viande" },
  { fr: "Chorizo",           en: "Chorizo",        emoji: "🌭", cat: "viande" },

  // Poissons & fruits de mer
  { fr: "Saumon",            en: "Salmon",         emoji: "🐟", cat: "poisson" },
  { fr: "Thon",              en: "Tuna",           emoji: "🐟", cat: "poisson" },
  { fr: "Cabillaud",         en: "Cod",            emoji: "🐟", cat: "poisson" },
  { fr: "Morue",             en: "Cod",            emoji: "🐟", cat: "poisson" },
  { fr: "Crevettes",         en: "Prawns",         emoji: "🦐", cat: "poisson" },
  { fr: "Gambas",            en: "Prawns",         emoji: "🦐", cat: "poisson" },
  { fr: "Moules",            en: "Mussels",        emoji: "🦪", cat: "poisson" },
  { fr: "Crabe",             en: "Crab",           emoji: "🦀", cat: "poisson" },

  // Légumes
  { fr: "Tomate",            en: "Tomato",         emoji: "🍅", cat: "legume" },
  { fr: "Tomate cerise",     en: "Cherry Tomatoes",emoji: "🍅", cat: "legume" },
  { fr: "Oignon",            en: "Onion",          emoji: "🧅", cat: "legume" },
  { fr: "Oignon rouge",      en: "Red Onions",     emoji: "🧅", cat: "legume" },
  { fr: "Échalote",          en: "Shallots",       emoji: "🧅", cat: "legume" },
  { fr: "Ail",               en: "Garlic",         emoji: "🧄", cat: "legume" },
  { fr: "Pomme de terre",    en: "Potatoes",       emoji: "🥔", cat: "legume" },
  { fr: "Patate douce",      en: "Sweet Potatoes", emoji: "🍠", cat: "legume" },
  { fr: "Carotte",           en: "Carrots",        emoji: "🥕", cat: "legume" },
  { fr: "Courgette",         en: "Zucchini",       emoji: "🥒", cat: "legume" },
  { fr: "Aubergine",         en: "Aubergine",      emoji: "🍆", cat: "legume" },
  { fr: "Poivron",           en: "Red Pepper",     emoji: "🫑", cat: "legume" },
  { fr: "Poivron rouge",     en: "Red Pepper",     emoji: "🫑", cat: "legume" },
  { fr: "Poivron vert",      en: "Green Pepper",   emoji: "🫑", cat: "legume" },
  { fr: "Brocoli",           en: "Broccoli",       emoji: "🥦", cat: "legume" },
  { fr: "Chou-fleur",        en: "Cauliflower",    emoji: "🥦", cat: "legume" },
  { fr: "Chou",              en: "Cabbage",        emoji: "🥬", cat: "legume" },
  { fr: "Épinard",           en: "Spinach",        emoji: "🥬", cat: "legume" },
  { fr: "Salade",            en: "Lettuce",        emoji: "🥬", cat: "legume" },
  { fr: "Laitue",            en: "Lettuce",        emoji: "🥬", cat: "legume" },
  { fr: "Champignon",        en: "Mushrooms",      emoji: "🍄", cat: "legume" },
  { fr: "Petit pois",        en: "Peas",           emoji: "🟢", cat: "legume" },
  { fr: "Haricot vert",      en: "Green Beans",    emoji: "🫛", cat: "legume" },
  { fr: "Maïs",              en: "Sweetcorn",      emoji: "🌽", cat: "legume" },
  { fr: "Concombre",         en: "Cucumber",       emoji: "🥒", cat: "legume" },
  { fr: "Céleri",            en: "Celery",         emoji: "🥬", cat: "legume" },
  { fr: "Poireau",           en: "Leek",           emoji: "🥬", cat: "legume" },
  { fr: "Betterave",         en: "Beetroot",       emoji: "🟣", cat: "legume" },
  { fr: "Potiron",           en: "Pumpkin",        emoji: "🎃", cat: "legume" },
  { fr: "Navet",             en: "Turnip",         emoji: "🥔", cat: "legume" },
  { fr: "Radis",             en: "Radish",         emoji: "🔴", cat: "legume" },
  { fr: "Fenouil",           en: "Fennel",         emoji: "🌿", cat: "legume" },
  { fr: "Asperge",           en: "Asparagus",      emoji: "🌿", cat: "legume" },
  { fr: "Gingembre",         en: "Ginger",         emoji: "🫚", cat: "legume" },
  { fr: "Avocat",            en: "Avocado",        emoji: "🥑", cat: "legume" },

  // Fruits
  { fr: "Pomme",             en: "Apple",          emoji: "🍎", cat: "fruit" },
  { fr: "Banane",            en: "Banana",         emoji: "🍌", cat: "fruit" },
  { fr: "Orange",            en: "Orange",         emoji: "🍊", cat: "fruit" },
  { fr: "Citron",            en: "Lemon",          emoji: "🍋", cat: "fruit" },
  { fr: "Citron vert",       en: "Lime",           emoji: "🍋", cat: "fruit" },
  { fr: "Fraise",            en: "Strawberries",   emoji: "🍓", cat: "fruit" },
  { fr: "Framboise",         en: "Raspberries",    emoji: "🫐", cat: "fruit" },
  { fr: "Myrtille",          en: "Blueberries",    emoji: "🫐", cat: "fruit" },
  { fr: "Mangue",            en: "Mango",          emoji: "🥭", cat: "fruit" },
  { fr: "Ananas",            en: "Pineapple",      emoji: "🍍", cat: "fruit" },
  { fr: "Raisin",            en: "Grapes",         emoji: "🍇", cat: "fruit" },
  { fr: "Pêche",             en: "Peach",          emoji: "🍑", cat: "fruit" },
  { fr: "Poire",             en: "Pear",           emoji: "🍐", cat: "fruit" },
  { fr: "Noix de coco",      en: "Coconut",        emoji: "🥥", cat: "fruit" },

  // Produits laitiers & œufs
  { fr: "Lait",              en: "Milk",           emoji: "🥛", cat: "laitier" },
  { fr: "Beurre",            en: "Butter",         emoji: "🧈", cat: "laitier" },
  { fr: "Œuf",               en: "Egg",            emoji: "🥚", cat: "laitier" },
  { fr: "Oeuf",              en: "Egg",            emoji: "🥚", cat: "laitier" },
  { fr: "Fromage",           en: "Cheese",         emoji: "🧀", cat: "laitier" },
  { fr: "Cheddar",           en: "Cheddar Cheese", emoji: "🧀", cat: "laitier" },
  { fr: "Parmesan",          en: "Parmesan",       emoji: "🧀", cat: "laitier" },
  { fr: "Mozzarella",        en: "Mozzarella",     emoji: "🧀", cat: "laitier" },
  { fr: "Feta",              en: "Feta",           emoji: "🧀", cat: "laitier" },
  { fr: "Crème fraîche",     en: "Creme Fraiche",  emoji: "🥛", cat: "laitier" },
  { fr: "Crème",             en: "Double Cream",   emoji: "🥛", cat: "laitier" },
  { fr: "Yaourt",            en: "Yogurt",         emoji: "🥛", cat: "laitier" },

  // Épicerie / placard
  { fr: "Riz",               en: "Rice",           emoji: "🍚", cat: "epicerie" },
  { fr: "Pâtes",             en: "Spaghetti",      emoji: "🍝", cat: "epicerie" },
  { fr: "Spaghetti",         en: "Spaghetti",      emoji: "🍝", cat: "epicerie" },
  { fr: "Farine",            en: "Flour",          emoji: "🌾", cat: "epicerie" },
  { fr: "Sucre",             en: "Sugar",          emoji: "🍬", cat: "epicerie" },
  { fr: "Sel",               en: "Salt",           emoji: "🧂", cat: "epicerie" },
  { fr: "Poivre",            en: "Pepper",         emoji: "🌶️", cat: "epicerie" },
  { fr: "Huile d'olive",     en: "Olive Oil",      emoji: "🫒", cat: "epicerie" },
  { fr: "Huile",             en: "Vegetable Oil",  emoji: "🛢️", cat: "epicerie" },
  { fr: "Vinaigre",          en: "Vinegar",        emoji: "🧴", cat: "epicerie" },
  { fr: "Vinaigre balsamique", en: "Balsamic Vinegar", emoji: "🧴", cat: "epicerie" },
  { fr: "Moutarde",          en: "Mustard",        emoji: "🟡", cat: "epicerie" },
  { fr: "Ketchup",           en: "Tomato Ketchup", emoji: "🍅", cat: "epicerie" },
  { fr: "Mayonnaise",        en: "Mayonnaise",     emoji: "🥚", cat: "epicerie" },
  { fr: "Sauce soja",        en: "Soy Sauce",      emoji: "🍶", cat: "epicerie" },
  { fr: "Miel",              en: "Honey",          emoji: "🍯", cat: "epicerie" },
  { fr: "Pain",              en: "Bread",          emoji: "🍞", cat: "epicerie" },
  { fr: "Chapelure",         en: "Breadcrumbs",    emoji: "🍞", cat: "epicerie" },
  { fr: "Levure",            en: "Baking Powder",  emoji: "🌾", cat: "epicerie" },
  { fr: "Chocolat",          en: "Dark Chocolate", emoji: "🍫", cat: "epicerie" },
  { fr: "Cacao",             en: "Cocoa",          emoji: "🍫", cat: "epicerie" },
  { fr: "Lentilles",         en: "Lentils",        emoji: "🟤", cat: "epicerie" },
  { fr: "Pois chiches",      en: "Chickpeas",      emoji: "🟤", cat: "epicerie" },
  { fr: "Haricots rouges",   en: "Kidney Beans",   emoji: "🫘", cat: "epicerie" },
  { fr: "Couscous",          en: "Couscous",       emoji: "🌾", cat: "epicerie" },
  { fr: "Quinoa",            en: "Quinoa",         emoji: "🌾", cat: "epicerie" },
  { fr: "Tomates concassées",en: "Chopped Tomatoes", emoji: "🥫", cat: "epicerie" },
  { fr: "Concentré de tomate", en: "Tomato Puree", emoji: "🥫", cat: "epicerie" },
  { fr: "Lait de coco",      en: "Coconut Milk",   emoji: "🥥", cat: "epicerie" },
  { fr: "Bouillon",          en: "Stock",          emoji: "🥣", cat: "epicerie" },
  { fr: "Bouillon de poulet",en: "Chicken Stock",  emoji: "🥣", cat: "epicerie" },
  { fr: "Bouillon de légumes", en: "Vegetable Stock", emoji: "🥣", cat: "epicerie" },
  { fr: "Noix",              en: "Walnuts",        emoji: "🌰", cat: "epicerie" },
  { fr: "Amande",            en: "Almonds",        emoji: "🌰", cat: "epicerie" },
  { fr: "Cacahuète",         en: "Peanuts",        emoji: "🥜", cat: "epicerie" },
  { fr: "Beurre de cacahuète", en: "Peanut Butter", emoji: "🥜", cat: "epicerie" },

  // Herbes & épices
  { fr: "Basilic",           en: "Basil",          emoji: "🌿", cat: "herbe" },
  { fr: "Persil",            en: "Parsley",        emoji: "🌿", cat: "herbe" },
  { fr: "Coriandre",         en: "Coriander",      emoji: "🌿", cat: "herbe" },
  { fr: "Thym",              en: "Thyme",          emoji: "🌿", cat: "herbe" },
  { fr: "Romarin",           en: "Rosemary",       emoji: "🌿", cat: "herbe" },
  { fr: "Menthe",            en: "Mint",           emoji: "🌿", cat: "herbe" },
  { fr: "Origan",            en: "Oregano",        emoji: "🌿", cat: "herbe" },
  { fr: "Laurier",           en: "Bay Leaf",       emoji: "🍃", cat: "herbe" },
  { fr: "Cumin",             en: "Cumin",          emoji: "🌶️", cat: "herbe" },
  { fr: "Curry",             en: "Curry Powder",   emoji: "🍛", cat: "herbe" },
  { fr: "Paprika",           en: "Paprika",        emoji: "🌶️", cat: "herbe" },
  { fr: "Cannelle",          en: "Cinnamon",       emoji: "🌿", cat: "herbe" },
  { fr: "Muscade",           en: "Nutmeg",         emoji: "🌰", cat: "herbe" },
  { fr: "Curcuma",           en: "Turmeric",       emoji: "🟡", cat: "herbe" },
  { fr: "Piment",            en: "Chili",          emoji: "🌶️", cat: "herbe" },
  { fr: "Safran",            en: "Saffron",        emoji: "🌸", cat: "herbe" },

  // Boissons / autres
  { fr: "Vin blanc",         en: "White Wine",     emoji: "🍷", cat: "autre" },
  { fr: "Vin rouge",         en: "Red Wine",       emoji: "🍷", cat: "autre" }
];

/* Normalise une chaîne : minuscules, sans accents, espaces compactés. */
window.normalizeFr = function (s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

/* Index normalisé FR -> entrée. */
window.FR_INDEX = (function () {
  const idx = {};
  for (const it of window.FR_INGREDIENTS) idx[window.normalizeFr(it.fr)] = it;
  return idx;
})();

/* Retourne l'entrée correspondant à un nom FR libre (exact, sinon meilleure
   correspondance partielle). Renvoie null si rien de pertinent. */
window.lookupIngredient = function (frName) {
  const n = window.normalizeFr(frName);
  if (!n) return null;
  if (window.FR_INDEX[n]) return window.FR_INDEX[n];
  // singulier/pluriel simple sur la chaîne entière
  const sing = n.replace(/s$/, "");
  if (window.FR_INDEX[sing]) return window.FR_INDEX[sing];

  // correspondance par frontière de mot : un ingrédient connu doit apparaître
  // comme un mot entier dans le texte saisi (évite « écrémé » -> « crème »).
  const words = n.split(" ");
  const nSing = words.map((w) => w.replace(/s$/, "")).join(" ");
  const padded = ` ${n} `;
  const paddedSing = ` ${nSing} `;
  let best = null, bestLen = 0;
  for (const it of window.FR_INGREDIENTS) {
    const key = window.normalizeFr(it.fr);
    const probe = ` ${key} `;
    if (padded.includes(probe) || paddedSing.includes(probe)) {
      if (key.length > bestLen) { best = it; bestLen = key.length; }
    }
  }
  return best;
};
