/* =====================================================================
   LOGIKA
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// --- uloženie do prehliadača (len pre tohto používateľa) ---
const store = {
  get(k, d) { try { const v = localStorage.getItem("skyro:" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("skyro:" + k, JSON.stringify(v)); } catch {} },
};

// --- záložky ---
$("#tabs").addEventListener("click", (e) => {
  const b = e.target.closest(".tab"); if (!b) return;
  showView(b.dataset.view);
});
function showView(name) {
  $$(".tab").forEach(t => t.setAttribute("aria-selected", String(t.dataset.view === name)));
  $$(".view").forEach(v => v.hidden = v.id !== "view-" + name);
  store.set("tab", name);
}

// --- Dnes: zvonenie ---
const toMin = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
const pad = (n) => String(n).padStart(2, "0");
const DAYS = ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"];
function renderBells(nowMin) {
  const box = $("#bells");
  box.innerHTML = BELLS.map((b, i) => {
    const f = toMin(b.from), t = toMin(b.to);
    const next = BELLS[i + 1];
    const brk = next ? `${toMin(next.from) - t} min prestávka` : "";
    const cls = nowMin >= f && nowMin < t ? "active" : nowMin >= t ? "past" : "";
    return `<div class="bell ${cls}"><span class="n">${b.n}.</span><span class="t">${b.from} – ${b.to}</span><span class="brk">${brk}</span></div>`;
  }).join("");
}
function tick() {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const sec = now.getSeconds();
  $("#clock").textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  $("#date").textContent = `${DAYS[now.getDay()]} ${now.getDate()}. ${now.getMonth() + 1}. ${now.getFullYear()}`;
  const weekend = now.getDay() === 0 || now.getDay() === 6;
  let title = "", sub = "", count = "";
  const fmt = (m) => { const s = Math.max(0, m * 60 - sec); const h = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60); return (h ? `${h}:${pad(mm)}` : `${mm}`) + `:${pad(s % 60)}`; };
  if (weekend) { title = "Víkend"; sub = "Vyučovanie začína v pondelok o 9:00."; }
  else {
    const cur = BELLS.find(b => nowMin >= toMin(b.from) && nowMin < toMin(b.to));
    const next = BELLS.find(b => toMin(b.from) > nowMin);
    if (cur) { title = `${cur.n}. hodina`; sub = `Končí o ${cur.to}`; count = fmt(toMin(cur.to) - nowMin); }
    else if (next) {
      title = next.n === 1 ? "Pred vyučovaním" : "Prestávka";
      sub = `${next.n}. hodina začína o ${next.from}`; count = fmt(toMin(next.from) - nowMin);
    } else { title = "Po vyučovaní"; sub = "Budova je otvorená do 18:00."; }
  }
  $("#now-title").textContent = title; $("#now-sub").textContent = sub; $("#now-count").textContent = count;
  renderBells(weekend ? -1 : nowMin);
}
tick(); setInterval(tick, 1000);

// --- Školský rok: koľko sa už odučilo ---
const D = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const isHoliday = (date) => HOLIDAYS.some(([a, b]) => date >= D(a) && date <= D(b));
// počet vyučovacích dní (po–pia, bez sviatkov) od "from" po "to" vrátane
function schoolDays(from, to) {
  let n = 0;
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6 && !isHoliday(d)) n++;
  }
  return n;
}
function schoolYearInfo() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = D(SCHOOL_YEAR.start), s1 = D(SCHOOL_YEAR.sem1End), s2 = D(SCHOOL_YEAR.sem2End);
  const sem = today <= s1 ? 1 : 2;
  const semStart = sem === 1 ? start : new Date(s1.getFullYear(), s1.getMonth(), s1.getDate() + 1);
  const semEnd = sem === 1 ? s1 : s2;
  const before = today < start, after = today > s2;
  const clamp = before ? new Date(start.getTime() - 86400000) : after ? semEnd : today;
  const doneDays = schoolDays(semStart, clamp);            // odučené dni v polroku
  const totalDays = schoolDays(semStart, semEnd);          // všetky dni polroka
  const yearWeek = before ? 0 : Math.floor((clamp - start) / (7 * 86400000)) + 1;
  const daysLeft = Math.max(0, Math.round((semEnd - today) / 86400000));
  return { sem, before, after, doneWeeks: doneDays / 5, totalWeeks: totalDays / 5, yearWeek, daysLeft, semEnd, pct: totalDays ? doneDays / totalDays * 100 : 0 };
}
const fmtDate = (d) => `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
function renderSchoolYear() {
  const y = schoolYearInfo();
  $("#sy-title").textContent = y.before ? "Prázdniny" : y.after ? "Koniec školského roka" : `${y.yearWeek}. týždeň školského roka`;
  $("#sy-sub").textContent = y.before ? `Vyučovanie začína ${fmtDate(D(SCHOOL_YEAR.start))}.` : `${y.sem}. polrok, odučené ${Math.round(y.pct)} %`;
  $("#sy-days").textContent = y.before || y.after ? "" : `${y.daysLeft} dní`;
  $("#sy-bar").style.width = `${y.pct}%`;
  $("#sy-weeks").textContent = `Odučené týždne v polroku: ${y.doneWeeks.toFixed(1)} z ${y.totalWeeks.toFixed(1)}`;
  $("#sy-end").textContent = `Koniec polroka: ${fmtDate(y.semEnd)}`;
}

// --- Absencie ---
let subjects = store.get("subjects", [
  { name: "Programovanie", perWeek: 4, missed: 3 },
  { name: "Matematika", perWeek: 3, missed: 5 },
  { name: "Anglický jazyk", perWeek: 3, missed: 0 },
]);
const settings = store.get("settings", { limit: 30, unexMonth: 0, unexYear: 0, late: 0 });
$("#limit").value = settings.limit;
$("#unex-month").value = settings.unexMonth; $("#unex-year").value = settings.unexYear; $("#late").value = settings.late;

function renderSubjects() {
  const limit = +$("#limit").value || 30;
  const y = schoolYearInfo();
  const box = $("#subjects");
  box.innerHTML = subjects.map((s, i) => {
    const soFar = Math.round(s.perWeek * y.doneWeeks);        // doteraz odučené hodiny
    const total = Math.round(s.perWeek * y.totalWeeks);       // hodiny za celý polrok
    const pctSoFar = soFar ? (s.missed / soFar) * 100 : 0;    // % z odučených
    const pctSem = total ? (s.missed / total) * 100 : 0;      // % z celého polroka
    const allowed = Math.floor(total * limit / 100);
    const left = allowed - s.missed;
    const state = pctSem >= limit ? "bad" : pctSoFar >= limit ? "warn" : "ok";
    const label = state === "bad" ? "Nad limitom" : state === "warn" ? "Zatiaľ nad tempom" : "V poriadku";
    return `
    <div class="card subject" data-i="${i}">
      <div class="subject-head">
        <input type="text" value="${s.name.replace(/"/g, "&quot;")}" data-k="name" aria-label="Názov predmetu" id="subj-name-${i}">
        <span class="pill ${state}">${label}</span>
      </div>
      <div class="row">
        <div class="field"><label for="subj-pw-${i}">Hodín týždenne</label><input id="subj-pw-${i}" type="number" min="0" value="${s.perWeek}" data-k="perWeek"></div>
        <div class="field"><label for="subj-missed-${i}">Vymeškané hodiny</label><input id="subj-missed-${i}" type="number" min="0" value="${s.missed}" data-k="missed"></div>
      </div>
      <div class="meter ${state}"><i style="width:${Math.min(100, pctSoFar)}%"></i><b style="left:${limit}%"></b></div>
      <div class="stat">
        <span>Z doteraz odučených <b>${soFar}</b> h vymeškané <b>${pctSoFar.toFixed(1)} %</b></span>
        <span>Z celého polroka (<b>${total}</b> h) <b>${pctSem.toFixed(1)} %</b></span>
      </div>
      <div class="note ${state}">${left >= 0 ? `Do limitu ${limit} % ti za polrok ostáva ešte <b>${left}</b> h.` : `Limit ${limit} % za polrok je prekročený o <b>${-left}</b> h.`}</div>
      <div class="actions"><button class="btn small ghost" data-del="${i}">Odstrániť</button></div>
    </div>`;
  }).join("");
}
$("#subjects").addEventListener("input", (e) => {
  const card = e.target.closest(".subject"); if (!card) return;
  const s = subjects[+card.dataset.i], k = e.target.dataset.k;
  s[k] = k === "name" ? e.target.value : Math.max(0, +e.target.value || 0);
  store.set("subjects", subjects);
  if (k !== "name") { const focusId = e.target.id; renderSubjects(); const el = document.getElementById(focusId); if (el) { el.focus(); } }
});
$("#subjects").addEventListener("click", (e) => {
  const b = e.target.closest("[data-del]"); if (!b) return;
  subjects.splice(+b.dataset.del, 1); store.set("subjects", subjects); renderSubjects();
});
$("#add-subject").addEventListener("click", () => { subjects.push({ name: "Nový predmet", perWeek: 2, missed: 0 }); store.set("subjects", subjects); renderSubjects(); });
$("#reset-subjects").addEventListener("click", () => { subjects = []; store.set("subjects", subjects); renderSubjects(); });
$("#limit").addEventListener("input", () => { saveSettings(); renderSubjects(); });
["#unex-month", "#unex-year", "#late"].forEach(sel => $(sel).addEventListener("input", () => { saveSettings(); renderUnex(); }));
function saveSettings() {
  store.set("settings", { limit: +$("#limit").value, unexMonth: +$("#unex-month").value, unexYear: +$("#unex-year").value, late: +$("#late").value });
}
function renderUnex() {
  const m = +$("#unex-month").value || 0, y = +$("#unex-year").value || 0, late = +$("#late").value || 0;
  const out = [];
  if (late > 3) out.push(`<div class="note warn">${late} neskorých príchodov – viac ako 3 sa spravidla rátajú ako 1 neospravedlnená hodina (čl. XVII bod 2).</div>`);
  else if (late > 0) out.push(`<div class="note">${late} ${late === 1 ? "neskorý príchod" : "neskoré príchody"}. Pri viac ako 3 sa to ráta ako neospravedlnená hodina.</div>`);
  if (m === 0 && y === 0) out.push(`<div class="note ok">Žiadne neospravedlnené hodiny. Tak to drž.</div>`);
  else {
    if (y < 8) out.push(`<div class="note warn">${y} h neospravedlnene = menej závažné porušenie poriadku. Hrozí napomenutie alebo pokarhanie, prípadne znížená známka zo správania (čl. XXIV, čl. XII bod 8).</div>`);
    else out.push(`<div class="note bad">${y} h neospravedlnene – už to nie je menej závažné porušenie (hranica je 8 h). Hrozí pokarhanie riaditeľa až podmienečné vylúčenie a znížená známka zo správania.</div>`);
    if (m > 15 || y > 60) out.push(`<div class="note bad">Nad 15 h za mesiac alebo 60 h za rok škola oznamuje zanedbávanie dochádzky obci (čl. XII bod 9).</div>`);
    else out.push(`<div class="note">Do hlásenia obci ostáva ${Math.max(0, 15 - m)} h tento mesiac a ${Math.max(0, 60 - y)} h tento rok.</div>`);
  }
  $("#unex-out").innerHTML = out.join("");
}

// --- Percentá (Skyro hodnotí v %) ---
let gradeSubjects = store.get("percents", [
  { name: "Slovenský jazyk", tests: [{ pct: 68, w: 1 }, { pct: 81, w: 1 }] },
  { name: "Programovanie", tests: [{ pct: 92, w: 1 }, { pct: 88, w: 2 }] },
  { name: "Matematika", tests: [{ pct: 54, w: 1 }] },
]);
// vážený priemer: (pct1*w1 + pct2*w2 + ...) / (w1 + w2 + ...)
function avgPct(tests) {
  const wsum = tests.reduce((a, t) => a + t.w, 0);
  return wsum ? tests.reduce((a, t) => a + t.pct * t.w, 0) / wsum : null;
}
function pctState(p) { return p >= PERCENT_SCALE.good ? "ok" : p >= PERCENT_SCALE.warn ? "warn" : "bad"; }
function fmtPct(p) { return p === null ? "–" : `${p.toFixed(1).replace(".", ",")} %`; }
function renderGrades() {
  const box = $("#grade-subjects");
  box.innerHTML = gradeSubjects.map((s, i) => {
    const a = avgPct(s.tests);
    return `
    <div class="card" data-i="${i}">
      <div class="subject-head">
        <input type="text" value="${s.name.replace(/"/g, "&quot;")}" data-k="name" aria-label="Názov predmetu" id="grade-name-${i}">
        <span class="pill ${a === null ? "" : pctState(a)}">Ø ${fmtPct(a)}</span>
      </div>
      <div class="meter ${a === null ? "" : pctState(a)}"><i style="width:${a ?? 0}%"></i></div>
      <div class="grades">
        ${s.tests.map((t, j) => `<span class="chip">${t.pct} %${t.w !== 1 ? ` <small>×${t.w}</small>` : ""}<button data-rm="${j}" aria-label="Odstrániť">×</button></span>`).join("") || `<span class="muted">Zatiaľ žiadne testy.</span>`}
      </div>
      <form class="row add-test" data-i="${i}">
        <div class="field"><label for="pct-${i}">Výsledok testu (%)</label><input id="pct-${i}" type="number" min="0" max="100" step="0.5" placeholder="napr. 68" required></div>
        <div class="field"><label for="w-${i}">Váha</label><input id="w-${i}" type="number" min="0.5" max="10" step="0.5" value="1"></div>
        <div class="field"><label>&nbsp;</label><button class="btn primary" type="submit">Pridať</button></div>
      </form>
      <div class="actions"><button class="btn small ghost" type="button" data-del="${i}">Odstrániť predmet</button></div>
    </div>`;
  }).join("");
  renderVerdict();
}
function renderVerdict() {
  const avgs = gradeSubjects.map(s => avgPct(s.tests)).filter(v => v !== null);
  const avgEl = $("#avg"), t = $("#verdict-title"), sub = $("#verdict-sub");
  if (!avgs.length) { avgEl.textContent = "–"; t.textContent = "Zadaj výsledky testov"; sub.textContent = "Priemer zo všetkých predmetov, každý predmet má rovnakú váhu."; return; }
  const avg = avgs.reduce((a, b) => a + b, 0) / avgs.length;
  avgEl.textContent = fmtPct(avg);
  const best = gradeSubjects.filter(s => avgPct(s.tests) !== null).sort((x, y) => avgPct(y.tests) - avgPct(x.tests));
  t.textContent = avg >= PERCENT_SCALE.good ? "Ide ti to výborne" : avg >= PERCENT_SCALE.warn ? "Solídne, dá sa zlepšiť" : "Pozor, priemer je nízko";
  sub.textContent = best.length > 1 ? `Najlepší predmet: ${best[0].name} (${fmtPct(avgPct(best[0].tests))}), najslabší: ${best[best.length - 1].name} (${fmtPct(avgPct(best[best.length - 1].tests))}).` : `${best.length} predmet, ${best[0].tests.length} testov.`;
}
$("#grade-subjects").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target.closest(".add-test"); if (!form) return;
  const i = +form.dataset.i;
  const pct = +$(`#pct-${i}`).value, w = +$(`#w-${i}`).value || 1;
  if (isNaN(pct) || pct < 0 || pct > 100) return;
  gradeSubjects[i].tests.push({ pct, w });
  store.set("percents", gradeSubjects); renderGrades();
  $(`#pct-${i}`).focus();
});
$("#grade-subjects").addEventListener("click", (e) => {
  const card = e.target.closest("[data-i]"); if (!card) return;
  const s = gradeSubjects[+card.dataset.i];
  if (e.target.dataset.rm !== undefined) s.tests.splice(+e.target.dataset.rm, 1);
  else if (e.target.dataset.del !== undefined) gradeSubjects.splice(+e.target.dataset.del, 1);
  else return;
  store.set("percents", gradeSubjects); renderGrades();
});
$("#grade-subjects").addEventListener("input", (e) => {
  if (e.target.dataset.k !== "name") return;
  gradeSubjects[+e.target.closest("[data-i]").dataset.i].name = e.target.value; store.set("percents", gradeSubjects);
});
$("#add-grade-subject").addEventListener("click", () => { gradeSubjects.push({ name: "Nový predmet", tests: [] }); store.set("percents", gradeSubjects); renderGrades(); });
$("#reset-grades").addEventListener("click", () => { gradeSubjects = []; store.set("percents", gradeSubjects); renderGrades(); });

// --- Sprievodca ---
$("#guide").innerHTML = GUIDE.map((g, i) => `
  <details ${i === 0 ? "open" : ""}>
    <summary>${g.t}</summary>
    <div class="details-body">
      <ul>${g.items.map(x => `<li>${x}</li>`).join("")}</ul>
      <p class="src">Školský poriadok Skyro, ${g.src}</p>
    </div>
  </details>`).join("");

// --- FAQ ---
function renderFaq(q = "") {
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const needle = norm(q.trim());
  const list = FAQ.filter(f => !needle || norm(f.q + " " + f.a).includes(needle));
  $("#faq").innerHTML = list.length
    ? list.map(f => `<div class="card"><div class="faq-q">${f.q}</div><div class="faq-a">${f.a}</div></div>`).join("")
    : `<div class="empty">Nič sa nenašlo. Skús iné slovo alebo pozri Sprievodcu.</div>`;
}
$("#faq-search").addEventListener("input", (e) => renderFaq(e.target.value));

// --- štart ---
renderSchoolYear(); renderSubjects(); renderUnex(); renderGrades(); renderFaq();
showView(store.get("tab", "dnes"));
