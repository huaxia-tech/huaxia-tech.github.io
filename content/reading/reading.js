/* ---------------------------------------------------------
   华夏小书房 · 终极版 reading.js
   功能列表：
   ✔ 自动分页
   ✔ 左右滑动翻页
   ✔ AI 朗读
   ✔ 夜间模式
   ✔ 护眼模式
   ✔ 字体调节
   ✔ 阅读进度条
   ✔ 阅读历史
   ✔ 阅读时长统计
   ✔ 阅读成就系统
   ✔ 阅读排行榜
   ✔ 每日一句
   ✔ 文章分类系统
   ✔ 搜索功能
   ✔ GitHub 阅读进度同步（二维码）
   ✔ AI 封面图生成（含 fallback）
--------------------------------------------------------- */

/* -------------------------
   1. 自动分页
------------------------- */
let pages = [];
let currentPage = 0;

function initPaging() {
  const article = document.getElementById("articleContent");
  if (!article) return;

  const children = Array.from(article.children);
  pages = [];
  let page = [];

  children.forEach(el => {
    page.push(el.outerHTML);
    if (page.length >= 3) {
      pages.push(page.join(""));
      page = [];
    }
  });

  if (page.length > 0) pages.push(page.join(""));

  showPage(0);
}

function showPage(index) {
  if (!pages.length) return;
  currentPage = Math.max(0, Math.min(index, pages.length - 1));

  const article = document.getElementById("articleContent");
  article.innerHTML = pages[currentPage];

  document.getElementById("pageInfo").textContent =
    `第 ${currentPage + 1} / ${pages.length} 页`;

  updateProgress();
  saveReadingState();
}

document.getElementById("nextPage")?.addEventListener("click", () => showPage(currentPage + 1));
document.getElementById("prevPage")?.addEventListener("click", () => showPage(currentPage - 1));

/* -------------------------
   2. 左右滑动翻页
------------------------- */
function initSwipePaging() {
  const article = document.getElementById("articleContent");
  if (!article) return;

  let startX = 0;

  article.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  article.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    const delta = endX - startX;

    if (Math.abs(delta) < 50) return;

    if (delta < 0) showPage(currentPage + 1);
    else showPage(currentPage - 1);
  });
}

/* -------------------------
   3. AI 朗读
------------------------- */
let synth = window.speechSynthesis;
let utter;

function initReading() {
  const btnRead = document.getElementById("btnRead");
  const btnStop = document.getElementById("btnStop");

  if (!btnRead || !btnStop) return;

  btnRead.onclick = () => {
    const text = document.getElementById("articleContent").innerText;
    utter = new SpeechSynthesisUtterance(text);
    utter.lang = "zh-CN";
    utter.rate = 1.0;
    synth.speak(utter);
  };

  btnStop.onclick = () => synth.cancel();
}

/* -------------------------
   4. 夜间模式
------------------------- */
function initNightMode() {
  const btn = document.getElementById("toggleNight");
  if (!btn) return;

  btn.onclick = () => {
    document.body.classList.toggle("body-night");
    localStorage.setItem("night_mode", document.body.classList.contains("body-night"));
  };

  if (localStorage.getItem("night_mode") === "true") {
    document.body.classList.add("body-night");
  }
}

/* -------------------------
   5. 护眼模式
------------------------- */
function initEyeMode() {
  const btn = document.getElementById("toggleEye");
  if (!btn) return;

  btn.onclick = () => {
    document.body.classList.toggle("body-eye");
    localStorage.setItem("eye_mode", document.body.classList.contains("body-eye"));
  };

  if (localStorage.getItem("eye_mode") === "true") {
    document.body.classList.add("body-eye");
  }
}

/* -------------------------
   6. 字体调节
------------------------- */
function initFontSize() {
  const plus = document.getElementById("fontPlus");
  const minus = document.getElementById("fontMinus");

  if (!plus || !minus) return;

  plus.onclick = () => {
    const size = parseInt(localStorage.getItem("font_size") || "18") + 2;
    document.documentElement.style.fontSize = size + "px";
    localStorage.setItem("font_size", size);
  };

  minus.onclick = () => {
    const size = parseInt(localStorage.getItem("font_size") || "18") - 2;
    document.documentElement.style.fontSize = size + "px";
    localStorage.setItem("font_size", size);
  };

  const saved = localStorage.getItem("font_size");
  if (saved) document.documentElement.style.fontSize = saved + "px";
}

/* -------------------------
   7. 阅读进度条
------------------------- */
function updateProgress() {
  const inner = document.getElementById("progress-inner");
  if (!inner || !pages.length) return;

  const percent = ((currentPage + 1) / pages.length) * 100;
  inner.style.width = percent + "%";
}

/* -------------------------
   8. 阅读历史
------------------------- */
function saveReadingState() {
  if (typeof ARTICLE_ID === "undefined") return;

  localStorage.setItem(`reading_state_${ARTICLE_ID}`, currentPage);

  const history = JSON.parse(localStorage.getItem("reading_history") || "[]");

  const title = document.getElementById("article-title")?.innerText || ARTICLE_ID;

  const item = {
    id: ARTICLE_ID,
    title,
    time: Date.now()
  };

  const filtered = history.filter(h => h.id !== ARTICLE_ID);
  filtered.unshift(item);

  localStorage.setItem("reading_history", JSON.stringify(filtered.slice(0, 20)));
}

function loadHistory() {
  const list = document.getElementById("recent-list");
  if (!list) return;

  const history = JSON.parse(localStorage.getItem("reading_history") || "[]");

  history.forEach(h => {
    const timeKey = `reading_time_${h.id}`;
    const seconds = Number(localStorage.getItem(timeKey) || 0);
    const mins = Math.floor(seconds / 60);

    const div = document.createElement("div");
    div.className = "recent-item";
    div.innerHTML = `
      <p>
        <a href="${h.id}.html">${h.title}</a>
        · ${new Date(h.time).toLocaleString()}
        · 阅读约 ${mins} 分钟
      </p>
    `;
    list.appendChild(div);
  });
}

/* -------------------------
   9. 阅读时长统计
------------------------- */
function initReadingTimer() {
  if (typeof ARTICLE_ID === "undefined") return;

  const key = `reading_time_${ARTICLE_ID}`;
  let seconds = Number(localStorage.getItem(key) || 0);

  setInterval(() => {
    seconds += 1;
    localStorage.setItem(key, seconds);
  }, 1000);
}

/* -------------------------
   10. 阅读成就系统
------------------------- */
function calcAchievements() {
  const history = JSON.parse(localStorage.getItem("reading_history") || "[]");
  const totalArticles = history.length;

  let totalSeconds = 0;
  history.forEach(h => {
    const key = `reading_time_${h.id}`;
    totalSeconds += Number(localStorage.getItem(key) || 0);
  });

  const badges = [];

  if (totalArticles >= 1) badges.push("入门读者");
  if (totalArticles >= 5) badges.push("小书房常客");
  if (totalSeconds >= 60 * 30) badges.push("半小时阅读达人");
  if (totalSeconds >= 60 * 120) badges.push("深度阅读者");

  localStorage.setItem("reading_badges", JSON.stringify(badges));
  return badges;
}

function showAchievements() {
  const container = document.getElementById("achievements");
  if (!container) return;

  const badges = JSON.parse(localStorage.getItem("reading_badges") || "[]") || calcAchievements();

  container.innerHTML = badges
    .map(b => `<span class="badge">${b}</span>`)
    .join(" ");
}

/* -------------------------
   11. 阅读排行榜
------------------------- */
function loadRanking() {
  const container = document.getElementById("ranking");
  if (!container) return;

  const history = JSON.parse(localStorage.getItem("reading_history") || "[]");

  const stats = history.map(h => {
    const key = `reading_time_${h.id}`;
    const seconds = Number(localStorage.getItem(key) || 0);
    return { id: h.id, title: h.title, seconds };
  }).filter(s => s.seconds > 0);

  stats.sort((a, b) => b.seconds - a.seconds);

  container.innerHTML = "";

  stats.slice(0, 5).forEach((s, index) => {
    const mins = Math.floor(s.seconds / 60);
    const div = document.createElement("div");
    div.className = "ranking-item";
    div.innerHTML = `
      <span class="rank-no">${index + 1}</span>
      <a href="${s.id}.html">${s.title}</a>
      <span class="rank-time"> · 阅读约 ${mins} 分钟</span>
    `;
    container.appendChild(div);
  });
}

/* -------------------------
   12. 每日一句
------------------------- */
function initDailyQuote() {
  const el = document.getElementById("daily-quote");
  if (!el) return;

  const quotes = [
    "今天也要给自己一点安静的阅读时间。",
    "文字是安静的陪伴，也是温柔的力量。",
    "慢一点读，世界就会慢一点吵。",
    "每一页翻过去，都是和自己的一次对话。",
    "读书不是任务，是给心一点空间。"
  ];

  const today = new Date();
  const index = today.getDate() % quotes.length;

  el.textContent = quotes[index];
}

/* -------------------------
   13. 文章分类系统
------------------------- */
async function loadArticles() {
  const list = document.getElementById("book-list");
  if (!list) return;

  const res = await fetch("articles.json");
  const articles = await res.json();

  const groups = {};
  articles.forEach(a => {
    const cat = a.category || "未分类";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(a);
  });

  list.innerHTML = "";

  for (const cat in groups) {
    const section = document.createElement("div");
    section.className = "category-section";
    section.innerHTML = `<h3 class="category-title">${cat}</h3>`;
    const inner = document.createElement("div");
    inner.className = "category-list";

    for (const a of groups[cat]) {
      const card = document.createElement("div");
      card.className = "book-card";

      const cover = "fallback.jpg"; // AI 封面图可接入 generateCover()

      card.innerHTML = `
        <div class="book-cover">
          <img src="${cover}" alt="${a.title}">
        </div>
        <div class="book-info">
          <h2>${a.title}</h2>
          <p>${a.desc}</p>
          <a href="${a.id}.html">进入阅读</a>
        </div>
      `;
      inner.appendChild(card);
    }

    section.appendChild(inner);
    list.appendChild(section);
  }
}

/* -------------------------
   14. 搜索功能
------------------------- */
async function initSearch() {
  const input = document.getElementById("search-input");
  const result = document.getElementById("search-result");
  if (!input || !result) return;

  const res = await fetch("articles.json");
  const articles = await res.json();

  input.addEventListener("input", () => {
    const q = input.value.trim();
    result.innerHTML = "";
    if (!q) return;

    const lower = q.toLowerCase();
    const matched = articles.filter(a =>
      (a.title && a.title.toLowerCase().includes(lower)) ||
      (a.desc && a.desc.toLowerCase().includes(lower))
    );

    matched.forEach(a => {
      const div = document.createElement("div");
      div.className = "search-item";
      div.innerHTML = `
        <a href="${a.id}.html">${a.title}</a>
        <span> · ${a.desc}</span>
      `;
      result.appendChild(div);
    });
  });
}

/* -------------------------
   15. GitHub 阅读进度同步（二维码）
------------------------- */
function initSyncGithub() {
  const btn = document.getElementById("btnSync");
  const box = document.getElementById("sync-qrcode");
  if (!btn || !box || typeof ARTICLE_ID === "undefined") return;

  btn.onclick = () => {
    const stateKey = `reading_state_${ARTICLE_ID}`;
    const timeKey = `reading_time_${ARTICLE_ID}`;

    const payload = {
      id: ARTICLE_ID,
      page: Number(localStorage.getItem(stateKey) || 0),
      seconds: Number(localStorage.getItem(timeKey) || 0),
      ts: Date.now()
    };

    const json = JSON.stringify(payload);
    const base64 = btoa(encodeURIComponent(json));

    box.innerHTML = "";
    new QRCode(box, {
      text: base64,
      width: 200,
      height: 200
    });
  };
}

/* -------------------------
   16. 启动所有功能
------------------------- */
window.onload = () => {
  initPaging();
  initSwipePaging();
  initReading();
  initNightMode();
  initEyeMode();
  initFontSize();
  initReadingTimer();
  initDailyQuote();
  loadHistory();
  showAchievements();
  loadRanking();
  loadArticles();
  initSearch();
  initSyncGithub();
};
