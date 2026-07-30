/* -------------------------
   自动分页 + 继续阅读
-------------------------- */

function initPaging(pageSize = 3) {
  const article = document.getElementById('articleContent');
  if (!article) return;

  const paras = Array.from(article.querySelectorAll('p'));
  let currentPage = 0;
  const totalPages = Math.ceil(paras.length / pageSize);

  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');

  function updateProgress() {
    const percent = ((currentPage + 1) / totalPages) * 100;
    const bar = document.getElementById('progress-inner');
    bar.style.width = percent + '%';
  }

  function saveReadingState() {
    const key = `reading_state_${ARTICLE_ID}`;
    localStorage.setItem(key, currentPage);
  }

  function loadReadingState() {
    const key = `reading_state_${ARTICLE_ID}`;
    const saved = localStorage.getItem(key);
    return saved ? Number(saved) : 0;
  }

  function renderPage() {
    paras.forEach(p => p.style.display = 'none');

    const start = currentPage * pageSize;
    const end = Math.min(start + pageSize, paras.length);

    for (let i = start; i < end; i++) {
      paras[i].style.display = 'block';
      // 🔧 在分页渲染时加入动画
      paras[i].classList.add('page-slide');
      setTimeout(() => paras[i].classList.remove('page-slide'), 300);
    }

    pageInfo.textContent = `第 ${currentPage + 1} / ${totalPages} 页`;

    updateProgress();
    saveReadingState();
    // ⭐⭐⭐ 自动保存阅读历史（关键）
    saveHistory();
  }

  prevBtn.onclick = () => {
    if (currentPage > 0) {
      currentPage--;
      renderPage();
    }
  };

  nextBtn.onclick = () => {
    if (currentPage < totalPages - 1) {
      currentPage++;
      renderPage();
    }
  };

  currentPage = loadReadingState();
  renderPage();
}

/* -------------------------
   AI 朗读（按页朗读）
-------------------------- */

function initReading(pageSize = 3) {
  const btnRead = document.getElementById('btnRead');
  const btnStop = document.getElementById('btnStop');
  const article = document.getElementById('articleContent');
  if (!btnRead || !article) return;

  const paras = Array.from(article.querySelectorAll('p'));
  let currentPage = 0;

  function getCurrentPage() {
    const key = `reading_state_${ARTICLE_ID}`;
    const saved = localStorage.getItem(key);
    return saved ? Number(saved) : 0;
  }

  function getPageText() {
    currentPage = getCurrentPage();
    const start = currentPage * pageSize;
    const end = Math.min(start + pageSize, paras.length);
    return paras.slice(start, end).map(p => p.textContent.trim()).join('。');
  }

  btnRead.onclick = () => {
    const text = getPageText();
    if (!text) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = speechSynthesis.getVoices();
    const zh = voices.find(v => v.lang.startsWith('zh'));
    if (zh) utterance.voice = zh;

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    speechSynthesis.speak(utterance);
  };

  btnStop.onclick = () => speechSynthesis.cancel();
}


/* -------------------------
   夜间模式
-------------------------- */
function initNightMode() {
  const btn = document.getElementById('toggleNight');
  if (!btn) return;

  btn.onclick = () => {
    document.body.classList.toggle('night');
    localStorage.setItem('night_mode', document.body.classList.contains('night'));
  };

  // 自动恢复夜间模式
  const saved = localStorage.getItem('night_mode');
  if (saved === 'true') {
    document.body.classList.add('night');
  }
}

/* -------------------------
   字体大小调节
-------------------------- */
function initFontSize() {
  const plus = document.getElementById('fontPlus');
  const minus = document.getElementById('fontMinus');
  const article = document.getElementById('articleContent');

  let size = Number(localStorage.getItem('font_size') || 17);

  function apply() {
    article.style.fontSize = size + 'px';
    localStorage.setItem('font_size', size);
  }

  plus.onclick = () => {
    size += 1;
    apply();
  };

  minus.onclick = () => {
    size -= 1;
    apply();
  };

  apply();
}

// ⭐ 4. 自动生成封面图（AI）
/*
async function generateCover(title) {
  const key = 'cover_' + title;
  const cached = localStorage.getItem(key);
  if (cached) return cached;

  // 这里你可以换成你自己的 AI 图片 API
  const res = await fetch("https://image.pollinations.ai/prompt/" + encodeURIComponent(title));
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  localStorage.setItem(key, url);
  return url;
}
*/

async function generateCover(title) {
  const key = 'cover_' + title;
  const cached = localStorage.getItem(key);
  if (cached) return cached;

  // 更稳定的 Pollinations API（加上宽度、高度、风格）
  const url =
    "https://image.pollinations.ai/prompt/" +
    encodeURIComponent(title) +
    "?width=300&height=420&style=book-cover";

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("封面生成失败：", res.status);
      return "fallback.jpg"; // 你可以放一个默认封面
    }

    const blob = await res.blob();
    const objectURL = URL.createObjectURL(blob);

    localStorage.setItem(key, objectURL);
    return objectURL;
  } catch (err) {
    console.error("封面生成异常：", err);
    return "fallback.jpg";
  }
}


// ⭐ 5. 阅读历史（最近阅读）
function saveHistory() {
  const history = JSON.parse(localStorage.getItem('reading_history') || '[]');

  const entry = {
    id: ARTICLE_ID,
    title: document.getElementById('article-title').textContent,
    time: Date.now()
  };

  // 去重
  const filtered = history.filter(h => h.id !== ARTICLE_ID);
  filtered.unshift(entry);

  localStorage.setItem('reading_history', JSON.stringify(filtered.slice(0, 20)));
}

function loadHistory() {
  const list = document.getElementById('recent-list');
  if (!list) return;

  const history = JSON.parse(localStorage.getItem('reading_history') || '[]');

  history.forEach(h => {
    const div = document.createElement('div');
    div.className = 'recent-item';
    div.innerHTML = `
      <p><a href="${h.id}.html">${h.title}</a> · ${new Date(h.time).toLocaleString()}</p>
    `;
    list.appendChild(div);
  });
}

/* -------------------------
   加载文章目录
-------------------------- */
async function loadArticles() {
  console.log('loading articles...');
  const list = document.getElementById('book-list');
  if (!list) {
    console.log('no book-list container');
    return;
  }

  const res = await fetch('articles.json');
  console.log('fetch status', res.status);
  const articles = await res.json();
  console.log('articles', articles);

  // ...
  // ⭐⭐⭐ 你的卡片生成代码必须放在这里 ⭐⭐⭐
  articles.forEach(async a => {
    const coverUrl = await generateCover(a.title);

    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <div class="book-cover">
        <img src="${coverUrl}" alt="${a.title}">
      </div>
      <div class="book-info">
        <h2>${a.title}</h2>
        <p>${a.desc}</p>
        <a href="${a.id}.html">进入阅读</a>
      </div>
    `;
    list.appendChild(card);
  });

}


/* -------------------------
   启动所有功能
-------------------------- */
loadArticles();
loadHistory();
initPaging();
initReading();
initNightMode();
initFontSize();