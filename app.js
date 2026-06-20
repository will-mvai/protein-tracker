// ---------- Config ----------
const START_DATE = "2026-06-20";
const END_DATE = "2027-06-19"; // one year inclusive
const STORAGE_PREFIX = "protein-tracker:";
const TARGET_KEY = STORAGE_PREFIX + "target";
const LOG_PREFIX = STORAGE_PREFIX + "log:";

const QUICK_ADDS = [
  { name: "Pea protein oats", protein: 40, meal: "Breakfast" },
  { name: "Tofu scramble bowl", protein: 30, meal: "Breakfast" },
  { name: "Oatmeal, regular (1/2 cup dry)", protein: 5, meal: "Breakfast" },
  { name: "Lentil-edamame bowl", protein: 40, meal: "Lunch" },
  { name: "Baked salmon (5-6oz)", protein: 40, meal: "Dinner" },
  { name: "Tempeh stir-fry", protein: 30, meal: "Dinner" },
  { name: "Egg scramble (3 eggs) + side", protein: 35, meal: "Dinner" },
  { name: "Pea protein shake (1 scoop)", protein: 15, meal: "Snack" },
  { name: "Almond-walnut mix", protein: 8, meal: "Snack" },
  { name: "Almonds (1/4 cup)", protein: 7, meal: "Snack" },
  { name: "Walnuts (1/4 cup)", protein: 4.5, meal: "Snack" },
  { name: "Peanuts (1/4 cup)", protein: 9, meal: "Snack" },
];

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
  QUICK_ADDS.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "quick-btn";
    btn.innerHTML = '<span class="qname">' + escapeHtml(item.name) + '</span><span class="qprotein">' + item.protein + 'g protein &middot; ' + item.meal + '</span>';
    btn.addEventListener("click", () => {
      entries.push({ name: item.name, protein: item.protein, meal: item.meal, ts: Date.now() });
      saveEntriesFor(currentDate, entries);
      renderDay();
      renderHistory();
    });
    grid.appendChild(btn);
  });
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
