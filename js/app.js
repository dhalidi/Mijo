"use strict";

/* ============================================================
   Mijo — logique applicative
   Stockage 100% local (localStorage), recettes via TheMealDB.
   ============================================================ */

const API = "https://www.themealdb.com/api/json/v1/1";
const STORE_KEY = "frigo.items.v1";
const SET_KEY = "frigo.settings.v1";

/* ---------- Utilitaires DOM ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };

/* ---------- Stockage ---------- */
function loadItems() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}
function saveItems(items) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(items)); }
  catch (e) { warnStorage(); }
}
function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SET_KEY)) || {}; }
  catch { return {}; }
}
function saveSettings(s) {
  try { localStorage.setItem(SET_KEY, JSON.stringify(s)); }
  catch (e) { /* réglages non critiques */ }
}

/* Vérifie que le stockage local est utilisable (sinon : mode privé / bloqué). */
let _storageWarned = false;
function warnStorage() {
  if (_storageWarned) return;
  _storageWarned = true;
  toast("⚠️ Ton navigateur bloque la sauvegarde (navigation privée ?)");
}
function checkStorage() {
  try {
    const k = "frigo.test";
    localStorage.setItem(k, "1"); localStorage.removeItem(k);
  } catch (e) { warnStorage(); }
}

/* ---------- Dates ---------- */
function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function todayISO() {
  const d = startOfDay(new Date());
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isoPlusDays(n) {
  const d = startOfDay(new Date()); d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function daysUntil(iso) {
  if (!iso) return 9999;
  const [y, m, d] = iso.split("-").map(Number);
  const exp = new Date(y, m - 1, d);
  const today = startOfDay(new Date());
  return Math.round((exp - today) / 86400000);
}
function formatFrDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}
/* niveau d'urgence + texte du badge */
function urgency(iso) {
  const d = daysUntil(iso);
  if (d < 0) return { level: "urgent", label: `Périmé (${-d} j)` };
  if (d === 0) return { level: "urgent", label: "Aujourd'hui" };
  if (d === 1) return { level: "urgent", label: "Demain" };
  if (d === 2) return { level: "urgent", label: "Dans 2 j" };
  if (d <= 5) return { level: "soon", label: `Dans ${d} j` };
  if (d <= 14) return { level: "ok", label: `Dans ${d} j` };
  return { level: "ok", label: formatFrDate(iso) };
}

/* ---------- Ingrédients : helpers ---------- */
const EN_TO_FR = (function () {
  const m = {};
  for (const it of window.FR_INGREDIENTS) {
    const key = window.normalizeFr(it.en);
    if (!m[key]) m[key] = it.fr;
  }
  return m;
})();
function frForEnglish(en) { return EN_TO_FR[window.normalizeFr(en)] || null; }

/* Renvoie {en, emoji} pour un nom FR saisi. */
function resolveIngredient(name) {
  const hit = window.lookupIngredient(name);
  return hit ? { en: hit.en, emoji: hit.emoji } : { en: null, emoji: "🥗" };
}

/* ============================================================
   Navigation par onglets
   ============================================================ */
function switchView(view) {
  $$(".view").forEach((v) => v.classList.toggle("view--active", v.id === `view-${view}`));
  $$(".tab").forEach((t) => t.classList.toggle("tab--active", t.dataset.view === view));
  $("#fab").classList.toggle("fab--hidden", view !== "frigo");
  window.scrollTo({ top: 0 });
}
$$(".tab").forEach((t) => t.addEventListener("click", () => switchView(t.dataset.view)));

/* ============================================================
   Rendu du frigo
   ============================================================ */
function renderStock() {
  const items = loadItems();
  const sort = $("#sort-select").value;
  items.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "fr");
    if (sort === "added") return (b.added || 0) - (a.added || 0);
    return (a.expiry || "").localeCompare(b.expiry || ""); // péremption
  });

  $("#stock-count").textContent = items.length;
  $("#stock-empty").style.display = items.length ? "none" : "block";

  const list = $("#stock-list");
  list.innerHTML = "";

  for (const item of items) {
    const u = urgency(item.expiry);
    const li = el("li", `item item--${u.level}`);

    const ic = el("div", "item__emoji");
    ic.textContent = item.emoji || "🥗";

    const main = el("div", "item__main");
    const name = el("div", "item__name");
    name.textContent = item.name;
    const sub = el("div", "item__sub");
    const qtyTxt = item.qty ? `<span class="item__qty">${escapeHtml(item.qty)}</span> · ` : "";
    sub.innerHTML = `${qtyTxt}Périme le ${formatFrDate(item.expiry)}`;
    main.append(name, sub);

    const badge = el("span", "item__badge");
    badge.textContent = u.label;

    const done = el("button", "item__done");
    done.title = "J'ai consommé / jeté";
    done.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
    done.addEventListener("click", (e) => { e.stopPropagation(); removeItem(item.id, true); });

    li.append(ic, main, badge, done);
    li.addEventListener("click", () => openSheet(item));
    list.append(li);
  }

  renderBanner(items);
}

function renderBanner(items) {
  const banner = $("#alert-banner");
  const urgent = items.filter((i) => daysUntil(i.expiry) <= 2);
  if (!urgent.length) { banner.classList.add("banner--hidden"); return; }
  banner.classList.remove("banner--hidden");
  const names = urgent.slice(0, 3).map((i) => i.name).join(", ");
  const extra = urgent.length > 3 ? ` +${urgent.length - 3}` : "";
  banner.innerHTML =
    `<span>⚠️</span><span><b>${urgent.length} à consommer très vite&nbsp;:</b> ${escapeHtml(names)}${extra}. ` +
    `<u style="cursor:pointer" id="banner-cook">Cuisiner ça →</u></span>`;
  $("#banner-cook")?.addEventListener("click", () => { switchView("recettes"); suggestRecipes(); });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ============================================================
   Ajout / édition (feuille modale)
   ============================================================ */
function openSheet(item) {
  const isEdit = !!item;
  $("#sheet-title").textContent = isEdit ? "Modifier l'aliment" : "Ajouter un aliment";
  $("#item-id").value = isEdit ? item.id : "";
  $("#item-name").value = isEdit ? item.name : "";
  $("#item-qty").value = isEdit ? (item.qty || "") : "";
  $("#item-expiry").value = isEdit ? item.expiry : isoPlusDays(5);
  $("#item-expiry").min = "2000-01-01";
  $("#btn-delete-item").hidden = !isEdit;

  $("#sheet-backdrop").hidden = false;
  $("#item-sheet").hidden = false;
  setTimeout(() => $("#item-name").focus(), 120);
}
function closeSheet() {
  $("#item-sheet").hidden = true;
  $("#sheet-backdrop").hidden = true;
  $("#item-form").reset();
}

$("#item-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = $("#item-id").value;
  const name = $("#item-name").value.trim();
  const expiry = $("#item-expiry").value;
  const qty = $("#item-qty").value.trim();
  if (!name || !expiry) return;

  const items = loadItems();
  const resolved = resolveIngredient(name);

  if (id) {
    const it = items.find((x) => x.id === id);
    if (it) { it.name = name; it.expiry = expiry; it.qty = qty; it.en = resolved.en; it.emoji = resolved.emoji; }
  } else {
    items.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name, expiry, qty, en: resolved.en, emoji: resolved.emoji, added: Date.now(),
    });
  }
  saveItems(items);
  closeSheet();
  renderStock();
  toast(id ? "Aliment mis à jour" : "Aliment ajouté ✓");
});

$("#btn-cancel").addEventListener("click", closeSheet);
$("#sheet-backdrop").addEventListener("click", closeSheet);
$("#fab").addEventListener("click", () => openSheet(null));
$("#stock-empty").addEventListener("click", (e) => { if (e.target.dataset.action === "add-first") openSheet(null); });
$("#sort-select").addEventListener("change", renderStock);

$("#btn-delete-item").addEventListener("click", () => {
  const id = $("#item-id").value;
  closeSheet();
  if (id) removeItem(id, false);
});

$("#quickdates").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-days]");
  if (btn) $("#item-expiry").value = isoPlusDays(Number(btn.dataset.days));
});

/* Suppression avec possibilité d'annuler */
let lastRemoved = null;
function removeItem(id, consumed) {
  const items = loadItems();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return;
  lastRemoved = { item: items[idx], idx };
  items.splice(idx, 1);
  saveItems(items);
  renderStock();
  toast(consumed ? "Consommé 👍" : "Supprimé", "Annuler", undoRemove);
}
function undoRemove() {
  if (!lastRemoved) return;
  const items = loadItems();
  items.splice(Math.min(lastRemoved.idx, items.length), 0, lastRemoved.item);
  saveItems(items);
  lastRemoved = null;
  renderStock();
}

/* ============================================================
   Toast
   ============================================================ */
let toastTimer = null;
function toast(msg, actionLabel, actionFn) {
  const t = $("#toast");
  t.innerHTML = "";
  t.append(document.createTextNode(msg));
  if (actionLabel) {
    const b = el("button");
    b.textContent = actionLabel;
    b.addEventListener("click", () => { actionFn && actionFn(); hideToast(); });
    t.append(b);
  }
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 4200);
}
function hideToast() { $("#toast").hidden = true; }

/* ============================================================
   Recettes — appels API (avec cache mémoire)
   ============================================================ */
const cacheFilter = new Map();
const cacheLookup = new Map();

async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}
async function fetchFilter(ingredientEn) {
  if (cacheFilter.has(ingredientEn)) return cacheFilter.get(ingredientEn);
  try {
    const d = await apiGet(`${API}/filter.php?i=${encodeURIComponent(ingredientEn)}`);
    const meals = d.meals || [];
    cacheFilter.set(ingredientEn, meals);
    return meals;
  } catch { return []; }
}
async function fetchLookup(id) {
  if (cacheLookup.has(id)) return cacheLookup.get(id);
  const d = await apiGet(`${API}/lookup.php?i=${encodeURIComponent(id)}`);
  const meal = (d.meals && d.meals[0]) || null;
  cacheLookup.set(id, meal);
  return meal;
}
async function fetchSearch(name) {
  const d = await apiGet(`${API}/search.php?s=${encodeURIComponent(name)}`);
  return d.meals || [];
}

/* ---------- Suggestion basée sur le frigo ---------- */
async function suggestRecipes() {
  const items = loadItems();
  const grid = $("#recipe-grid");
  const status = $("#recipe-status");
  const empty = $("#recipe-empty");
  grid.innerHTML = "";
  empty.style.display = "none";
  status.style.textAlign = ""; status.style.padding = "";

  if (!items.length) {
    status.hidden = false;
    status.innerHTML = `Ton frigo est vide 🛒<br>Ajoute des aliments dans l'onglet <b>Frigo</b> pour avoir des idées.`;
    return;
  }

  // ingrédients EN uniques, en gardant le délai de péremption le plus court
  const byExpiry = [...items].sort((a, b) => (a.expiry || "").localeCompare(b.expiry || ""));
  const enDays = new Map();
  const enList = [];
  let untranslated = 0;
  for (const it of byExpiry) {
    const en = it.en || resolveIngredient(it.name).en;
    if (!en) { untranslated++; continue; }
    if (!enDays.has(en)) { enDays.set(en, daysUntil(it.expiry)); enList.push(en); }
    else enDays.set(en, Math.min(enDays.get(en), daysUntil(it.expiry)));
  }

  if (!enList.length) {
    status.hidden = false;
    status.innerHTML = `On n'a pas réussi à reconnaître tes aliments pour chercher des recettes 😕<br>Essaie des noms simples (Poulet, Tomate, Riz…).`;
    return;
  }

  status.hidden = false;
  status.innerHTML = `<div class="spinner"></div>On cherche des recettes avec tes ${enList.length} ingrédient(s)…`;

  const query = enList.slice(0, 12); // limite le nombre d'appels
  const urgentEn = new Set(query.filter((e) => enDays.get(e) <= 2));

  let resultsByIng;
  try {
    resultsByIng = await Promise.all(query.map(fetchFilter));
  } catch {
    status.innerHTML = `Impossible de joindre le service de recettes 📡<br>Vérifie ta connexion internet et réessaie.`;
    return;
  }

  // agrégation : combien de TES ingrédients chaque plat utilise
  const meals = new Map();
  query.forEach((ing, i) => {
    for (const m of resultsByIng[i]) {
      if (!meals.has(m.idMeal)) meals.set(m.idMeal, { meal: m, matched: new Set() });
      meals.get(m.idMeal).matched.add(ing);
    }
  });

  const ranked = Array.from(meals.values()).map((o) => {
    const usesUrgent = Array.from(o.matched).some((e) => urgentEn.has(e));
    return { meal: o.meal, count: o.matched.size, usesUrgent, score: o.matched.size + (usesUrgent ? 100 : 0) };
  }).sort((a, b) => b.score - a.score);

  if (!ranked.length) {
    status.hidden = true;
    empty.style.display = "block";
    empty.querySelector("h2").textContent = "Aucune recette trouvée";
    empty.querySelector("p").textContent = "Ajoute quelques basiques (poulet, œuf, riz, tomate…) et réessaie.";
    return;
  }

  // compteur discret au-dessus de la grille
  status.hidden = false;
  status.style.textAlign = "left";
  status.style.padding = "0 2px 12px";
  const hasUrgent = ranked.some((r) => r.usesUrgent);
  status.innerHTML = `<b>${ranked.length}</b> idées trouvées` +
    (hasUrgent ? ` · 🔥 = utilise un aliment qui périme bientôt` : "") +
    (untranslated ? ` · ${untranslated} aliment(s) non reconnus` : "");
  renderRecipeCards(ranked.slice(0, 30), true);
}

/* ---------- Recherche par nom ---------- */
let searchTimer = null;
$("#recipe-search").addEventListener("input", (e) => {
  const q = e.target.value.trim();
  clearTimeout(searchTimer);
  if (q.length < 2) return;
  searchTimer = setTimeout(() => runSearch(q), 350);
});
async function runSearch(q) {
  const grid = $("#recipe-grid");
  const status = $("#recipe-status");
  $("#recipe-empty").style.display = "none";
  grid.innerHTML = "";
  status.style.textAlign = ""; status.style.padding = "";
  status.hidden = false;
  status.innerHTML = `<div class="spinner"></div>Recherche « ${escapeHtml(q)} »…`;
  let meals;
  try { meals = await fetchSearch(q); }
  catch { status.innerHTML = "Erreur réseau 📡"; return; }
  status.hidden = true;
  if (!meals.length) {
    $("#recipe-empty").style.display = "block";
    $("#recipe-empty").querySelector("h2").textContent = "Rien trouvé";
    $("#recipe-empty").querySelector("p").textContent = `Aucune recette pour « ${q} ». Essaie un mot anglais (ex. « pasta », « curry »).`;
    return;
  }
  const stockEn = stockEnSet();
  const ranked = meals.map((m) => {
    // compte les ingrédients de la recette présents dans le frigo
    const ings = extractIngredients(m).map((x) => x.en);
    const count = ings.filter((ing) => stockHas(stockEn, ing)).length;
    return { meal: { idMeal: m.idMeal, strMeal: m.strMeal, strMealThumb: m.strMealThumb }, count, usesUrgent: false, full: m };
  });
  ranked.forEach((r) => cacheLookup.set(r.meal.idMeal, r.full));
  renderRecipeCards(ranked, false);
}

/* ---------- Cartes recettes ---------- */
function renderRecipeCards(list, showMatch) {
  const grid = $("#recipe-grid");
  grid.innerHTML = "";
  for (const r of list) {
    const card = el("button", "rcard");
    card.addEventListener("click", () => openDetail(r.meal.idMeal));

    const img = el("img", "rcard__img");
    img.loading = "lazy";
    img.src = r.meal.strMealThumb ? r.meal.strMealThumb + "/preview" : "";
    img.alt = r.meal.strMeal;
    card.append(img);

    if (r.usesUrgent) {
      const fire = el("span", "rcard__fire");
      fire.textContent = "🔥 Anti-gaspi";
      card.append(fire);
    }

    const body = el("div", "rcard__body");
    const name = el("div", "rcard__name");
    name.textContent = r.meal.strMeal;
    body.append(name);
    if (showMatch && r.count) {
      const match = el("span", "rcard__match");
      match.textContent = `${r.count} de ton frigo`;
      body.append(match);
    } else if (!showMatch && r.count) {
      const match = el("span", "rcard__match");
      match.textContent = `${r.count} ingréd. en stock`;
      body.append(match);
    }
    card.append(body);
    grid.append(card);
  }
}

/* ---------- Extraction des ingrédients d'un plat ---------- */
function extractIngredients(meal) {
  const out = [];
  for (let i = 1; i <= 20; i++) {
    const ing = (meal[`strIngredient${i}`] || "").trim();
    const mea = (meal[`strMeasure${i}`] || "").trim();
    if (ing) out.push({ en: ing, measure: mea });
  }
  return out;
}
function stockEnSet() {
  const set = new Set();
  for (const it of loadItems()) {
    const en = it.en || resolveIngredient(it.name).en;
    if (en) set.add(window.normalizeFr(en));
  }
  return set;
}
function stockHas(stockSet, ingEn) {
  const n = window.normalizeFr(ingEn);
  for (const s of stockSet) {
    if (n === s || n.includes(s) || s.includes(n)) return true;
  }
  return false;
}

/* ---------- Détail recette ---------- */
async function openDetail(id) {
  const detail = $("#recipe-detail");
  const body = $("#detail-body");
  detail.hidden = false;
  document.body.style.overflow = "hidden";
  body.innerHTML = `<div class="status" style="padding:60px 0"><div class="spinner"></div>Chargement…</div>`;
  $("#detail-bartitle").textContent = "";

  let meal;
  try { meal = await fetchLookup(id); }
  catch { body.innerHTML = `<div class="status" style="padding:60px 0">Erreur de chargement 📡</div>`; return; }
  if (!meal) { body.innerHTML = `<div class="status">Recette introuvable.</div>`; return; }

  $("#detail-bartitle").textContent = meal.strMeal;
  const stockEn = stockEnSet();
  const ings = extractIngredients(meal);

  const ingHtml = ings.map((x) => {
    const has = stockHas(stockEn, x.en);
    const frName = frForEnglish(x.en);
    const label = frName ? `${frName}` : x.en;
    return `<li class="${has ? "has" : ""}">
      <span class="ing-mark">${has ? "✓" : ""}</span>
      <span>${escapeHtml(label)}</span>
      <span class="ing-measure">${escapeHtml(x.measure)}</span>
    </li>`;
  }).join("");

  const haveCount = ings.filter((x) => stockHas(stockEn, x.en)).length;
  const instr = (meal.strInstructions || "").trim();
  const translateUrl = "https://translate.google.com/?sl=en&tl=fr&op=translate&text=" +
    encodeURIComponent(instr.slice(0, 1800));

  const tags = [];
  if (meal.strCategory) tags.push(meal.strCategory);
  if (meal.strArea) tags.push(meal.strArea);

  body.innerHTML = `
    <img class="detail__hero" src="${meal.strMealThumb}" alt="${escapeHtml(meal.strMeal)}" />
    <div class="detail__content">
      <h2 class="detail__title">${escapeHtml(meal.strMeal)}</h2>
      <div class="detail__tags">
        ${tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
        <span class="tag" style="background:var(--soon-soft);color:#9a6500">${haveCount}/${ings.length} ingrédients en stock</span>
      </div>

      <h3>🧺 Ingrédients</h3>
      <ul class="ing-list">${ingHtml}</ul>

      <h3>👨‍🍳 Préparation <em style="font-weight:400">(en anglais)</em></h3>
      <p class="steps">${escapeHtml(instr)}</p>

      <div class="detail__links">
        <a class="linkbtn linkbtn--g" href="${translateUrl}" target="_blank" rel="noopener">🔁 Traduire en français</a>
        ${meal.strYoutube ? `<a class="linkbtn linkbtn--o" href="${meal.strYoutube}" target="_blank" rel="noopener">▶️ Vidéo</a>` : ""}
        ${meal.strSource ? `<a class="linkbtn linkbtn--o" href="${meal.strSource}" target="_blank" rel="noopener">🔗 Source</a>` : ""}
      </div>
    </div>`;
  $("#recipe-detail").scrollTop = 0;
}
function closeDetail() {
  $("#recipe-detail").hidden = true;
  document.body.style.overflow = "";
}
$("#btn-detail-close").addEventListener("click", closeDetail);
$("#btn-suggest").addEventListener("click", suggestRecipes);

/* ============================================================
   Notifications de péremption
   ============================================================ */
function refreshNotifyButton() {
  const s = loadSettings();
  const on = s.notify && "Notification" in window && Notification.permission === "granted";
  $("#btn-notify").classList.toggle("is-on", !!on);
}
$("#btn-notify").addEventListener("click", async () => {
  if (!("Notification" in window)) { toast("Notifications non supportées sur cet appareil"); return; }
  if (Notification.permission === "granted") {
    const s = loadSettings(); s.notify = !s.notify; saveSettings(s);
    refreshNotifyButton();
    toast(s.notify ? "Rappels activés 🔔" : "Rappels désactivés");
    if (s.notify) checkExpiryNotify(true);
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === "granted") {
    const s = loadSettings(); s.notify = true; saveSettings(s);
    refreshNotifyButton();
    toast("Rappels activés 🔔");
    checkExpiryNotify(true);
  } else {
    toast("Permission refusée");
  }
});
function checkExpiryNotify(force) {
  const s = loadSettings();
  if (!s.notify || !("Notification" in window) || Notification.permission !== "granted") return;
  const today = todayISO();
  if (!force && s.lastNotify === today) return; // une fois par jour max
  const urgent = loadItems().filter((i) => daysUntil(i.expiry) <= 1);
  if (!urgent.length) return;
  s.lastNotify = today; saveSettings(s);
  const names = urgent.slice(0, 4).map((i) => i.name).join(", ");
  try {
    new Notification("🍲 Mijo — à consommer vite", {
      body: `${urgent.length} aliment(s) périment bientôt : ${names}`,
      icon: "icons/icon-192.png",
      tag: "frigo-expiry",
    });
  } catch { /* certains navigateurs exigent le service worker */ }
}

/* ============================================================
   Démarrage
   ============================================================ */
function populateDatalist() {
  const dl = $("#ingredient-list");
  dl.innerHTML = window.FR_INGREDIENTS.map((it) => `<option value="${escapeHtml(it.fr)}">`).join("");
}
function init() {
  checkStorage();
  populateDatalist();
  renderStock();
  refreshNotifyButton();
  checkExpiryNotify(false);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  // Échap ferme les overlays
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!$("#recipe-detail").hidden) closeDetail();
    else if (!$("#item-sheet").hidden) closeSheet();
  });
}
init();
