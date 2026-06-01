const DATA_URL = "../data/junior-2000-vocabulary.json";
const PROGRESS_KEY = "recite-2000-progress-v1";
const QUIZ_LOG_KEY = "recite-2000-quiz-log-v1";
const MAX_IMPORT_BYTES = 1024 * 1024;

const state = {
  words: [],
  categories: [],
  activeLearnCategory: "",
  activeReviewCategory: "all",
  reviewIndex: 0,
  reviewDeck: [],
  reviewDeckCursor: 0,
  reviewDeckCategory: "",
  reviewFlipped: false,
  quizMode: "twenty",
  quizQueue: [],
  quizIndex: 0,
  quizScore: 0,
  quizWrong: [],
  quizStartAt: 0,
  quizElapsedMs: 0,
  quizTimerId: null,
  currentQuestion: null,
  currentResultText: "",
  progress: loadJson(PROGRESS_KEY, {}),
  quizLog: loadJson(QUIZ_LOG_KEY, []),
};

const els = {
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  learnedCount: document.querySelector("#learnedCount"),
  hardCount: document.querySelector("#hardCount"),
  activeCount: document.querySelector("#activeCount"),
  learnCategorySelect: document.querySelector("#learnCategorySelect"),
  reviewCategorySelect: document.querySelector("#reviewCategorySelect"),
  learnTopicList: document.querySelector("#learnTopicList"),
  reviewTopicList: document.querySelector("#reviewTopicList"),
  wordGrid: document.querySelector("#wordGrid"),
  learnSubtitle: document.querySelector("#learnSubtitle"),
  reviewQueueLabel: document.querySelector("#reviewQueueLabel"),
  reviewFace: document.querySelector("#reviewFace"),
  reviewSpeakBtn: document.querySelector("#reviewSpeakBtn"),
  reviewKeepHardBtn: document.querySelector("#reviewKeepHardBtn"),
  reviewKnowBtn: document.querySelector("#reviewKnowBtn"),
  flipBtn: document.querySelector("#flipBtn"),
  quizProgress: document.querySelector("#quizProgress"),
  quizScore: document.querySelector("#quizScore"),
  quizTimer: document.querySelector("#quizTimer"),
  quizWord: document.querySelector("#quizWord"),
  quizSpeakBtn: document.querySelector("#quizSpeakBtn"),
  choices: document.querySelector("#choices"),
  feedback: document.querySelector("#feedback"),
  startQuizBtn: document.querySelector("#startQuizBtn"),
  quizResult: document.querySelector("#quizResult"),
  resultText: document.querySelector("#resultText"),
  shareLineBtn: document.querySelector("#shareLineBtn"),
  copyResultBtn: document.querySelector("#copyResultBtn"),
  clearQuizLogBtn: document.querySelector("#clearQuizLogBtn"),
  quizLogList: document.querySelector("#quizLogList"),
  exportRecordsBtn: document.querySelector("#exportRecordsBtn"),
  importRecordsBtn: document.querySelector("#importRecordsBtn"),
  importRecordsInput: document.querySelector("#importRecordsInput"),
  clearLogModal: document.querySelector("#clearLogModal"),
  confirmClearLogBtn: document.querySelector("#confirmClearLogBtn"),
  cancelClearLogBtn: document.querySelector("#cancelClearLogBtn"),
};

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.progress));
}

function saveQuizLog() {
  localStorage.setItem(QUIZ_LOG_KEY, JSON.stringify(state.quizLog));
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function getStatus(id) {
  return state.progress[id] || { known: false, hard: false, seen: 0 };
}

function updateStatus(id, patch) {
  const current = getStatus(id);
  state.progress[id] = { ...current, ...patch };
  saveProgress();
  renderStats();
}

function categoryMarkedCount(categoryId) {
  return wordsInCategory(categoryId).filter((word) => {
    const status = getStatus(word.id);
    return status.known || status.hard;
  }).length;
}

function categoryProgressClass(categoryId) {
  const words = wordsInCategory(categoryId);
  if (!words.length) return "";
  const percent = (categoryMarkedCount(categoryId) / words.length) * 100;
  if (percent >= 100) return "progress-complete";
  if (percent > 50) return "progress-half";
  if (percent > 1) return "progress-started";
  return "";
}

function wordById(id) {
  return state.words.find((word) => word.id === id);
}

function wordsInCategory(categoryId) {
  return state.words.filter((word) => word.categoryId === categoryId);
}

function hardWords(categoryId = "all") {
  return state.words.filter((word) => getStatus(word.id).hard && (categoryId === "all" || word.categoryId === categoryId));
}

function quizPool() {
  return state.words.filter((word) => {
    const status = getStatus(word.id);
    return status.known || status.hard;
  });
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.voice = pickAmericanVoice();
  utterance.rate = 0.79;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function pickAmericanVoice() {
  const voices = window.speechSynthesis.getVoices();
  const preferred = [
    "Samantha",
    "Aaron",
    "Ava",
    "Reed",
    "Eddy",
    "Allison",
    "Tom",
    "Alex",
    "Google US English",
    "Microsoft Aria",
    "Microsoft Jenny",
    "Microsoft Guy",
  ];
  return (
    preferred.map((name) => voices.find((voice) => voice.lang.startsWith("en-US") && voice.name.includes(name))).find(Boolean) ||
    voices.find((voice) => voice.lang === "en-US") ||
    voices.find((voice) => voice.lang.startsWith("en")) ||
    null
  );
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildOptions() {
  const categoryOptions = state.categories
    .map((category) => {
      const count = wordsInCategory(category.id).length;
      const progressClass = categoryProgressClass(category.id);
      return `<option class="${progressClass}" value="${esc(category.id)}">${esc(category.nameZh)}（${count}）</option>`;
    })
    .join("");
  els.learnCategorySelect.innerHTML = categoryOptions;
  els.reviewCategorySelect.innerHTML = `<option value="all">全部加強</option>${categoryOptions}`;
}

function applySelectProgress(select, categoryId) {
  select.classList.remove("progress-started", "progress-half", "progress-complete");
  const progressClass = categoryProgressClass(categoryId);
  if (progressClass) select.classList.add(progressClass);
}

function renderStats() {
  const statuses = state.words.map((word) => getStatus(word.id));
  const learned = statuses.filter((status) => status.known).length;
  const hard = statuses.filter((status) => status.hard).length;
  const active = state.activeLearnCategory ? wordsInCategory(state.activeLearnCategory).length : 0;
  els.learnedCount.textContent = learned;
  els.hardCount.textContent = hard;
  els.activeCount.textContent = active;
}

function renderTopicList(container, activeCategory, type) {
  const buttons = state.categories
    .map((category) => {
      const baseCount = type === "review" ? hardWords(category.id).length : wordsInCategory(category.id).length;
      const active = activeCategory === category.id ? "active" : "";
      const progressClass = categoryProgressClass(category.id);
      return `<button class="topic-button ${active} ${progressClass}" data-topic="${esc(category.id)}" data-topic-type="${type}">
        ${esc(category.nameZh)} ${baseCount}
      </button>`;
    })
    .join("");
  container.innerHTML = buttons;
}

function renderLearn() {
  const category = state.categories.find((item) => item.id === state.activeLearnCategory) || state.categories[0];
  if (!category) return;
  buildOptions();
  state.activeLearnCategory = category.id;
  els.learnCategorySelect.value = category.id;
  applySelectProgress(els.learnCategorySelect, category.id);
  const words = wordsInCategory(category.id);
  els.learnSubtitle.textContent = `${category.nameZh} · ${words.length} 個單字 · ${category.descriptionZh}`;
  els.wordGrid.innerHTML = words.map(renderWordCard).join("");
  words.forEach((word) => updateStatus(word.id, { seen: getStatus(word.id).seen + 1 }));
  renderTopicList(els.learnTopicList, category.id, "learn");
  renderStats();
}

function renderWordCard(word) {
  const status = getStatus(word.id);
  return `
    <article class="word-card">
      <div class="card-top">
        <span class="number">#${word.id}</span>
        <button class="mini-button" data-speak="${esc(word.word)}" aria-label="播放 ${esc(word.word)}">▶</button>
      </div>
      <button class="word-button" data-speak="${esc(word.word)}">${esc(word.word)}</button>
      <div class="ipa">${esc(word.ipa)}</div>
      <div class="meaning">${esc(word.meaningZh)} <span>${esc(word.partOfSpeech)}</span></div>
      <p class="meta">${esc(word.categoryNameZh)}</p>
      <button class="sentence-button" data-speak="${esc(word.exampleEn)}">${esc(word.exampleEn)}</button>
      <div class="card-actions">
        <button class="${status.hard ? "active" : ""}" data-mark-hard="${word.id}">加強</button>
        <button class="${status.known ? "active" : ""}" data-mark-known="${word.id}">已會</button>
      </div>
    </article>
  `;
}

function resetReviewDeck() {
  state.reviewDeck = shuffle(hardWords(state.activeReviewCategory).map((word) => word.id));
  state.reviewDeckCursor = 0;
  state.reviewDeckCategory = state.activeReviewCategory;
}

function syncReviewDeck() {
  if (state.reviewDeckCategory !== state.activeReviewCategory) {
    resetReviewDeck();
    return;
  }
  const currentId = state.reviewDeck[state.reviewDeckCursor];
  const hardIds = hardWords(state.activeReviewCategory).map((word) => word.id);
  const hardIdSet = new Set(hardIds);
  const currentDeck = state.reviewDeck.filter((id) => hardIdSet.has(id));
  const currentDeckSet = new Set(currentDeck);
  const newIds = hardIds.filter((id) => !currentDeckSet.has(id));
  state.reviewDeck = [...currentDeck, ...shuffle(newIds)];
  const currentIndex = state.reviewDeck.indexOf(currentId);
  if (currentIndex >= 0) state.reviewDeckCursor = currentIndex;
  if (state.reviewDeckCursor >= state.reviewDeck.length && state.reviewDeck.length) resetReviewDeck();
}

function reviewQueue() {
  syncReviewDeck();
  return state.reviewDeck.map((id) => wordById(id)).filter(Boolean);
}

function currentReviewWord() {
  const queue = reviewQueue();
  return queue[state.reviewDeckCursor] || null;
}

function advanceReviewDeck() {
  syncReviewDeck();
  if (!state.reviewDeck.length) return;
  state.reviewDeckCursor += 1;
  if (state.reviewDeckCursor >= state.reviewDeck.length) resetReviewDeck();
}

function renderReview() {
  buildOptions();
  renderTopicList(els.reviewTopicList, state.activeReviewCategory, "review");
  els.reviewCategorySelect.value = state.activeReviewCategory;
  applySelectProgress(els.reviewCategorySelect, state.activeReviewCategory);
  const queue = reviewQueue();
  if (!queue.length) {
    els.reviewQueueLabel.textContent = "目前沒有這個主題的加強單字。";
    els.reviewFace.innerHTML = `<p class="meaning">先到學習頁把不熟的字標注為「加強」。</p>`;
    return;
  }
  let word = currentReviewWord();
  if (!word) {
    resetReviewDeck();
    word = currentReviewWord();
  }
  if (!word) return;
  els.reviewQueueLabel.textContent = `${word.categoryNameZh} · ${state.reviewDeckCursor + 1}/${queue.length}`;
  els.reviewFace.innerHTML = state.reviewFlipped
    ? `
      <div class="review-detail">
        <button class="word-button review-answer-word" data-speak="${esc(word.word)}">${esc(word.word)}</button>
        <div class="meaning">${esc(word.meaningZh)} <span>${esc(word.partOfSpeech)}</span></div>
        <p class="ipa">${esc(word.ipa)}</p>
        <button class="sentence-button" data-speak="${esc(word.exampleEn)}">${esc(word.exampleEn)}</button>
      </div>
    `
    : `<button class="word-button review-word" data-speak="${esc(word.word)}">${esc(word.word)}</button>`;
}

function startQuiz() {
  stopQuizTimer();
  const pool = quizPool();
  state.quizWrong = [];
  state.quizScore = 0;
  state.quizIndex = 0;
  state.quizStartAt = 0;
  state.quizElapsedMs = 0;
  els.quizTimer.textContent = state.quizMode === "twenty" ? "00:00" : "練習中";
  els.quizResult.classList.add("hidden");
  els.feedback.textContent = "";
  if (!pool.length) {
    state.currentQuestion = null;
    els.quizWord.textContent = "先在學習頁標注已會或加強的單字";
    els.choices.innerHTML = "";
    els.quizProgress.textContent = "尚未有測驗字庫";
    els.quizScore.textContent = "0 分";
    els.quizTimer.textContent = "00:00";
    return;
  }
  if (state.quizMode === "twenty") {
    const queue = [];
    while (queue.length < 20) queue.push(...shuffle(pool));
    state.quizQueue = queue.slice(0, 20);
  } else {
    state.quizQueue = shuffle(pool);
  }
  showQuestion();
}

function startQuizTimer() {
  updateQuizTimer();
  state.quizTimerId = window.setInterval(updateQuizTimer, 1000);
}

function stopQuizTimer() {
  if (state.quizTimerId) window.clearInterval(state.quizTimerId);
  state.quizTimerId = null;
}

function updateQuizTimer() {
  if (state.quizMode !== "twenty" || !state.quizStartAt) return;
  state.quizElapsedMs = Date.now() - state.quizStartAt;
  els.quizTimer.textContent = formatDuration(state.quizElapsedMs);
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function showQuestion() {
  const pool = quizPool();
  if (!pool.length) return;
  if (state.quizMode === "continuous" && state.quizIndex >= state.quizQueue.length) {
    state.quizQueue = shuffle(pool);
    state.quizIndex = 0;
  }
  const word = state.quizQueue[state.quizIndex];
  state.currentQuestion = word;
  const choices = shuffle([word, ...shuffle(state.words.filter((item) => item.id !== word.id)).slice(0, 3)]);
  els.quizWord.textContent = word.word;
  els.quizProgress.textContent =
    state.quizMode === "twenty" ? `20 題測驗 · 第 ${state.quizIndex + 1}/20 題` : `連續練習 · 第 ${state.quizIndex + 1} 題`;
  els.quizScore.textContent = state.quizMode === "twenty" ? `${state.quizScore} 分` : "練習中";
  els.choices.innerHTML = choices
    .map((choice) => `<button class="choice" data-choice="${choice.id}">${esc(choice.meaningZh)} ${esc(choice.partOfSpeech)}</button>`)
    .join("");
  els.feedback.textContent = "";
}

function answerQuiz(choiceId) {
  const word = state.currentQuestion;
  if (!word) return;
  if (state.quizMode === "twenty" && !state.quizStartAt) {
    state.quizStartAt = Date.now();
    startQuizTimer();
  }
  const correct = choiceId === word.id;
  document.querySelectorAll(".choice").forEach((button) => {
    const id = Number(button.dataset.choice);
    button.disabled = true;
    if (id === word.id) button.classList.add("correct");
    if (id === choiceId && !correct) button.classList.add("wrong");
  });
  if (correct) {
    els.feedback.textContent = "答對了";
    if (state.quizMode === "twenty") state.quizScore += 5;
    updateStatus(word.id, { known: true, hard: false });
  } else {
    els.feedback.textContent = `再看一次：${word.meaningZh}`;
    state.quizWrong.push(word);
    updateStatus(word.id, { hard: true, known: false });
  }
  if (state.quizMode === "twenty" && state.quizIndex >= 19) {
    state.quizElapsedMs = Date.now() - state.quizStartAt;
    els.quizTimer.textContent = formatDuration(state.quizElapsedMs);
    stopQuizTimer();
  }
  window.setTimeout(nextQuizStep, 850);
}

function nextQuizStep() {
  if (state.quizMode === "twenty" && state.quizIndex >= 19) {
    finishTwentyQuiz();
    return;
  }
  state.quizIndex += 1;
  showQuestion();
}

function finishTwentyQuiz() {
  state.quizElapsedMs = state.quizElapsedMs || (state.quizStartAt ? Date.now() - state.quizStartAt : 0);
  stopQuizTimer();
  const durationText = formatDuration(state.quizElapsedMs);
  const uniqueWrong = [...new Map(state.quizWrong.map((word) => [word.id, word])).values()];
  const log = {
    id: Date.now(),
    date: new Date().toLocaleString("zh-TW", { hour12: false }),
    score: state.quizScore,
    durationMs: state.quizElapsedMs,
    durationText,
    wrong: uniqueWrong.map((word) => ({
      id: word.id,
      word: word.word,
      meaningZh: word.meaningZh,
      categoryNameZh: word.categoryNameZh,
    })),
  };
  state.quizLog.unshift(log);
  state.quizLog = state.quizLog.slice(0, 50);
  saveQuizLog();
  state.currentResultText = buildResultText(log);
  els.quizScore.textContent = `${state.quizScore} 分`;
  els.quizTimer.textContent = durationText;
  els.quizProgress.textContent = "20 題測驗完成";
  els.quizWord.textContent = `${state.quizScore} / 100`;
  els.choices.innerHTML = "";
  els.feedback.textContent = uniqueWrong.length ? `答錯 ${uniqueWrong.length} 個單字` : "全部答對";
  els.resultText.textContent = state.currentResultText;
  els.quizResult.classList.remove("hidden");
  renderQuizLog();
}

function buildResultText(log) {
  const wrongText = log.wrong.length
    ? log.wrong.map((word) => `#${word.id} ${word.word}（${word.meaningZh}）`).join("、")
    : "沒有答錯的單字";
  return `Hi，我完成國中2000單字20題測驗：${log.score}/100。使用時間：${log.durationText || formatDuration(log.durationMs || 0)}。答錯單字：${wrongText}`;
}

async function copyResultText() {
  if (!state.currentResultText) return;
  try {
    await navigator.clipboard.writeText(state.currentResultText);
    els.feedback.textContent = "結果文字已複製";
  } catch {
    els.feedback.textContent = state.currentResultText;
  }
}

function shareToLine() {
  if (!state.currentResultText) return;
  const encoded = encodeURIComponent(state.currentResultText);
  window.location.href = `https://line.me/R/msg/text/?${encoded}`;
}

function renderQuizLog() {
  if (!state.quizLog.length) {
    els.quizLogList.innerHTML = `<p class="meta">尚無 20 題測驗紀錄。</p>`;
    return;
  }
  els.quizLogList.innerHTML = state.quizLog
    .map((log) => {
      const wrongText = log.wrong.length ? log.wrong.map((word) => `${word.word}（${word.meaningZh}）`).join("、") : "全對";
      return `
        <article class="log-item">
          <strong>${esc(log.score)}/100</strong>
          <p class="meta">${esc(log.date)} · 使用時間 ${esc(log.durationText || formatDuration(log.durationMs || 0))}</p>
          <p>答錯：${esc(wrongText)}</p>
        </article>
      `;
    })
    .join("");
}

function exportRecords() {
  const markedProgress = Object.fromEntries(
    Object.entries(state.progress).filter(([, status]) => status?.known || status?.hard),
  );
  const payload = {
    app: "Recite2000SingleWords",
    type: "learning-records",
    version: 1,
    exportedAt: new Date().toISOString(),
    progress: markedProgress,
    quizLog: state.quizLog,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `recite-2000-records-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function importRecordsFile(file) {
  if (file.size > MAX_IMPORT_BYTES) {
    els.feedback.textContent = "匯入失敗：檔案超過 1MB，請確認是否為本 App 匯出的學習紀錄。";
    els.importRecordsInput.value = "";
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (
        !data ||
        data.type !== "learning-records" ||
        !data.progress ||
        typeof data.progress !== "object" ||
        !Array.isArray(data.quizLog)
      ) {
        throw new Error("檔案格式不正確");
      }
      state.progress = sanitizeProgress(data.progress);
      state.quizLog = sanitizeQuizLog(data.quizLog);
      saveProgress();
      saveQuizLog();
      renderStats();
      renderLearn();
      renderReview();
      renderQuizLog();
      els.feedback.textContent = "學習紀錄已匯入";
    } catch (error) {
      els.feedback.textContent = `匯入失敗：${error.message}`;
    } finally {
      els.importRecordsInput.value = "";
    }
  });
  reader.readAsText(file);
}

function sanitizeQuizLog(logs) {
  const wordsById = new Map(state.words.map((word) => [word.id, word]));
  return logs
    .filter((log) => log && typeof log === "object")
    .map((log) => {
      const durationMs = Math.max(0, Number(log.durationMs || 0));
      const wrong = Array.isArray(log.wrong)
        ? log.wrong
            .filter((word) => word && typeof word === "object")
            .map((word) => {
              const id = Number(word.id || 0);
              const fallback = wordsById.get(id);
              return {
                id,
                word: String(word.word || fallback?.word || ""),
                meaningZh: String(word.meaningZh || fallback?.meaningZh || ""),
                categoryNameZh: String(word.categoryNameZh || fallback?.categoryNameZh || ""),
              };
            })
            .filter((word) => word.id && word.word && word.meaningZh)
        : [];
      return {
        id: Number(log.id || Date.now()),
        date: String(log.date || new Date().toLocaleString("zh-TW", { hour12: false })),
        score: Math.max(0, Math.min(100, Number(log.score || 0))),
        durationMs,
        durationText: String(log.durationText || formatDuration(durationMs)),
        wrong,
      };
    })
    .slice(0, 100);
}

function sanitizeProgress(progress) {
  const validIds = new Set(state.words.map((word) => String(word.id)));
  return Object.fromEntries(
    Object.entries(progress)
      .filter(([id, status]) => validIds.has(String(id)) && status && (status.known || status.hard))
      .map(([id, status]) => [
        id,
        {
          known: Boolean(status.known),
          hard: Boolean(status.hard),
          seen: Number(status.seen || 0),
        },
      ]),
  );
}

function showClearLogModal() {
  els.clearLogModal.classList.remove("hidden");
}

function hideClearLogModal() {
  els.clearLogModal.classList.add("hidden");
}

function setView(view) {
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
  els.views.forEach((section) => section.classList.toggle("active", section.id === `${view}View`));
  if (view === "review") {
    resetReviewDeck();
    renderReview();
  }
  if (view === "quiz") renderQuizLog();
}

function bindEvents() {
  els.tabs.forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));

  document.addEventListener("click", (event) => {
    const speakTarget = event.target.closest("[data-speak]");
    const hardTarget = event.target.closest("[data-mark-hard]");
    const knownTarget = event.target.closest("[data-mark-known]");
    const topicTarget = event.target.closest("[data-topic]");
    const choiceTarget = event.target.closest("[data-choice]");
    if (speakTarget) speak(speakTarget.dataset.speak);
    if (hardTarget) {
      updateStatus(Number(hardTarget.dataset.markHard), { hard: true, known: false });
      renderLearn();
      renderReview();
    }
    if (knownTarget) {
      updateStatus(Number(knownTarget.dataset.markKnown), { known: true, hard: false });
      renderLearn();
      renderReview();
    }
    if (topicTarget) {
      if (topicTarget.dataset.topicType === "learn") {
        state.activeLearnCategory = topicTarget.dataset.topic;
        renderLearn();
      } else {
        state.activeReviewCategory = topicTarget.dataset.topic;
        state.reviewIndex = 0;
        resetReviewDeck();
        state.reviewFlipped = false;
        renderReview();
      }
    }
    if (choiceTarget) answerQuiz(Number(choiceTarget.dataset.choice));
  });

  els.learnCategorySelect.addEventListener("change", () => {
    state.activeLearnCategory = els.learnCategorySelect.value;
    renderLearn();
  });

  els.reviewCategorySelect.addEventListener("change", () => {
    state.activeReviewCategory = els.reviewCategorySelect.value;
    state.reviewIndex = 0;
    resetReviewDeck();
    state.reviewFlipped = false;
    renderReview();
  });

  els.flipBtn.addEventListener("click", () => {
    state.reviewFlipped = !state.reviewFlipped;
    renderReview();
  });

  els.reviewSpeakBtn.addEventListener("click", () => {
    const word = currentReviewWord();
    if (word) speak(state.reviewFlipped ? word.exampleEn : word.word);
  });

  els.reviewKeepHardBtn.addEventListener("click", () => {
    const word = currentReviewWord();
    if (!word) return;
    updateStatus(word.id, { hard: true, known: false });
    advanceReviewDeck();
    state.reviewFlipped = false;
    renderReview();
  });

  els.reviewKnowBtn.addEventListener("click", () => {
    const word = currentReviewWord();
    if (!word) return;
    updateStatus(word.id, { known: true, hard: false });
    syncReviewDeck();
    state.reviewFlipped = false;
    renderReview();
  });

  document.querySelectorAll("[data-quiz-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.quizMode = button.dataset.quizMode;
      document.querySelectorAll("[data-quiz-mode]").forEach((item) => item.classList.toggle("active", item === button));
      startQuiz();
    });
  });

  els.startQuizBtn.addEventListener("click", startQuiz);
  els.quizSpeakBtn.addEventListener("click", () => {
    if (state.currentQuestion) speak(state.currentQuestion.word);
  });
  els.shareLineBtn.addEventListener("click", shareToLine);
  els.copyResultBtn.addEventListener("click", copyResultText);
  els.clearQuizLogBtn.addEventListener("click", showClearLogModal);
  els.cancelClearLogBtn.addEventListener("click", hideClearLogModal);
  els.clearLogModal.addEventListener("click", (event) => {
    if (event.target === els.clearLogModal) hideClearLogModal();
  });
  els.confirmClearLogBtn.addEventListener("click", () => {
    state.quizLog = [];
    saveQuizLog();
    renderQuizLog();
    hideClearLogModal();
  });
  els.exportRecordsBtn.addEventListener("click", exportRecords);
  els.importRecordsBtn.addEventListener("click", () => els.importRecordsInput.click());
  els.importRecordsInput.addEventListener("change", () => {
    const file = els.importRecordsInput.files?.[0];
    if (file) importRecordsFile(file);
  });
}

async function init() {
  bindEvents();
  els.quizWord.textContent = "載入 2000 單字中";
  const response = await fetch(DATA_URL);
  const data = await response.json();
  state.words = data.words;
  state.categories = data.categories;
  state.activeLearnCategory = state.categories[0]?.id || "";
  buildOptions();
  renderStats();
  renderLearn();
  renderReview();
  renderQuizLog();
  startQuiz();
}

if ("speechSynthesis" in window) {
  window.speechSynthesis.addEventListener("voiceschanged", pickAmericanVoice);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

init().catch((error) => {
  els.quizWord.textContent = "資料載入失敗";
  els.feedback.textContent = error.message;
});
