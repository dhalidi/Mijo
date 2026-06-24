"use strict";
/* ============================================================
   Scan : code-barres (Open Food Facts) + reconnaissance photo (IA
   on-device, MobileNet) + lecture de la date par OCR (Tesseract).
   Bibliothèques gratuites chargées à la demande depuis un CDN.
   Réutilise les fonctions globales de app.js ($, openSheet, toast,
   isoPlusDays, todayISO, formatFrDate).
   ============================================================ */

const CDN = {
  qr:   "https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js",
  ocr:  "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js",
  tf:   "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js",
  mnet: "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js",
};

/* ---------- chargement paresseux de scripts ---------- */
const _scripts = {};
function loadScript(src) {
  if (_scripts[src]) return _scripts[src];
  _scripts[src] = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src; s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { delete _scripts[src]; reject(new Error("Échec de chargement : " + src)); };
    document.head.appendChild(s);
  });
  return _scripts[src];
}
const ensureBarcode = () => loadScript(CDN.qr);
const ensureOCR = () => loadScript(CDN.ocr);
async function ensureMobilenet() { await loadScript(CDN.tf); await loadScript(CDN.mnet); }

/* ---------- éléments ---------- */
const scanOverlay = $("#scan-overlay");
const scanStatus = $("#scan-status");
const scanNameInput = $("#scan-name");
const scanExpiryInput = $("#scan-expiry");

function setStatus(html, cls) {
  scanStatus.className = "scan__status" + (cls ? " " + cls : "");
  scanStatus.innerHTML = html;
}
const spin = (txt) => `<span class="spinner"></span>${txt}`;

/* ============================================================
   Scanner de code-barres (live)
   ============================================================ */
let qr = null, scanning = false;

async function startBarcode() {
  setStatus(spin("Activation de la caméra…"));
  try {
    await ensureBarcode();
    if (!qr) qr = new Html5Qrcode("scan-reader", {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A, Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.ITF,
      ],
      useBarCodeDetectorIfSupported: true,
      verbose: false,
    });
    await qr.start({ facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 150 } },
      onBarcode, () => {});
    scanning = true;
    setStatus("Vise le code-barres du produit 📷");
  } catch (e) {
    setStatus("Caméra indisponible ici. Utilise les boutons photo ci-dessous 👇", "err");
  }
}
async function stopBarcode() {
  if (qr && scanning) { try { await qr.stop(); } catch {} scanning = false; }
}
async function onBarcode(code) {
  if (navigator.vibrate) navigator.vibrate(60);
  await stopBarcode();
  setStatus(spin(`Code ${code} — recherche du produit…`));
  try {
    const name = await lookupBarcode(code);
    if (name) {
      scanNameInput.value = name;
      setStatus(`✓ Produit reconnu : <b>${escapeHtml(name)}</b>`, "ok");
    } else {
      setStatus(`Produit ${code} introuvable dans Open Food Facts. Saisis le nom à la main 👇`, "err");
    }
  } catch {
    setStatus("Erreur réseau lors de la recherche du produit 📡", "err");
  }
}
async function lookupBarcode(code) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json` +
    `?fields=product_name_fr,product_name,generic_name_fr,generic_name,brands`;
  const res = await fetch(url);
  const d = await res.json();
  if (d.status !== 1 || !d.product) return null;
  const p = d.product;
  let name = p.product_name_fr || p.product_name || p.generic_name_fr || p.generic_name || "";
  name = name.trim();
  if (name.length > 60) name = name.slice(0, 60).trim() + "…";
  return name || null;
}

/* ============================================================
   Reconnaissance photo (IA on-device)
   ============================================================ */
let mnetModel = null;

/* Étiquettes ImageNet utiles -> nom FR (resolveIngredient fera le reste). */
const IMAGENET_FR = [
  ["granny smith", "Pomme"], ["banana", "Banane"], ["orange", "Orange"], ["lemon", "Citron"],
  ["lime", "Citron vert"], ["pineapple", "Ananas"], ["strawberry", "Fraise"], ["fig", "Figue"],
  ["pomegranate", "Grenade"], ["jackfruit", "Jacquier"], ["custard apple", "Pomme cannelle"],
  ["broccoli", "Brocoli"], ["cauliflower", "Chou-fleur"], ["head cabbage", "Chou"], ["cabbage", "Chou"],
  ["cucumber", "Concombre"], ["zucchini", "Courgette"], ["courgette", "Courgette"],
  ["bell pepper", "Poivron"], ["mushroom", "Champignon"], ["artichoke", "Artichaut"],
  ["corn", "Maïs"], ["butternut squash", "Courge butternut"], ["acorn squash", "Courge"],
  ["spaghetti squash", "Courge"], ["mashed potato", "Pomme de terre"],
  ["pizza", "Pizza"], ["bagel", "Pain"], ["french loaf", "Pain"], ["pretzel", "Bretzel"],
  ["cheeseburger", "Hamburger"], ["hotdog", "Hot-dog"], ["hot dog", "Hot-dog"],
  ["guacamole", "Guacamole"], ["burrito", "Burrito"], ["meat loaf", "Pain de viande"],
  ["ice cream", "Glace"], ["espresso", "Café"], ["red wine", "Vin rouge"],
  ["eggnog", "Lait de poule"], ["chocolate sauce", "Chocolat"], ["trifle", "Dessert"],
];
function mapPrediction(className) {
  const c = (className || "").toLowerCase();
  for (const [key, fr] of IMAGENET_FR) if (c.includes(key)) return fr;
  // sinon : premier terme, capitalisé
  const first = c.split(",")[0].trim();
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "";
}

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function handleFoodPhoto(file) {
  setStatus(spin("Analyse de la photo… (téléchargement du modèle la 1re fois)"));
  try {
    const img = await fileToImage(file);
    await ensureMobilenet();
    if (!mnetModel) mnetModel = await mobilenet.load();
    const preds = await mnetModel.classify(img, 3);
    URL.revokeObjectURL(img.src);
    if (!preds || !preds.length) { setStatus("Aliment non reconnu. Saisis le nom à la main 👇", "err"); return; }
    const top = preds[0];
    const name = mapPrediction(top.className);
    scanNameInput.value = name;
    const pct = Math.round(top.probability * 100);
    if (top.probability >= 0.4) setStatus(`✓ Probablement : <b>${escapeHtml(name)}</b> (${pct}%)`, "ok");
    else setStatus(`🔎 Peut-être : <b>${escapeHtml(name)}</b> (${pct}%) — vérifie/corrige 👇`);
  } catch (e) {
    setStatus("La reconnaissance a échoué (connexion ?). Saisis le nom à la main 👇", "err");
  }
}

/* ============================================================
   Lecture de la date par OCR
   ============================================================ */
function fileToCanvas(file, maxW) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * scale);
      cv.height = Math.round(img.height * scale);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(img.src);
      resolve(cv);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function handleDatePhoto(file) {
  setStatus(spin("Lecture de la date… (1er chargement un peu long)"));
  try {
    const canvas = await fileToCanvas(file, 1400);
    await ensureOCR();
    const { data: { text } } = await Tesseract.recognize(canvas, "fra+eng", {
      logger: (m) => {
        if (m.status === "recognizing text") setStatus(spin(`Lecture de la date… ${Math.round(m.progress * 100)}%`));
      },
    });
    const iso = parseExpiryFromText(text);
    if (iso) {
      scanExpiryInput.value = iso;
      setStatus(`✓ Date lue : <b>${formatFrDate(iso)}</b>`, "ok");
    } else {
      setStatus("Date illisible 😕 Réessaie en cadrant bien la date, ou saisis-la 👇", "err");
    }
  } catch (e) {
    setStatus("La lecture de la date a échoué (connexion ?). Saisis-la à la main 👇", "err");
  }
}

/* Extrait la meilleure date de péremption d'un texte OCR. */
function parseExpiryFromText(text) {
  const months = {
    janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7,
    aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7,
    august: 8, september: 9, october: 10, november: 11, december: 12,
    jan: 1, feb: 2, fev: 2, mar: 3, apr: 4, avr: 4, jun: 6, jul: 7, juil: 7,
    aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
  };
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const t = " " + text.replace(/\s+/g, " ") + " ";
  const cands = [];
  const add = (y, m, d) => {
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 2020 && y <= 2099) {
      cands.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
  };
  let m;
  // jj/mm/aaaa ou jj-mm-aa ...
  const reNum = /([0-3]?\d)[\/.\- ]([01]?\d)[\/.\- ](\d{2,4})/g;
  while ((m = reNum.exec(t))) { let y = +m[3]; if (y < 100) y += 2000; add(y, +m[2], +m[1]); }
  // aaaa-mm-jj (ISO)
  const reIso = /(20\d{2})[\/.\-]([01]?\d)[\/.\-]([0-3]?\d)/g;
  while ((m = reIso.exec(t))) add(+m[1], +m[2], +m[3]);
  // jj MOIS aaaa
  const reTxt = /([0-3]?\d)[ .]([a-zà-ÿ]{3,9})\.?[ .](\d{2,4})/gi;
  while ((m = reTxt.exec(t))) {
    const mo = months[norm(m[2])];
    if (mo) { let y = +m[3]; if (y < 100) y += 2000; add(y, mo, +m[1]); }
  }
  // mm/aaaa seul (DLUO) -> dernier jour du mois — uniquement si rien trouvé
  if (!cands.length) {
    const reMy = /([01]?\d)[\/.\-](20\d{2})/g;
    while ((m = reMy.exec(t))) {
      const mo = +m[1], y = +m[2];
      if (mo >= 1 && mo <= 12) add(y, mo, new Date(y, mo, 0).getDate());
    }
  }
  if (!cands.length) return null;
  const uniq = [...new Set(cands)].sort();
  const today = todayISO();
  const future = uniq.filter((c) => c >= today);
  return future.length ? future[0] : uniq[uniq.length - 1];
}

/* ============================================================
   Ouverture / fermeture / actions
   ============================================================ */
function openScan() {
  scanOverlay.hidden = false;
  document.body.style.overflow = "hidden";
  scanNameInput.value = "";
  scanExpiryInput.value = isoPlusDays(5);
  setStatus("Vise le code-barres du produit 📷");
  startBarcode();
}
async function closeScan() {
  await stopBarcode();
  scanOverlay.hidden = true;
  document.body.style.overflow = "";
}

function confirmScan() {
  const name = scanNameInput.value.trim();
  const expiry = scanExpiryInput.value;
  if (!name) { setStatus("Indique au moins le nom de l'aliment 👇", "err"); scanNameInput.focus(); return; }
  closeScan();
  openSheet(null);
  $("#item-name").value = name;
  if (expiry) $("#item-expiry").value = expiry;
}

/* ---------- câblage ---------- */
$("#btn-open-scan").addEventListener("click", openScan);
$("#btn-open-scan-top").addEventListener("click", openScan);
$("#btn-scan-close").addEventListener("click", closeScan);
$("#scan-reader").addEventListener("click", () => { if (!scanning) startBarcode(); });

$("#btn-scan-photo").addEventListener("click", async () => { await stopBarcode(); $("#scan-food-input").click(); });
$("#btn-scan-date").addEventListener("click", async () => { await stopBarcode(); $("#scan-date-input").click(); });
$("#btn-scan-confirm").addEventListener("click", confirmScan);

$("#scan-food-input").addEventListener("change", (e) => { const f = e.target.files[0]; if (f) handleFoodPhoto(f); e.target.value = ""; });
$("#scan-date-input").addEventListener("change", (e) => { const f = e.target.files[0]; if (f) handleDatePhoto(f); e.target.value = ""; });

document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !scanOverlay.hidden) closeScan(); });
