// ---------- Config ----------
const START_DATE = "2026-06-20";
const END_DATE = "2027-06-19"; // one year inclusive
const STORAGE_PREFIX = "protein-tracker:";
const TARGET_KEY = STORAGE_PREFIX + "target";
const LOG_PREFIX = STORAGE_PREFIX + "log:";

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
];

// Derive each recipe's total protein from its own ingredient list so quick-add and detail view never disagree.
RECIPES.forEach((r) => {
  r.protein = Math.round(r.ingredients.reduce((sum, ing) => sum + ing.protein, 0) * 10) / 10;
});

const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];

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
  const grid = document.getElementById("quickGrid");
  grid.innerHTML = "";
  RECIPES.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const row = document.createElement("div");
    row.className = "recipe-row";

    const addBtn = document.createElement("button");
    addBtn.className = "quick-btn";
    addBtn.innerHTML = '<span class="qname">' + escapeHtml(item.name) + '</span><span class="qprotein">' + item.protein + 'g protein &middot; ' + item.meal + '</span>';
    addBtn.addEventListener("click", () => {
      entries.push({ name: item.name, protein: item.protein, meal: item.meal, ts: Date.now() });
      saveEntriesFor(currentDate, entries);
      renderDay();
      renderHistory();
      flashButton(addBtn);
      showToast(item.name + " added &middot; +" + item.protein + "g");
    });

    const viewBtn = document.createElement("button");
    viewBtn.className = "view-recipe-btn";
    viewBtn.setAttribute("aria-label", "View recipe for " + item.name);
    viewBtn.setAttribute("aria-expanded", "false");
    viewBtn.innerHTML = "<span class=\"chev\">&#9662;</span>";

    const detailId = "recipe-detail-" + idx;
    viewBtn.setAttribute("aria-controls", detailId);

    const detail = document.createElement("div");
    detail.className = "recipe-detail";
    detail.id = detailId;
    detail.innerHTML = buildRecipeDetailHtml(item);
    detail.hidden = true;

    viewBtn.addEventListener("click", () => {
      const isOpen = !detail.hidden;
      detail.hidden = isOpen;
      viewBtn.classList.toggle("open", !isOpen);
      viewBtn.setAttribute("aria-expanded", String(!isOpen));
    });

    row.appendChild(addBtn);
    row.appendChild(viewBtn);
    card.appendChild(row);
    card.appendChild(detail);
    grid.appendChild(card);
  });
}

function buildRecipeDetailHtml(item) {
  const ingredientRows = item.ingredients.map((ing) =>
    '<tr><td class="ing-amt">' + escapeHtml(ing.amount) + '</td><td class="ing-item">' + escapeHtml(ing.item) + '</td><td class="ing-protein">' + (ing.protein > 0 ? ing.protein + "g" : "&mdash;") + '</td></tr>'
  ).join("");

  const stepItems = item.steps.map((s, i) =>
    '<li><span class="step-num">' + (i + 1) + '</span><span class="step-text">' + escapeHtml(s) + '</span></li>'
  ).join("");

  return (
    '<div class="recipe-meta">Serves ' + item.serves + ' &middot; ' + escapeHtml(item.time) + '</div>' +
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
    setStatus("");
    showToast(name + " added &middot; +" + protein + "g");
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

// ---------- Init ----------
function init() {
  loadTarget();
  entries = loadEntriesFor(currentDate);
  renderQuickAdds();
  initCustomAdd();
  initDayNav();
  initTargetControl();
  initPeriodTabs();
  initInstallBanner();
  renderDay();
  renderHistory();
  registerServiceWorker();

  if (!HAS_STORAGE) {
    setStatus("This browser is blocking local storage (e.g. private browsing) — entries won't be saved between visits.");
  }
}

init();
