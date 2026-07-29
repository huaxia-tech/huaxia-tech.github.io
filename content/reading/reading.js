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
    }

    pageInfo.textContent = `第 ${currentPage + 1} / ${totalPages} 页`;

    updateProgress();
    saveReadingState();
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
   启动所有功能
-------------------------- */

initPaging();
initReading();

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
}
loadArticles();
