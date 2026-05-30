const WORDS = [
  { id: 1, word: "apartment", pos: "n.", zh: "公寓", ipa: "/əˈpɑːrtmənt/", sentence: "We live in a small apartment near the station." },
  { id: 2, word: "appear", pos: "v.", zh: "似乎；出現", ipa: "/əˈpɪr/", sentence: "Dark clouds appear before the rain starts." },
  { id: 3, word: "accident", pos: "n.", zh: "意外", ipa: "/ˈæksɪdənt/", sentence: "No one was hurt in the accident." },
  { id: 4, word: "another", pos: "adj.", zh: "另一個", ipa: "/əˈnʌðər/", sentence: "May I have another piece of cake?" },
  { id: 5, word: "attack", pos: "v.", zh: "攻擊", ipa: "/əˈtæk/", sentence: "The bees may attack if you touch the nest." },
  { id: 6, word: "avoid", pos: "v.", zh: "避免", ipa: "/əˈvɔɪd/", sentence: "Please avoid making noise in the library." },
  { id: 7, word: "believe", pos: "v.", zh: "相信", ipa: "/bɪˈliːv/", sentence: "I believe you can finish the race." },
  { id: 8, word: "below", pos: "adv./prep.", zh: "在……之下", ipa: "/bɪˈloʊ/", sentence: "The temperature fell below zero last night." },
  { id: 9, word: "by the way", pos: "phr.", zh: "順帶一提", ipa: "/baɪ ðə weɪ/", sentence: "By the way, your teacher called this morning." },
  { id: 10, word: "building", pos: "n.", zh: "建築物", ipa: "/ˈbɪldɪŋ/", sentence: "That tall building is a famous hotel." },
  { id: 11, word: "bitter", pos: "adj.", zh: "苦的", ipa: "/ˈbɪtər/", sentence: "This medicine tastes bitter." },
  { id: 12, word: "bottom", pos: "n.", zh: "底部", ipa: "/ˈbɑːtəm/", sentence: "Write your name at the bottom of the page." },
  { id: 13, word: "celebrate", pos: "v.", zh: "慶祝", ipa: "/ˈselɪbreɪt/", sentence: "We celebrate Grandma's birthday every July." },
  { id: 14, word: "concert", pos: "n.", zh: "演唱會", ipa: "/ˈkɑːnsərt/", sentence: "The concert starts at seven tonight." },
  { id: 15, word: "career", pos: "n.", zh: "職業", ipa: "/kəˈrɪr/", sentence: "My sister wants a career in music." },
  { id: 16, word: "college", pos: "n.", zh: "大學", ipa: "/ˈkɑːlɪdʒ/", sentence: "He plans to study science in college." },
  { id: 17, word: "continue", pos: "v.", zh: "繼續", ipa: "/kənˈtɪnjuː/", sentence: "Please continue reading after lunch." },
  { id: 18, word: "creative", pos: "adj.", zh: "有創意的", ipa: "/kriˈeɪtɪv/", sentence: "Amy gave a creative answer in class." },
  { id: 19, word: "dentist", pos: "n.", zh: "牙醫", ipa: "/ˈdentɪst/", sentence: "I will see the dentist on Friday." },
  { id: 20, word: "deal with", pos: "phr.", zh: "處理", ipa: "/diːl wɪð/", sentence: "We must deal with this problem today." },
  { id: 21, word: "damage", pos: "v.", zh: "損害", ipa: "/ˈdæmɪdʒ/", sentence: "Too much rain can damage the road." },
  { id: 22, word: "develop", pos: "v.", zh: "發展", ipa: "/dɪˈveləp/", sentence: "Good habits develop slowly." },
  { id: 23, word: "dictionary", pos: "n.", zh: "字典", ipa: "/ˈdɪkʃəneri/", sentence: "Use a dictionary to check the word." },
  { id: 24, word: "download", pos: "v.", zh: "下載", ipa: "/ˌdaʊnˈloʊd/", sentence: "You can download the lesson at home." },
  { id: 25, word: "dining room", pos: "n.", zh: "飯廳", ipa: "/ˈdaɪnɪŋ ruːm/", sentence: "The family eats dinner in the dining room." },
  { id: 26, word: "election", pos: "n.", zh: "選舉", ipa: "/ɪˈlekʃən/", sentence: "The class election will be held tomorrow." },
  { id: 27, word: "expect", pos: "v.", zh: "期望", ipa: "/ɪkˈspekt/", sentence: "I expect to get better after practice." },
  { id: 28, word: "enough", pos: "adj.", zh: "足夠的", ipa: "/ɪˈnʌf/", sentence: "We have enough chairs for everyone." },
  { id: 29, word: "event", pos: "n.", zh: "事件；活動", ipa: "/ɪˈvent/", sentence: "The sports event begins at nine." },
  { id: 30, word: "foreign", pos: "adj.", zh: "外國的", ipa: "/ˈfɔːrən/", sentence: "Learning a foreign language is useful." },
  { id: 31, word: "festival", pos: "n.", zh: "節慶", ipa: "/ˈfestɪvəl/", sentence: "The lantern festival is very beautiful." },
  { id: 32, word: "golden", pos: "adj.", zh: "金黃色的", ipa: "/ˈɡoʊldən/", sentence: "The sky turned golden at sunset." },
  { id: 33, word: "gram", pos: "n.", zh: "公克", ipa: "/ɡræm/", sentence: "Add one hundred grams of sugar." },
  { id: 34, word: "graduate", pos: "v.", zh: "畢業", ipa: "/ˈɡrædʒueɪt/", sentence: "My brother will graduate from junior high school." },
  { id: 35, word: "giant", pos: "adj.", zh: "巨大的", ipa: "/ˈdʒaɪənt/", sentence: "A giant tree stands beside our school." },
  { id: 36, word: "go out", pos: "phr.", zh: "熄滅", ipa: "/ɡoʊ aʊt/", sentence: "The candle will go out in the wind." },
  { id: 37, word: "garbage", pos: "n.", zh: "垃圾", ipa: "/ˈɡɑːrbɪdʒ/", sentence: "Please take out the garbage after dinner." },
  { id: 38, word: "hard-working", pos: "adj.", zh: "勤奮的", ipa: "/ˌhɑːrd ˈwɜːrkɪŋ/", sentence: "The hard-working student studies every day." },
  { id: 39, word: "handsome", pos: "adj.", zh: "英俊的", ipa: "/ˈhænsəm/", sentence: "The actor looks handsome in the movie." },
  { id: 40, word: "headache", pos: "n.", zh: "頭痛", ipa: "/ˈhedeɪk/", sentence: "I have a headache, so I need rest." },
  { id: 41, word: "honest", pos: "adj.", zh: "誠實的", ipa: "/ˈɑːnɪst/", sentence: "An honest person tells the truth." },
  { id: 42, word: "hospital", pos: "n.", zh: "醫院", ipa: "/ˈhɑːspɪtəl/", sentence: "She works at a hospital near the park." },
  { id: 43, word: "however", pos: "adv.", zh: "然而", ipa: "/haʊˈevər/", sentence: "It was raining; however, we still played." },
  { id: 44, word: "in time", pos: "phr.", zh: "及時", ipa: "/ɪn taɪm/", sentence: "We arrived in time for the movie." },
  { id: 45, word: "improve", pos: "v.", zh: "改善", ipa: "/ɪmˈpruːv/", sentence: "Practice can improve your English." },
  { id: 46, word: "information", pos: "n.", zh: "資訊", ipa: "/ˌɪnfərˈmeɪʃən/", sentence: "The website has useful information." },
  { id: 47, word: "interview", pos: "v.", zh: "面試；訪問", ipa: "/ˈɪntərvjuː/", sentence: "The reporter will interview the singer." },
  { id: 48, word: "island", pos: "n.", zh: "島嶼", ipa: "/ˈaɪlənd/", sentence: "We took a boat to the small island." },
  { id: 49, word: "judgement", pos: "n.", zh: "判斷", ipa: "/ˈdʒʌdʒmənt/", sentence: "Good judgement helps you make safe choices." },
  { id: 50, word: "jeans", pos: "n.", zh: "牛仔褲", ipa: "/dʒiːnz/", sentence: "I wear jeans on weekends." },
  { id: 51, word: "join", pos: "v.", zh: "參加", ipa: "/dʒɔɪn/", sentence: "Would you like to join our team?" },
  { id: 52, word: "knowledge", pos: "n.", zh: "知識", ipa: "/ˈnɑːlɪdʒ/", sentence: "Books give us knowledge about the world." },
  { id: 53, word: "keep in mind", pos: "phr.", zh: "記住", ipa: "/kiːp ɪn maɪnd/", sentence: "Keep in mind that the test is next week." },
  { id: 54, word: "knock", pos: "v.", zh: "敲", ipa: "/nɑːk/", sentence: "Please knock before you enter." },
  { id: 55, word: "language", pos: "n.", zh: "語言", ipa: "/ˈlæŋɡwɪdʒ/", sentence: "English is an important language." },
  { id: 56, word: "leave for", pos: "phr.", zh: "前往", ipa: "/liːv fɔːr/", sentence: "We will leave for Tainan at six." },
  { id: 57, word: "lawyer", pos: "n.", zh: "律師", ipa: "/ˈlɔːjər/", sentence: "The lawyer answered our questions." },
  { id: 58, word: "lovely", pos: "adj.", zh: "可愛的", ipa: "/ˈlʌvli/", sentence: "What a lovely card you made!" },
  { id: 59, word: "luckily", pos: "adv.", zh: "幸運地", ipa: "/ˈlʌkɪli/", sentence: "Luckily, we found the key." },
  { id: 60, word: "machine", pos: "n.", zh: "機器", ipa: "/məˈʃiːn/", sentence: "This machine washes dishes quickly." },
  { id: 61, word: "magic", pos: "adj.", zh: "神奇的", ipa: "/ˈmædʒɪk/", sentence: "The story is about a magic stone." },
  { id: 62, word: "marry", pos: "v.", zh: "嫁；娶", ipa: "/ˈmæri/", sentence: "They plan to marry next spring." },
  { id: 63, word: "matter", pos: "v.", zh: "要緊", ipa: "/ˈmætər/", sentence: "Your feelings matter to your family." },
  { id: 64, word: "moment", pos: "n.", zh: "時刻", ipa: "/ˈmoʊmənt/", sentence: "Please wait a moment." },
  { id: 65, word: "modern", pos: "adj.", zh: "現代的", ipa: "/ˈmɑːdərn/", sentence: "This modern phone has a large screen." },
  { id: 66, word: "mistake", pos: "n.", zh: "錯誤", ipa: "/mɪˈsteɪk/", sentence: "Everyone can learn from a mistake." },
  { id: 67, word: "must", pos: "aux.", zh: "必須", ipa: "/mʌst/", sentence: "You must wear a helmet on a scooter." },
  { id: 68, word: "museum", pos: "n.", zh: "博物館", ipa: "/mjuˈziːəm/", sentence: "Our class visited the science museum." },
  { id: 69, word: "national", pos: "adj.", zh: "國家的", ipa: "/ˈnæʃənəl/", sentence: "The national park is full of trees." },
  { id: 70, word: "nervous", pos: "adj.", zh: "緊張的", ipa: "/ˈnɜːrvəs/", sentence: "I felt nervous before the speech." },
  { id: 71, word: "notice", pos: "n.", zh: "公告", ipa: "/ˈnoʊtɪs/", sentence: "Read the notice on the classroom door." },
  { id: 72, word: "north", pos: "n.", zh: "北方", ipa: "/nɔːrθ/", sentence: "Keelung is in the north of Taiwan." },
  { id: 73, word: "noisy", pos: "adj.", zh: "吵雜的", ipa: "/ˈnɔɪzi/", sentence: "The market is noisy in the morning." },
  { id: 74, word: "neighbor", pos: "n.", zh: "鄰居", ipa: "/ˈneɪbər/", sentence: "Our neighbor gave us some fruit." },
  { id: 75, word: "owner", pos: "n.", zh: "擁有者", ipa: "/ˈoʊnər/", sentence: "The owner of the shop is friendly." },
  { id: 76, word: "outdoor", pos: "adj.", zh: "戶外的", ipa: "/ˈaʊtdɔːr/", sentence: "We enjoy outdoor games after school." },
  { id: 77, word: "ordinary", pos: "adj.", zh: "平凡的", ipa: "/ˈɔːrdəneri/", sentence: "It was an ordinary day at school." },
  { id: 78, word: "often", pos: "adv.", zh: "經常", ipa: "/ˈɔːfən/", sentence: "I often ride my bike to school." },
  { id: 79, word: "polite", pos: "adj.", zh: "有禮的", ipa: "/pəˈlaɪt/", sentence: "It is polite to say thank you." },
  { id: 80, word: "package", pos: "n.", zh: "包裹", ipa: "/ˈpækɪdʒ/", sentence: "A package arrived for my father." },
  { id: 81, word: "perform", pos: "v.", zh: "表演", ipa: "/pərˈfɔːrm/", sentence: "The students will perform a dance." },
  { id: 82, word: "paste", pos: "v.", zh: "黏貼", ipa: "/peɪst/", sentence: "Paste the picture on your notebook." },
  { id: 83, word: "pretty", pos: "adj.", zh: "漂亮的", ipa: "/ˈprɪti/", sentence: "She wore a pretty blue dress." },
  { id: 84, word: "perhaps", pos: "adv.", zh: "或許", ipa: "/pərˈhæps/", sentence: "Perhaps we can meet after class." },
  { id: 85, word: "pleasure", pos: "n.", zh: "愉悅", ipa: "/ˈpleʒər/", sentence: "It is a pleasure to help you." },
  { id: 86, word: "playground", pos: "n.", zh: "遊樂場", ipa: "/ˈpleɪɡraʊnd/", sentence: "Children are running on the playground." },
  { id: 87, word: "popcorn", pos: "n.", zh: "爆米花", ipa: "/ˈpɑːpkɔːrn/", sentence: "We bought popcorn before the movie." },
  { id: 88, word: "put on", pos: "phr.", zh: "穿上", ipa: "/pʊt ɑːn/", sentence: "Put on your jacket before you go out." },
  { id: 89, word: "product", pos: "n.", zh: "產品", ipa: "/ˈprɑːdʌkt/", sentence: "This product is made in Taiwan." },
  { id: 90, word: "perfect", pos: "adj.", zh: "完美的", ipa: "/ˈpɜːrfɪkt/", sentence: "The weather is perfect for a picnic." },
  { id: 91, word: "position", pos: "n.", zh: "姿勢；位置", ipa: "/pəˈzɪʃən/", sentence: "Hold your body in the right position." },
  { id: 92, word: "picnic", pos: "n.", zh: "野餐", ipa: "/ˈpɪknɪk/", sentence: "We had a picnic by the river." },
  { id: 93, word: "prize", pos: "n.", zh: "獎項", ipa: "/praɪz/", sentence: "Mia won first prize in the contest." },
  { id: 94, word: "quarter", pos: "n.", zh: "一刻鐘", ipa: "/ˈkwɔːrtər/", sentence: "The bus leaves in a quarter of an hour." },
  { id: 95, word: "quite", pos: "adv.", zh: "相當地", ipa: "/kwaɪt/", sentence: "The math question is quite easy." },
  { id: 96, word: "rainforest", pos: "n.", zh: "雨林", ipa: "/ˈreɪnfɔːrɪst/", sentence: "Many animals live in the rainforest." },
  { id: 97, word: "relative", pos: "n.", zh: "親戚", ipa: "/ˈrelətɪv/", sentence: "A relative from Japan visited us." },
  { id: 98, word: "review", pos: "v.", zh: "複習", ipa: "/rɪˈvjuː/", sentence: "Review these words before the test." },
  { id: 99, word: "raise", pos: "v.", zh: "飼養；提高", ipa: "/reɪz/", sentence: "My uncle raises chickens on his farm." },
];

const STORAGE_KEY = "recite-99-words-progress-v1";
const state = {
  order: WORDS.map((word) => word.id),
  groupIndex: 0,
  view: "learn",
  reviewIndex: 0,
  reviewFlipped: false,
  quizIndex: 0,
  quizWord: null,
  progress: loadProgress(),
};

const els = {
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  wordGrid: document.querySelector("#wordGrid"),
  groupLabel: document.querySelector("#groupLabel"),
  currentRange: document.querySelector("#currentRange"),
  learnedCount: document.querySelector("#learnedCount"),
  hardCount: document.querySelector("#hardCount"),
  groupSelect: document.querySelector("#groupSelect"),
  prevGroupBtn: document.querySelector("#prevGroupBtn"),
  nextGroupBtn: document.querySelector("#nextGroupBtn"),
  shuffleBtn: document.querySelector("#shuffleBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  reviewFace: document.querySelector("#reviewFace"),
  reviewSpeakBtn: document.querySelector("#reviewSpeakBtn"),
  reviewQueueLabel: document.querySelector("#reviewQueueLabel"),
  flipBtn: document.querySelector("#flipBtn"),
  hardBtn: document.querySelector("#hardBtn"),
  knowBtn: document.querySelector("#knowBtn"),
  quizProgress: document.querySelector("#quizProgress"),
  quizWord: document.querySelector("#quizWord"),
  choices: document.querySelector("#choices"),
  feedback: document.querySelector("#feedback"),
  quizSpeakBtn: document.querySelector("#quizSpeakBtn"),
  newQuizBtn: document.querySelector("#newQuizBtn"),
};

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function wordById(id) {
  return WORDS.find((word) => word.id === id);
}

function getWordStatus(id) {
  return state.progress[id] || { known: false, hard: false, seen: 0 };
}

function updateWordStatus(id, patch) {
  const current = getWordStatus(id);
  state.progress[id] = { ...current, ...patch };
  saveProgress();
  renderStats();
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.voice = pickAmericanVoice();
  utterance.rate = 0.88;
  utterance.pitch = 0.88;
  window.speechSynthesis.speak(utterance);
}

function pickAmericanVoice() {
  const voices = window.speechSynthesis.getVoices();
  const preferredNames = [
    "Aaron",
    "Reed",
    "Eddy",
    "Fred",
    "Daniel",
    "Alex",
    "Google US English",
    "Microsoft Guy",
    "Microsoft David",
  ];
  return (
    preferredNames
      .map((name) => voices.find((voice) => voice.lang.startsWith("en-US") && voice.name.includes(name)))
      .find(Boolean) ||
    voices.find((voice) => voice.lang === "en-US" && !/female|samantha|victoria|karen/i.test(voice.name)) ||
    voices.find((voice) => voice.lang.startsWith("en-US")) ||
    null
  );
}

if ("speechSynthesis" in window) {
  window.speechSynthesis.addEventListener("voiceschanged", pickAmericanVoice);
}

function groupWords() {
  const start = state.groupIndex * 5;
  return state.order.slice(start, start + 5).map(wordById);
}

function maxGroupIndex() {
  return Math.ceil(WORDS.length / 5) - 1;
}

function buildGroupOptions() {
  const options = Array.from({ length: maxGroupIndex() + 1 }, (_, index) => {
    const start = index * 5 + 1;
    const end = Math.min(start + 4, WORDS.length);
    return `<option value="${index}">第 ${index + 1} 組（${start}-${end}）</option>`;
  });
  els.groupSelect.innerHTML = options.join("");
}

function renderStats() {
  const statuses = WORDS.map((word) => getWordStatus(word.id));
  const learned = statuses.filter((status) => status.known).length;
  const hard = statuses.filter((status) => status.hard).length;
  const start = state.groupIndex * 5 + 1;
  const end = Math.min(start + 4, WORDS.length);

  els.learnedCount.textContent = learned;
  els.hardCount.textContent = hard;
  els.currentRange.textContent = `${start}-${end}`;
}

function renderLearn() {
  const words = groupWords();
  const start = state.groupIndex * 5 + 1;
  const end = Math.min(start + 4, WORDS.length);
  els.groupLabel.textContent = `第 ${state.groupIndex + 1} 組 · ${start}-${end}`;
  els.groupSelect.value = String(state.groupIndex);

  els.wordGrid.innerHTML = words
    .map((item) => {
      const status = getWordStatus(item.id);
      return `
        <article class="word-card">
          <div class="card-top">
            <span class="number">#${item.id}</span>
            <button class="mini-button" data-speak="${item.word}" aria-label="播放 ${item.word}" title="播放">▶</button>
          </div>
          <button class="word-button" data-speak="${item.word}">${item.word}</button>
          <div class="ipa">${item.ipa}</div>
          <div class="meaning">${item.zh} <span>${item.pos}</span></div>
          <button class="sentence-button" data-speak="${item.sentence}">${item.sentence}</button>
          <div class="card-actions">
            <button class="${status.hard ? "active" : ""}" data-mark-hard="${item.id}">加強</button>
            <button class="${status.known ? "active" : ""}" data-mark-known="${item.id}">已會</button>
          </div>
        </article>
      `;
    })
    .join("");

  words.forEach((item) => {
    updateWordStatus(item.id, { seen: getWordStatus(item.id).seen + 1 });
  });
  renderStats();
}

function reviewQueue() {
  return [...WORDS].sort((a, b) => {
    const left = getWordStatus(a.id);
    const right = getWordStatus(b.id);
    const leftScore = (left.known ? 4 : 0) - (left.hard ? 3 : 0) + left.seen * 0.02;
    const rightScore = (right.known ? 4 : 0) - (right.hard ? 3 : 0) + right.seen * 0.02;
    return leftScore - rightScore || a.id - b.id;
  });
}

function renderReview() {
  const queue = reviewQueue();
  const item = queue[state.reviewIndex % queue.length];
  const status = getWordStatus(item.id);
  const label = status.hard ? "加強中" : status.known ? "已會" : "尚未熟悉";

  els.reviewQueueLabel.textContent = `#${item.id} · ${label} · ${state.reviewIndex + 1}/${queue.length}`;
  els.reviewFace.innerHTML = state.reviewFlipped
    ? `
      <div class="review-detail">
        <div class="meaning">${item.zh} <span>${item.pos}</span></div>
        <p class="ipa">${item.ipa}</p>
        <button class="sentence-button" data-speak="${item.sentence}">${item.sentence}</button>
      </div>
    `
    : `<button class="word-button review-word" data-speak="${item.word}">${item.word}</button>`;
}

function quizPool() {
  const hard = WORDS.filter((word) => getWordStatus(word.id).hard);
  const unknown = WORDS.filter((word) => !getWordStatus(word.id).known);
  return hard.length ? hard : unknown.length ? unknown : WORDS;
}

function pickQuiz() {
  const pool = quizPool();
  state.quizWord = pool[state.quizIndex % pool.length];
  els.feedback.textContent = "";
  renderQuiz();
}

function renderQuiz() {
  const item = state.quizWord || WORDS[0];
  const choices = shuffle([
    item,
    ...shuffle(WORDS.filter((word) => word.id !== item.id)).slice(0, 3),
  ]);

  els.quizProgress.textContent = `第 ${state.quizIndex + 1} 題`;
  els.quizWord.textContent = item.word;
  els.choices.innerHTML = choices
    .map((choice) => `<button class="choice" data-choice="${choice.id}">${choice.zh} ${choice.pos}</button>`)
    .join("");
}

function answerQuiz(choiceId) {
  const item = state.quizWord;
  const correct = choiceId === item.id;
  document.querySelectorAll(".choice").forEach((button) => {
    const id = Number(button.dataset.choice);
    button.disabled = true;
    if (id === item.id) button.classList.add("correct");
    if (id === choiceId && !correct) button.classList.add("wrong");
  });

  if (correct) {
    els.feedback.textContent = "答對了";
    updateWordStatus(item.id, { known: true, hard: false });
  } else {
    els.feedback.textContent = `再看一次：${item.zh}`;
    updateWordStatus(item.id, { hard: true, known: false });
  }

  window.setTimeout(() => {
    state.quizIndex += 1;
    pickQuiz();
  }, 900);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function setView(view) {
  state.view = view;
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
  els.views.forEach((section) => section.classList.toggle("active", section.id === `${view}View`));
  if (view === "review") renderReview();
  if (view === "quiz") pickQuiz();
}

function bindEvents() {
  els.tabs.forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));

  document.addEventListener("click", (event) => {
    const speakTarget = event.target.closest("[data-speak]");
    const hardTarget = event.target.closest("[data-mark-hard]");
    const knownTarget = event.target.closest("[data-mark-known]");
    const choiceTarget = event.target.closest("[data-choice]");

    if (speakTarget) speak(speakTarget.dataset.speak);
    if (hardTarget) {
      const id = Number(hardTarget.dataset.markHard);
      updateWordStatus(id, { hard: true, known: false });
      renderLearn();
    }
    if (knownTarget) {
      const id = Number(knownTarget.dataset.markKnown);
      updateWordStatus(id, { known: true, hard: false });
      renderLearn();
    }
    if (choiceTarget) answerQuiz(Number(choiceTarget.dataset.choice));
  });

  els.prevGroupBtn.addEventListener("click", () => {
    state.groupIndex = Math.max(0, state.groupIndex - 1);
    renderLearn();
  });

  els.nextGroupBtn.addEventListener("click", () => {
    state.groupIndex = Math.min(maxGroupIndex(), state.groupIndex + 1);
    renderLearn();
  });

  els.groupSelect.addEventListener("change", () => {
    state.order = WORDS.map((word) => word.id);
    state.groupIndex = Number(els.groupSelect.value);
    renderLearn();
  });

  els.shuffleBtn.addEventListener("click", () => {
    state.order = shuffle(state.order);
    state.groupIndex = 0;
    state.reviewIndex = 0;
    renderLearn();
    renderReview();
  });

  els.resetBtn.addEventListener("click", () => {
    state.progress = {};
    saveProgress();
    state.reviewIndex = 0;
    state.reviewFlipped = false;
    renderStats();
    renderLearn();
    renderReview();
  });

  els.flipBtn.addEventListener("click", () => {
    state.reviewFlipped = !state.reviewFlipped;
    renderReview();
  });

  els.hardBtn.addEventListener("click", () => {
    const item = reviewQueue()[state.reviewIndex % WORDS.length];
    updateWordStatus(item.id, { hard: true, known: false });
    state.reviewIndex += 1;
    state.reviewFlipped = false;
    renderReview();
  });

  els.knowBtn.addEventListener("click", () => {
    const item = reviewQueue()[state.reviewIndex % WORDS.length];
    updateWordStatus(item.id, { known: true, hard: false });
    state.reviewIndex += 1;
    state.reviewFlipped = false;
    renderReview();
  });

  els.reviewSpeakBtn.addEventListener("click", () => {
    const item = reviewQueue()[state.reviewIndex % WORDS.length];
    speak(state.reviewFlipped ? item.sentence : item.word);
  });

  els.quizSpeakBtn.addEventListener("click", () => speak(state.quizWord.word));
  els.newQuizBtn.addEventListener("click", () => {
    state.quizIndex += 1;
    pickQuiz();
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

bindEvents();
buildGroupOptions();
renderLearn();
renderReview();
pickQuiz();
