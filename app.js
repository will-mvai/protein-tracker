// ---------- Config ----------
const START_DATE = "2026-06-20";
const END_DATE = "2027-06-19"; // one year inclusive
const STORAGE_PREFIX = "protein-tracker:";
const TARGET_KEY = STORAGE_PREFIX + "target";
const LOG_PREFIX = STORAGE_PREFIX + "log:";
const CALC_WEIGHT_KEY = STORAGE_PREFIX + "calc-weight";
const CALC_ACTIVITY_KEY = STORAGE_PREFIX + "calc-activity";

// Protein-per-bodyweight guidance, used by the protein needs calculator.
const ACTIVITY_LEVELS = {
  sedentary: { label: "Sedentary", low: 1.0, high: 1.2 },
  active: { label: "Active", low: 1.2, high: 1.4 },
  very_active: { label: "Very Active", low: 1.4, high: 2.0 },
};
const LBS_PER_KG = 2.2046226218;

// Each recipe's protein total is the sum of its own ingredient list (not a separate rounded estimate),
// so the quick-add number always matches what the detail view shows.
const RECIPES = [
  {
    name: "Pea protein overnight oats",
    meal: "Breakfast",
    serves: 1,
    time: "5 min prep + overnight",
    ingredients: [
      { amount: "1/2 cup", item: "Rolled oats", protein: 5 },
      { amount: "1 cup", item: "Unfortified soy milk", protein: 7 },
      { amount: "1 scoop", item: "Pea protein powder (unfortified)", protein: 15 },
      { amount: "1 tbsp", item: "Almond butter", protein: 3.5 },
      { amount: "1 tbsp", item: "Chopped walnuts (topping)", protein: 1 },
      { amount: "1/2 tsp", item: "Cinnamon (optional)", protein: 0 },
    ],
    steps: [
      "Combine oats, soy milk, pea protein, and almond butter in a jar or bowl. Stir until the protein powder is fully dissolved with no clumps.",
      "Cover and refrigerate overnight, at least 6 hours.",
      "In the morning, stir again and add a splash of soy milk if too thick.",
      "Top with chopped walnuts and cinnamon just before eating.",
    ],
  },
  {
    name: "Tofu scramble bowl",
    meal: "Breakfast",
    serves: 1,
    time: "15 min",
    ingredients: [
      { amount: "6 oz", item: "Firm tofu, pressed and crumbled", protein: 14 },
      { amount: "1/2 tsp", item: "Turmeric", protein: 0 },
      { amount: "1/2 tsp", item: "Garlic powder", protein: 0 },
      { amount: "Pinch", item: "Black salt (kala namak)", protein: 0 },
      { amount: "1 cup", item: "Spinach, chopped", protein: 1 },
      { amount: "1/2", item: "Bell pepper, diced", protein: 0.5 },
      { amount: "1 tsp", item: "Olive oil", protein: 0 },
      { amount: "1 tbsp", item: "Nutritional yeast", protein: 4 },
    ],
    steps: [
      "Heat olive oil in a non-stick pan over medium heat.",
      "Add bell pepper and saute 2-3 minutes until softening.",
      "Add crumbled tofu, turmeric, garlic powder, and black salt. Stir to combine.",
      "Cook 5-6 minutes, stirring occasionally, until tofu is heated through and slightly golden.",
      "Fold in spinach during the last minute, just until wilted.",
      "Finish with nutritional yeast. Pair with a lentil or tofu side (see separate quick-add) to round out the meal.",
    ],
  },
  {
    name: "Oatmeal, regular",
    meal: "Breakfast",
    serves: 1,
    time: "5 min",
    ingredients: [
      { amount: "1/2 cup", item: "Rolled oats, dry", protein: 5 },
    ],
    steps: [
      "Combine oats with 1 cup water or unfortified soy milk in a pot.",
      "Bring to a simmer, stirring occasionally, 5 minutes until thickened.",
      "Top as desired.",
    ],
  },
  {
    name: "Lentil-edamame power bowl",
    meal: "Lunch",
    serves: 1,
    time: "15-20 min (5 min with pre-cooked lentils/quinoa)",
    ingredients: [
      { amount: "1 cup", item: "Lentils, cooked", protein: 18 },
      { amount: "1/2 cup", item: "Edamame, shelled", protein: 11 },
      { amount: "1/2 cup", item: "Quinoa, cooked", protein: 4 },
      { amount: "1 cup", item: "Mixed roasted vegetables", protein: 2 },
      { amount: "1 tbsp", item: "Tahini", protein: 2.6 },
      { amount: "1 tsp", item: "Lemon juice", protein: 0 },
      { amount: "1 tbsp", item: "Sliced almonds", protein: 2 },
      { amount: "To taste", item: "Salt, pepper, cumin", protein: 0 },
    ],
    steps: [
      "Batch-cook lentils and quinoa ahead of time for a 5-minute assembly; budget extra time if cooking fresh.",
      "Whisk tahini, lemon juice, and a splash of water into a pourable dressing.",
      "Layer lentils, quinoa, edamame, and roasted vegetables in a bowl.",
      "Drizzle with tahini dressing, season with cumin, salt, and pepper.",
      "Top with sliced almonds for crunch.",
    ],
  },
  {
    name: "Baked salmon + edamame/greens",
    meal: "Dinner",
    serves: 1,
    time: "20 min",
    ingredients: [
      { amount: "5-6 oz", item: "Salmon fillet", protein: 38 },
      { amount: "1 tsp", item: "Olive oil", protein: 0 },
      { amount: "1", item: "Lemon, sliced", protein: 0 },
      { amount: "To taste", item: "Garlic powder, black pepper, dill", protein: 0 },
      { amount: "1 cup", item: "Edamame (shelled) or steamed greens", protein: 17 },
    ],
    steps: [
      "Preheat oven to 400°F (200°C).",
      "Place salmon on a lined baking sheet, drizzle with olive oil, and season with garlic powder, pepper, and dill.",
      "Top with lemon slices.",
      "Bake 12-15 minutes, until salmon flakes easily with a fork.",
      "Serve with steamed edamame or leafy greens (kale, chard, or broccoli all work well).",
    ],
  },
  {
    name: "Tempeh stir-fry",
    meal: "Dinner",
    serves: 1,
    time: "15-20 min",
    ingredients: [
      { amount: "5 oz", item: "Tempeh, sliced or crumbled", protein: 28 },
      { amount: "1 cup", item: "Broccoli florets", protein: 3 },
      { amount: "1/2 cup", item: "Snap peas", protein: 1 },
      { amount: "1 tsp", item: "Sesame oil", protein: 0 },
      { amount: "1 tbsp", item: "Low-sodium soy sauce or tamari", protein: 1.5 },
      { amount: "1 tsp", item: "Garlic, minced", protein: 0 },
      { amount: "1 tsp", item: "Ginger, minced", protein: 0 },
      { amount: "1 tbsp", item: "Slivered almonds", protein: 2 },
    ],
    steps: [
      "Heat sesame oil in a wok or large skillet over medium-high heat.",
      "Add garlic and ginger, saute 30 seconds until fragrant.",
      "Add tempeh and cook 4-5 minutes, turning occasionally, until lightly browned.",
      "Add broccoli and snap peas, stir-fry 4-5 minutes until crisp-tender.",
      "Add soy sauce, toss to coat.",
      "Top with slivered almonds before serving.",
    ],
  },
  {
    name: "Egg scramble, 3 eggs",
    meal: "Dinner",
    serves: 1,
    time: "15 min",
    ingredients: [
      { amount: "3", item: "Large eggs", protein: 18 },
      { amount: "1 cup", item: "Spinach, chopped", protein: 1 },
      { amount: "1 tsp", item: "Olive oil", protein: 0 },
      { amount: "To taste", item: "Salt, pepper", protein: 0 },
    ],
    steps: [
      "Heat olive oil in a non-stick pan over medium heat.",
      "Whisk eggs in a bowl, season with salt and pepper.",
      "Pour eggs into the pan and let set slightly before gently folding/scrambling.",
      "Fold in spinach during the last minute of cooking.",
      "Serve alongside a tofu or lentil side (see separate quick-adds) to round out the protein for the meal.",
    ],
  },
  {
    name: "+ tofu side (1/2 cup)",
    meal: "Dinner",
    serves: 1,
    time: "5 min",
    ingredients: [
      { amount: "1/2 cup", item: "Firm tofu, cubed and warmed", protein: 10 },
    ],
    steps: [
      "Warm cubed tofu gently in a pan or microwave.",
      "Serve alongside the egg scramble.",
    ],
  },
  {
    name: "+ lentil side (1/2 cup)",
    meal: "Dinner",
    serves: 1,
    time: "5 min",
    ingredients: [
      { amount: "1/2 cup", item: "Lentils, cooked and warmed", protein: 9 },
    ],
    steps: [
      "Warm cooked lentils gently in a pan or microwave.",
      "Serve alongside the egg scramble.",
    ],
  },
  {
    name: "Pea protein shake (1 scoop)",
    meal: "Snack",
    serves: 1,
    time: "2 min",
    ingredients: [
      { amount: "1 scoop", item: "Pea protein powder (unfortified)", protein: 15 },
      { amount: "1 cup", item: "Unfortified soy milk or water", protein: 0 },
      { amount: "1/2", item: "Banana (optional)", protein: 0.6 },
      { amount: "As desired", item: "Ice", protein: 0 },
    ],
    steps: [
      "Combine all ingredients in a blender.",
      "Blend until smooth, about 30 seconds.",
      "Drink within 30-60 minutes after lifting for optimal muscle protein synthesis timing.",
    ],
  },
  {
    name: "Almond-walnut snack mix",
    meal: "Snack",
    serves: 1,
    time: "0 min",
    ingredients: [
      { amount: "1/4 cup", item: "Almonds", protein: 7 },
      { amount: "Small handful", item: "Walnuts", protein: 1 },
    ],
    steps: [
      "Combine in a small container or bag.",
      "Portion ahead for the week to make this a true zero-prep snack.",
    ],
  },
  {
    name: "Almonds (1/4 cup)",
    meal: "Snack",
    serves: 1,
    time: "0 min",
    ingredients: [
      { amount: "1/4 cup", item: "Almonds", protein: 7 },
    ],
    steps: ["Portion and eat."],
  },
  {
    name: "Walnuts (1/4 cup)",
    meal: "Snack",
    serves: 1,
    time: "0 min",
    ingredients: [
      { amount: "1/4 cup", item: "Walnuts", protein: 4.5 },
    ],
    steps: ["Portion and eat."],
  },
  {
    name: "Peanuts (1/4 cup)",
    meal: "Snack",
    serves: 1,
    time: "0 min",
    ingredients: [
      { amount: "1/4 cup", item: "Peanuts", protein: 9 },
    ],
    steps: ["Portion and eat."],
  },
  {
    name: "Gluten-free pumpkin seed protein ball (1 of 12)",
    meal: "Dessert",
    serves: 12,
    time: "10 min prep + 20 min chill (makes 12 balls)",
    // Ingredients are listed at full-batch quantities (as the recipe is made), so the table below
    // totals the whole batch. servingProtein is the per-ball amount actually logged by Quick Add.
    servingProtein: 5.1,
    servingLabel: "1 ball",
    ingredients: [
      { amount: "3/4 cup", item: "Certified gluten-free rolled oats", protein: 9 },
      { amount: "3 scoops", item: "Pumpkin seed protein powder", protein: 30 },
      { amount: "1/4 cup", item: "Natural peanut butter", protein: 16 },
      { amount: "1/3 cup", item: "Honey or maple syrup", protein: 0 },
      { amount: "2 tbsp", item: "Chia seeds", protein: 3 },
      { amount: "2 tbsp", item: "Ground flax seed", protein: 2.5 },
      { amount: "2 tbsp", item: "Mini dark chocolate chips (optional)", protein: 1 },
      { amount: "1 tsp", item: "Vanilla extract", protein: 0 },
      { amount: "Pinch", item: "Salt", protein: 0 },
    ],
    steps: [
      "Whisk the oats, protein powder, chia seeds, flax seed, and salt together in a large bowl until no clumps of protein powder remain.",
      "Add the peanut butter, honey (or maple syrup), and vanilla extract. Stir until a thick, uniform dough forms — add honey 1 tsp at a time if too dry, or oats 1 tbsp at a time if too sticky.",
      "Gently fold in the chocolate chips, if using.",
      "Cover and refrigerate the dough for 20 minutes — this makes it much easier to roll.",
      "Scoop about 2 tablespoons (~33 g) of dough per ball and roll into 12 balls, each roughly 1.5 inches across (about the size of a ping-pong ball).",
      "Refrigerate the balls in an airtight container for at least 30 minutes before eating to firm up. Keeps in the fridge up to 1 week, or in the freezer up to 3 months.",
      "Confirm your protein powder, chocolate chips, and vanilla extract are all labeled certified gluten-free, since cross-contact can occur even with naturally GF ingredients like oats.",
      "The table above totals the whole batch (~61.5 g protein, ~1440 cal across 12 balls). Quick Add logs one ball at a time (~5.1 g protein, ~120 cal).",
    ],
  },
];

// Derive each recipe's total protein from its own ingredient list so quick-add and detail view never disagree.
RECIPES.forEach((r) => {
  r.protein = Math.round(r.ingredients.reduce((sum, ing) => sum + ing.protein, 0) * 10) / 10;
});

const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

// ---------- Date helpers (all dates handled as YYYY-MM-DD strings, local time) ----------
function toDateObj(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toYmd(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}
function addDays(ymd, n) {
  const d = toDateObj(ymd);
  d.setDate(d.getDate() + n);
  return toYmd(d);
}
function clampDate(ymd) {
  if (ymd < START_DATE) return START_DATE;
  if (ymd > END_DATE) return END_DATE;
  return ymd;
}
function formatLabel(ymd) {
  const today = toYmd(new Date());
  if (ymd === today) return "Today";
  if (ymd === addDays(today, -1)) return "Yesterday";
  if (ymd === addDays(today, 1)) return "Tomorrow";
  return toDateObj(ymd).toLocaleDateString(undefined, { weekday: "short" });
}
function formatFullDate(ymd) {
  return toDateObj(ymd).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ---------- State ----------
let currentDate = clampDate(toYmd(new Date()));
let target = 190;
let entries = [];
let chartInstance = null;
let activePeriod = "total";

// ---------- Storage (localStorage; falls back gracefully if unavailable) ----------
function storageAvailable() {
  try {
    const k = "__test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
}
const HAS_STORAGE = storageAvailable();

function loadTarget() {
  if (!HAS_STORAGE) return;
  try {
    const raw = localStorage.getItem(TARGET_KEY);
    if (raw) target = JSON.parse(raw);
  } catch (e) { /* keep default */ }
}
function saveTarget(val) {
  target = val;
  if (!HAS_STORAGE) { setStatus("Storage unavailable in this browser — target won't persist."); return; }
  try {
    localStorage.setItem(TARGET_KEY, JSON.stringify(target));
  } catch (e) {
    setStatus("Could not save target.");
  }
}
function loadEntriesFor(ymd) {
  if (!HAS_STORAGE) return [];
  try {
    const raw = localStorage.getItem(LOG_PREFIX + ymd);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveEntriesFor(ymd, list) {
  if (!HAS_STORAGE) { setStatus("Storage unavailable in this browser — entries won't persist."); return; }
  try {
    localStorage.setItem(LOG_PREFIX + ymd, JSON.stringify(list));
    setStatus("");
  } catch (e) {
    setStatus("Save failed — storage may be full.");
  }
}
function getAllLoggedDates() {
  if (!HAS_STORAGE) return [];
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.indexOf(LOG_PREFIX) === 0) {
      const ymd = key.slice(LOG_PREFIX.length);
      out.push(ymd);
    }
  }
  return out.sort();
}

// ---------- Export / import ----------
async function exportData() {
  const dates = getAllLoggedDates();
  const logs = {};
  dates.forEach((ymd) => { logs[ymd] = loadEntriesFor(ymd); });

  const payload = {
    app: "protein-tracker",
    exportedAt: new Date().toISOString(),
    target,
    logs,
  };

  const json = JSON.stringify(payload, null, 2);
  const stamp = toYmd(new Date());
  const filename = "protein-tracker-backup-" + stamp + ".json";

  // Prefer the browser's native "Save As" dialog so the person always picks the
  // destination, instead of the file landing silently in the Downloads folder.
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "JSON backup",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      showToast("Backup saved &middot; " + dates.length + " day(s)");
    } catch (err) {
      if (err && err.name === "AbortError") return; // person cancelled the dialog — do nothing
      downloadViaAnchor(json, filename); // picker failed for another reason — fall back
      showToast("Backup downloaded &middot; " + dates.length + " day(s)");
    }
    return;
  }

  // Safari (macOS/iPadOS/iOS) doesn't support showSaveFilePicker at all. The closest
  // thing it offers to a destination-choice dialog is the native Share Sheet, where
  // "Save to Files" lets the person pick a real folder instead of a silent download.
  if (navigator.share && navigator.canShare) {
    try {
      const file = new File([json], filename, { type: "application/json" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        showToast("Backup ready &middot; " + dates.length + " day(s)");
        return;
      }
    } catch (err) {
      if (err && err.name === "AbortError") return; // person cancelled the share sheet
      // any other error: fall through to the plain download below
    }
  }

  // Last-resort fallback for browsers with neither API (e.g. older Firefox).
  downloadViaAnchor(json, filename);
  showToast("Backup downloaded &middot; " + dates.length + " day(s)");
}

function downloadViaAnchor(json, filename) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importDataFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let payload;
    try {
      payload = JSON.parse(reader.result);
    } catch (e) {
      setImportStatus("That file isn't valid JSON — couldn't read it.");
      return;
    }
    if (!payload || typeof payload !== "object" || !payload.logs) {
      setImportStatus("That file doesn't look like a protein tracker backup.");
      return;
    }

    const incomingDates = Object.keys(payload.logs);
    if (incomingDates.length === 0) {
      setImportStatus("Backup file has no logged days to import.");
      return;
    }

    // Merge by day: incoming entries are appended to whatever already exists for that day,
    // rather than overwriting, so importing never silently deletes entries already on this device.
    let daysWritten = 0;
    let entriesAdded = 0;
    incomingDates.forEach((ymd) => {
      if (ymd < START_DATE || ymd > END_DATE) return;
      const incoming = Array.isArray(payload.logs[ymd]) ? payload.logs[ymd] : [];
      if (incoming.length === 0) return;
      const existing = loadEntriesFor(ymd);
      const existingKeys = new Set(existing.map((e) => e.name + "|" + e.protein + "|" + e.meal + "|" + e.ts));
      const merged = existing.slice();
      incoming.forEach((e) => {
        if (!e || typeof e.protein !== "number" || !e.name || !e.meal) return;
        const key = e.name + "|" + e.protein + "|" + e.meal + "|" + e.ts;
        if (existingKeys.has(key)) return; // skip exact duplicates (e.g. re-importing the same backup)
        merged.push(e);
        entriesAdded++;
      });
      saveEntriesFor(ymd, merged);
      daysWritten++;
    });

    entries = loadEntriesFor(currentDate);
    renderDay();
    renderHistory();
    renderCustomChooser();

    let msg = entriesAdded > 0
      ? "Imported " + entriesAdded + " entr" + (entriesAdded === 1 ? "y" : "ies") + " across " + daysWritten + " day(s)."
      : "Backup matched what's already here — nothing new to add.";

    if (typeof payload.target === "number" && payload.target > 0 && payload.target !== target) {
      const applyTarget = window.confirm(
        "This backup also has a saved daily target of " + payload.target + "g (yours is currently " + target + "g). Use the backup's target?"
      );
      if (applyTarget) {
        saveTarget(payload.target);
        renderDay();
        msg += " Target updated to " + payload.target + "g.";
      }
    }

    setImportStatus(msg);
  };
  reader.onerror = () => setImportStatus("Couldn't read that file.");
  reader.readAsText(file);
}

function setImportStatus(msg) {
  const el = document.getElementById("importStatus");
  if (el) el.textContent = msg;
}

function setStatus(msg) {
  const el = document.getElementById("statusMsg");
  if (el) el.textContent = msg;
}
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function flashButton(btn) {
  btn.classList.add("added");
  setTimeout(() => btn.classList.remove("added"), 400);
}

let toastTimer = null;
function showToast(html) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = html;
  toast.classList.remove("show");
  // force reflow so the animation restarts on rapid repeat taps
  void toast.offsetWidth;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
}

// ---------- Day view rendering ----------
function renderDayNav() {
  document.getElementById("dayLabel").textContent = formatLabel(currentDate);
  document.getElementById("dayDate").textContent = formatFullDate(currentDate);
  document.getElementById("datePicker").value = currentDate;
  document.getElementById("prevDay").disabled = currentDate <= START_DATE;
  document.getElementById("nextDay").disabled = currentDate >= END_DATE;
}

function renderDay() {
  renderDayNav();
  document.getElementById("targetDisplay").textContent = target;
  document.getElementById("targetInput").value = target;

  const total = entries.reduce((sum, e) => sum + Number(e.protein), 0);
  document.getElementById("totalProtein").textContent = round1(total);

  const pct = target > 0 ? Math.min(100, (total / target) * 100) : 0;
  const fillEl = document.getElementById("barFill");
  fillEl.style.width = pct + "%";
  fillEl.classList.toggle("over", total > target);

  const remaining = target - total;
  const remEl = document.getElementById("remainingMsg");
  remEl.textContent = remaining > 0
    ? round1(remaining) + "g remaining to hit your target"
    : "Target reached — " + round1(Math.abs(remaining)) + "g over";

  const mealGrid = document.getElementById("mealGrid");
  mealGrid.innerHTML = "";
  MEALS.forEach((m) => {
    const mealTotal = entries.filter((e) => e.meal === m).reduce((s, e) => s + Number(e.protein), 0);
    const div = document.createElement("div");
    div.className = "meal-stat";
    div.innerHTML = '<div class="label">' + m + '</div><div class="val">' + round1(mealTotal) + 'g</div>';
    mealGrid.appendChild(div);
  });

  const logList = document.getElementById("logList");
  logList.innerHTML = "";
  if (entries.length === 0) {
    logList.innerHTML = '<div class="empty">No entries yet for this day.</div>';
  } else {
    entries.slice().reverse().forEach((e) => {
      const idx = entries.indexOf(e);
      const item = document.createElement("div");
      item.className = "log-item";
      item.innerHTML =
        '<div><div>' + escapeHtml(e.name) + '</div><div class="log-meta">' + e.meal + '</div></div>' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
        '<div style="font-weight:500;">' + e.protein + 'g</div>' +
        '<button class="del-btn" data-idx="' + idx + '" aria-label="Delete entry">&times;</button>' +
        '</div>';
      logList.appendChild(item);
    });
    logList.querySelectorAll(".del-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-idx"));
        entries.splice(idx, 1);
        saveEntriesFor(currentDate, entries);
        renderDay();
        renderHistory();
      });
    });
  }
}

function round1(n) { return Math.round(n * 10) / 10; }

function goToDate(ymd) {
  currentDate = clampDate(ymd);
  entries = loadEntriesFor(currentDate);
  renderDay();
}

// ---------- Quick add / custom add ----------
function renderQuickAdds() {
  const select = document.getElementById("quickRecipeSelect");
  const mealSelect = document.getElementById("quickMeal");
  const addBtn = document.getElementById("quickAddBtn");
  const viewBtn = document.getElementById("quickViewBtn");
  const detail = document.getElementById("quickRecipeDetail");

  // Alphabetical by name; value still references the original RECIPES index.
  select.innerHTML = "";
  RECIPES.map((r, idx) => ({ r, idx }))
    .sort((a, b) => a.r.name.localeCompare(b.r.name))
    .forEach(({ r, idx }) => {
      const displayProtein = r.servingProtein != null ? r.servingProtein : r.protein;
      const opt = document.createElement("option");
      opt.value = String(idx);
      opt.textContent = r.name + " \u2014 " + displayProtein + "g";
      select.appendChild(opt);
    });

  function selectedRecipe() {
    const idx = Number(select.value);
    return RECIPES[idx];
  }

  function updateDetail() {
    const item = selectedRecipe();
    if (!item) return;
    detail.innerHTML = buildRecipeDetailHtml(item);
    // Default the meal chooser to this recipe's usual meal; the person can still override it.
    if (MEALS.indexOf(item.meal) !== -1) mealSelect.value = item.meal;
  }

  updateDetail();

  select.addEventListener("change", () => {
    updateDetail();
  });

  viewBtn.addEventListener("click", () => {
    const isOpen = !detail.hidden;
    detail.hidden = isOpen;
    viewBtn.textContent = isOpen ? "View recipe" : "Hide recipe";
    viewBtn.classList.toggle("open", !isOpen);
  });

  addBtn.addEventListener("click", () => {
    const item = selectedRecipe();
    if (!item) return;
    const meal = mealSelect.value;
    const proteinToAdd = item.servingProtein != null ? item.servingProtein : item.protein;
    const logName = item.servingLabel ? item.name + " (" + item.servingLabel + ")" : item.name;
    entries.push({ name: logName, protein: proteinToAdd, meal, ts: Date.now() });
    saveEntriesFor(currentDate, entries);
    renderDay();
    renderHistory();
    renderCustomChooser();
    flashButton(addBtn);
    showToast(logName + " added &middot; +" + proteinToAdd + "g");
  });
}

function buildRecipeDetailHtml(item) {
  const ingredientRows = item.ingredients.map((ing) =>
    '<tr><td class="ing-amt">' + escapeHtml(ing.amount) + '</td><td class="ing-item">' + escapeHtml(ing.item) + '</td><td class="ing-protein">' + (ing.protein > 0 ? ing.protein + "g" : "&mdash;") + '</td></tr>'
  ).join("");

  const stepItems = item.steps.map((s, i) =>
    '<li><span class="step-num">' + (i + 1) + '</span><span class="step-text">' + escapeHtml(s) + '</span></li>'
  ).join("");

  const servingNote = item.servingProtein != null
    ? '<div class="recipe-meta" style="margin-top:-6px;margin-bottom:10px;">Quick Add logs ' + escapeHtml(item.servingLabel || "1 serving") + ' &middot; ' + item.servingProtein + 'g protein</div>'
    : "";

  return (
    '<div class="recipe-meta">Serves ' + item.serves + ' &middot; ' + escapeHtml(item.time) + '</div>' +
    servingNote +
    '<table class="ing-table">' +
      '<thead><tr><th>Amount</th><th>Ingredient</th><th>Protein</th></tr></thead>' +
      '<tbody>' + ingredientRows + '</tbody>' +
      '<tfoot><tr><td></td><td>Total</td><td class="ing-total">' + item.protein + 'g</td></tr></tfoot>' +
    '</table>' +
    '<div class="steps-title">Directions</div>' +
    '<ol class="steps-list">' + stepItems + '</ol>'
  );
}

function initCustomAdd() {
  renderCustomChooser();

  document.getElementById("customChooser").addEventListener("change", (e) => {
    const idx = e.target.value;
    e.target.value = ""; // reset chooser back to placeholder right away
    if (idx === "") return;
    const item = customChooserItems[Number(idx)];
    if (!item) return;

    const nameEl = document.getElementById("customName");
    const proteinEl = document.getElementById("customProtein");
    const mealEl = document.getElementById("customMeal");

    // Auto-fill fields for visibility, then log immediately.
    nameEl.value = item.name;
    proteinEl.value = item.protein;
    if (MEALS.indexOf(item.meal) !== -1) mealEl.value = item.meal;

    entries.push({ name: item.name, protein: item.protein, meal: mealEl.value, ts: Date.now() });
    saveEntriesFor(currentDate, entries);
    nameEl.value = "";
    proteinEl.value = "";
    renderDay();
    renderHistory();
    setStatus("");
    showToast(item.name + " added &middot; +" + item.protein + "g");
  });

  document.getElementById("addCustomBtn").addEventListener("click", () => {
    const nameEl = document.getElementById("customName");
    const proteinEl = document.getElementById("customProtein");
    const mealEl = document.getElementById("customMeal");
    const name = nameEl.value.trim();
    const protein = Number(proteinEl.value);
    if (!name || isNaN(protein) || protein < 0) {
      setStatus("Enter a food name and a valid protein amount.");
      return;
    }
    entries.push({ name, protein, meal: mealEl.value, ts: Date.now() });
    saveEntriesFor(currentDate, entries);
    nameEl.value = "";
    proteinEl.value = "";
    renderDay();
    renderHistory();
    renderCustomChooser();
    setStatus("");
    showToast(name + " added &middot; +" + protein + "g");
  });
}

// Builds the deduped list of previously-logged custom items (most recent protein/meal wins per name)
// across every day in storage, so the chooser reflects everything ever entered, not just today.
let customChooserItems = [];
function getAllCustomItems() {
  if (!HAS_STORAGE) return [];
  const dates = getAllLoggedDates();
  const map = new Map();
  dates.forEach((ymd) => {
    loadEntriesFor(ymd).forEach((e) => {
      if (!e || !e.name || typeof e.protein !== "number") return;
      const key = e.name.trim().toLowerCase();
      const existing = map.get(key);
      if (!existing || (e.ts || 0) > (existing.ts || 0)) {
        map.set(key, { name: e.name, protein: e.protein, meal: e.meal, ts: e.ts || 0 });
      }
    });
  });
  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

function renderCustomChooser() {
  const select = document.getElementById("customChooser");
  if (!select) return;
  customChooserItems = getAllCustomItems();
  select.innerHTML = '<option value="">Choose a previous item&hellip;</option>';
  customChooserItems.forEach((item, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = item.name + " \u2014 " + item.protein + "g";
    select.appendChild(opt);
  });
}

// ---------- History: chart + stats ----------
function getRangeForPeriod(period) {
  const today = clampDate(toYmd(new Date()));
  if (period === "week") {
    return { start: clampDate(addDays(today, -6)), end: today };
  }
  if (period === "month") {
    return { start: clampDate(addDays(today, -29)), end: today };
  }
  return { start: START_DATE, end: END_DATE };
}

function dailyTotalsInRange(start, end) {
  const out = [];
  let d = start;
  while (d <= end) {
    const dayEntries = loadEntriesFor(d);
    const total = dayEntries.reduce((s, e) => s + Number(e.protein), 0);
    out.push({ date: d, total: round1(total) });
    d = addDays(d, 1);
  }
  return out;
}

function renderHistory() {
  const { start, end } = getRangeForPeriod(activePeriod);
  let data = dailyTotalsInRange(start, end);

  // For "total" period, trim to only the span from the first logged day to today,
  // so the chart isn't a flat empty line across a year with nothing in it yet.
  if (activePeriod === "total") {
    const logged = getAllLoggedDates();
    const today = clampDate(toYmd(new Date()));
    const firstLogged = logged.length ? logged[0] : today;
    const trimmedStart = firstLogged < START_DATE ? START_DATE : firstLogged;
    data = dailyTotalsInRange(trimmedStart, today);
  }

  renderChart(data);
  renderStats(data);
}

function renderChart(data) {
  const ctx = document.getElementById("historyChart").getContext("2d");
  const labels = data.map((d) => {
    const obj = toDateObj(d.date);
    return obj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  });
  const values = data.map((d) => d.total);
  const targetLine = data.map(() => target);

  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue("--accent").trim() || "#0F6E56";
  const muted = styles.getPropertyValue("--text-muted").trim() || "#6B6A66";
  const border = styles.getPropertyValue("--border").trim() || "#E5E3DC";

  if (chartInstance) {
    chartInstance.destroy();
  }
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Protein (g)",
          data: values,
          backgroundColor: accent,
          borderRadius: 3,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
          order: 2,
        },
        {
          label: "Target",
          data: targetLine,
          type: "line",
          borderColor: "#854F0B",
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
          order: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => labels[items[0].dataIndex],
            label: (item) => (item.dataset.label === "Target" ? "Target: " + item.parsed.y + "g" : "Protein: " + item.parsed.y + "g"),
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: muted,
            font: { size: 10 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: data.length > 31 ? 8 : 10,
          },
          grid: { display: false },
          border: { color: border },
        },
        y: {
          beginAtZero: true,
          ticks: { color: muted, font: { size: 10 } },
          grid: { color: border },
          border: { display: false },
        },
      },
    },
  });
}

function renderStats(data) {
  const grid = document.getElementById("statsGrid");
  grid.innerHTML = "";

  const totals = data.map((d) => d.total);
  const daysLogged = totals.filter((t) => t > 0).length;
  const sum = totals.reduce((a, b) => a + b, 0);
  const avg = daysLogged > 0 ? sum / daysLogged : 0;
  const max = totals.length ? Math.max(...totals) : 0;
  const min = daysLogged > 0 ? Math.min(...totals.filter((t) => t > 0)) : 0;
  const daysMetTarget = totals.filter((t) => t >= target).length;
  const pctMet = data.length > 0 ? Math.round((daysMetTarget / data.length) * 100) : 0;

  const stats = [
    { label: "Average / day", val: round1(avg) + "g" },
    { label: "Days logged", val: String(daysLogged) },
    { label: "Days met target", val: daysMetTarget + " (" + pctMet + "%)" },
    { label: "Best day", val: round1(max) + "g" },
    { label: "Lowest logged day", val: daysLogged > 0 ? round1(min) + "g" : "—" },
    { label: "Total protein", val: round1(sum) + "g" },
  ];

  stats.forEach((s) => {
    const box = document.createElement("div");
    box.className = "stat-box";
    box.innerHTML = '<div class="label">' + s.label + '</div><div class="val">' + s.val + '</div>';
    grid.appendChild(box);
  });
}

function initPeriodTabs() {
  document.querySelectorAll(".period-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".period-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activePeriod = tab.getAttribute("data-period");
      renderHistory();
    });
  });
}

// ---------- Day nav controls ----------
function initDayNav() {
  document.getElementById("prevDay").addEventListener("click", () => goToDate(addDays(currentDate, -1)));
  document.getElementById("nextDay").addEventListener("click", () => goToDate(addDays(currentDate, 1)));
  document.getElementById("datePicker").addEventListener("change", (e) => {
    if (e.target.value) goToDate(e.target.value);
  });
}

function initTargetControl() {
  document.getElementById("saveTargetBtn").addEventListener("click", () => {
    const val = Number(document.getElementById("targetInput").value);
    if (!isNaN(val) && val > 0) {
      saveTarget(val);
      renderDay();
      renderHistory();
      setStatus("Target saved.");
      setTimeout(() => setStatus(""), 1500);
    }
  });
}

// ---------- Protein needs calculator ----------
function initProteinCalculator() {
  const weightEl = document.getElementById("calcWeight");
  const activityEl = document.getElementById("calcActivity");
  const resultEl = document.getElementById("calcResult");
  const applyBtn = document.getElementById("calcApplyBtn");

  // Restore the last-used weight/activity level so the calculator doesn't reset every visit.
  if (HAS_STORAGE) {
    try {
      const savedWeight = localStorage.getItem(CALC_WEIGHT_KEY);
      if (savedWeight) weightEl.value = savedWeight;
      const savedActivity = localStorage.getItem(CALC_ACTIVITY_KEY);
      if (savedActivity && ACTIVITY_LEVELS[savedActivity]) activityEl.value = savedActivity;
    } catch (e) { /* ignore */ }
  }

  function updateResult() {
    const lbs = Number(weightEl.value);
    const level = ACTIVITY_LEVELS[activityEl.value];
    if (!lbs || lbs <= 0 || !level) {
      resultEl.innerHTML = "";
      applyBtn.disabled = true;
      return;
    }
    const kg = lbs / LBS_PER_KG;
    const low = Math.round(kg * level.low);
    const high = Math.round(kg * level.high);
    resultEl.innerHTML =
      level.label + " at " + round1(lbs) + " lbs (" + round1(kg) + " kg): " +
      '<span class="calc-range">' + low + "\u2013" + high + "g protein/day</span>";
    applyBtn.disabled = false;

    if (HAS_STORAGE) {
      try {
        localStorage.setItem(CALC_WEIGHT_KEY, String(lbs));
        localStorage.setItem(CALC_ACTIVITY_KEY, activityEl.value);
      } catch (e) { /* ignore */ }
    }
  }

  updateResult();
  weightEl.addEventListener("input", updateResult);
  activityEl.addEventListener("change", updateResult);

  applyBtn.addEventListener("click", () => {
    const lbs = Number(weightEl.value);
    const level = ACTIVITY_LEVELS[activityEl.value];
    if (!lbs || lbs <= 0 || !level) return;
    const kg = lbs / LBS_PER_KG;
    const mid = Math.round(kg * ((level.low + level.high) / 2));
    document.getElementById("targetInput").value = mid;
    saveTarget(mid);
    renderDay();
    renderHistory();
    setStatus("Daily target set to " + mid + "g from the calculator.");
    setTimeout(() => setStatus(""), 2000);
  });

  // Info modal with the activity-level reference table
  const overlay = document.getElementById("proteinInfoOverlay");
  const infoBtn = document.getElementById("proteinInfoBtn");
  const closeBtn = document.getElementById("proteinInfoClose");
  infoBtn.addEventListener("click", () => { overlay.hidden = false; });
  closeBtn.addEventListener("click", () => { overlay.hidden = true; });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.hidden = true; // click outside the modal closes it
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) overlay.hidden = true;
  });
}

// ---------- PWA install prompt ----------
let deferredInstallPrompt = null;
function initInstallBanner() {
  const banner = document.getElementById("installBanner");
  const dismissed = HAS_STORAGE && localStorage.getItem(STORAGE_PREFIX + "install-dismissed");
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (!dismissed) banner.classList.add("show");
  });
  document.getElementById("installBtn").addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    banner.classList.remove("show");
  });
  document.getElementById("dismissInstall").addEventListener("click", () => {
    banner.classList.remove("show");
    if (HAS_STORAGE) localStorage.setItem(STORAGE_PREFIX + "install-dismissed", "1");
  });
}

// ---------- Service worker registration ----------
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
}

function initBackupRestore() {
  document.getElementById("exportBtn").addEventListener("click", () => {
    exportData();
  });

  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");
  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    importDataFromFile(file);
    importFile.value = ""; // reset so the same file can be re-selected later if needed
  });
}

// ---------- Init ----------
function init() {
  loadTarget();
  entries = loadEntriesFor(currentDate);
  renderQuickAdds();
  initCustomAdd();
  initDayNav();
  initTargetControl();
  initProteinCalculator();
  initPeriodTabs();
  initInstallBanner();
  initBackupRestore();
  renderDay();
  renderHistory();
  registerServiceWorker();

  if (!HAS_STORAGE) {
    setStatus("This browser is blocking local storage (e.g. private browsing) — entries won't be saved between visits.");
  }
}

init();
