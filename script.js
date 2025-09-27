// ============================
// НАСТРОЙКИ / ДАННЫЕ
// ============================
const IMAGES_COUNT = 9;
const COMMENTS = [
  "Вечер в горах", "Закат у моря", "Город ночью",
  "Прогулка в лесу", "Утро в деревне", "Снежные вершины",
  "Осенний парк", "Летний день", "Зимний закат"
];

// ============================
// ИНИЦИАЛИЗАЦИЯ СОСТОЯНИЯ
// ============================
// Структура элемента: { likes: number, dislikes: number, user: 'like' | 'dislike' | null }
function loadStats() {
  const raw = localStorage.getItem("photoStats");
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = null;
  }
  // миграция и валидация
  if (!Array.isArray(data) || data.length !== IMAGES_COUNT) {
    data = Array.from({ length: IMAGES_COUNT }, () => ({
      likes: 0,
      dislikes: 0,
      user: null,
    }));
  } else {
    data = data.map((it) => ({
      likes: Number.isFinite(it?.likes) ? Math.max(0, Math.trunc(it.likes)) : 0,
      dislikes: Number.isFinite(it?.dislikes) ? Math.max(0, Math.trunc(it.dislikes)) : 0,
      user: it?.user === "like" || it?.user === "dislike" ? it.user : null,
    }));
  }
  return data;
}
function saveStats() {
  localStorage.setItem("photoStats", JSON.stringify(stats));
}
let stats = loadStats();

// ============================
// РЕНДЕР ГАЛЕРЕИ
// ============================
const gallery = document.getElementById("gallery");

for (let i = 1; i <= IMAGES_COUNT; i++) {
  const card = document.createElement("div");
  card.className = "photo-card cursor-pointer";
  card.innerHTML = `
    <div class="photo-frame">
      <img src="img/img${i}.png" alt="Gallery image ${i}">
    </div>
    <div class="photo-caption">
      <p>${COMMENTS[i - 1]}</p>
      <div class="photo-actions">
        <button class="like-btn" data-id="${i}">
          <img src="icon/like.svg" alt="Like">
          <span>${stats[i - 1].likes}</span>
        </button>
        <button class="dislike-btn" data-id="${i}">
          <img src="icon/deslike.svg" alt="Dislike">
          <span>${stats[i - 1].dislikes}</span>
        </button>
      </div>
    </div>
  `;
  gallery.appendChild(card);
}

// Применяем визуальные состояния для всех фото на старте
for (let i = 1; i <= IMAGES_COUNT; i++) updateUI(i);

// ============================
// МОДАЛЬНОЕ ОКНО
// ============================
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalComment = document.getElementById("modalComment");
const closeModal = document.getElementById("closeModal");
const modalLikeBtn = modal.querySelector(".like-btn");
const modalDislikeBtn = modal.querySelector(".dislike-btn");

let currentIndex = 0; // 0..IMAGES_COUNT-1

function openPhoto(index) {
  currentIndex = index;
  const id = index + 1;
  modalImg.src = `img/img${id}.png`;
  modalComment.textContent = COMMENTS[index];

  // прокидываем id в кнопки модалки и обновляем их вид/счётчики
  modalLikeBtn.dataset.id = String(id);
  modalDislikeBtn.dataset.id = String(id);
  updateUI(id);

  modal.classList.remove("hidden");
  document.body.classList.add("no-scroll");
  // плавное проявление фото
  requestAnimationFrame(() => modalImg.classList.add("show"));
}

function closePhoto() {
  modal.classList.add("hidden");
  document.body.classList.remove("no-scroll");
  modalImg.classList.remove("show");
}

// Открытие по клику на превью
gallery.addEventListener("click", (e) => {
  const img = e.target.closest("img");
  if (!img) return;
  const match = img.alt.match(/\d+/);
  if (!match) return;
  openPhoto(Number(match[0]) - 1);
});

// Закрытие модалки
closeModal.addEventListener("click", closePhoto);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closePhoto();
});

// Клавиатура: Esc закрыть, стрелки листать
document.addEventListener("keydown", (e) => {
  if (modal.classList.contains("hidden")) return;
  if (e.key === "Escape") return closePhoto();
  if (e.key === "ArrowLeft") return showPrev();
  if (e.key === "ArrowRight") return showNext();
});

// Стрелки в модалке
const prevBtn = document.getElementById("prevPhoto");
const nextBtn = document.getElementById("nextPhoto");
prevBtn.addEventListener("click", showPrev);
nextBtn.addEventListener("click", showNext);

function showPrev() {
  currentIndex = (currentIndex - 1 + IMAGES_COUNT) % IMAGES_COUNT;
  openPhoto(currentIndex);
}
function showNext() {
  currentIndex = (currentIndex + 1) % IMAGES_COUNT;
  openPhoto(currentIndex);
}

// Свайпы (тач)
let startX = 0;
modal.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});
modal.addEventListener("touchend", (e) => {
  const endX = e.changedTouches[0].clientX;
  const delta = endX - startX;
  if (Math.abs(delta) < 50) return;
  if (delta > 0) showPrev();
  else showNext();
});

// ============================
// ЛАЙКИ / ДИЗЛАЙКИ (единая логика)
// ============================

document.addEventListener("click", (e) => {
  const likeBtn = e.target.closest(".like-btn");
  const dislikeBtn = e.target.closest(".dislike-btn");
  if (!likeBtn && !dislikeBtn) return;

  const btn = likeBtn || dislikeBtn;
  const id = Number(btn.dataset.id); // 1..IMAGES_COUNT
  const type = likeBtn ? "like" : "dislike";
  toggleReaction(id, type);
});

// Переключает/снимает реакцию пользователя строго по правилу «только один выбор»
function toggleReaction(id, type /* 'like' | 'dislike' */) {
  const i = id - 1;
  const item = stats[i];

  if (item.user === type) {
    // пользователь повторно нажал на ту же реакцию — снимаем её
    if (type === "like" && item.likes > 0) item.likes--;
    if (type === "dislike" && item.dislikes > 0) item.dislikes--;
    item.user = null;
  } else {
    // пользователь меняет реакцию или ставит новую
    if (item.user === "like" && item.likes > 0) item.likes--;
    if (item.user === "dislike" && item.dislikes > 0) item.dislikes--;
    if (type === "like") item.likes++;
    else item.dislikes++;
    item.user = type;
  }

  saveStats();
  updateUI(id);
}

// Обновляет все кнопки (в карточке и модалке) для одного фото
function updateUI(id) {
  const i = id - 1;
  const item = stats[i];

  // все like-кнопки этого фото
  document.querySelectorAll(`.like-btn[data-id="${id}"]`).forEach((btn) => {
    const span = btn.querySelector("span");
    const img = btn.querySelector("img");
    span.textContent = String(item.likes);

    // визуальная подсветка (минималистично)
    const isActive = item.user === "like";
    btn.classList.toggle("active", isActive);

    span.classList.toggle("text-green-600", isActive);
    span.classList.toggle("font-semibold", isActive);
    span.classList.toggle("text-gray-500", !isActive);

    if (img) img.style.opacity = isActive ? "1" : "0.6";
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  // все dislike-кнопки этого фото
  document.querySelectorAll(`.dislike-btn[data-id="${id}"]`).forEach((btn) => {
    const span = btn.querySelector("span");
    const img = btn.querySelector("img");
    span.textContent = String(item.dislikes);

    const isActive = item.user === "dislike";
    btn.classList.toggle("active", isActive);

    span.classList.toggle("text-red-600", isActive);
    span.classList.toggle("font-semibold", isActive);
    span.classList.toggle("text-gray-500", !isActive);

    if (img) img.style.opacity = isActive ? "1" : "0.6";
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

// ============================
// ТЕМА (светлая/тёмная)
// ============================
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

(function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (saved === "dark" || (!saved && prefersDark)) {
    document.documentElement.classList.add("dark");
    setThemeIcon("moon");
  } else {
    document.documentElement.classList.remove("dark");
    setThemeIcon("sun");
  }
})();

themeToggle.addEventListener("click", () => {
  const root = document.documentElement;
  root.classList.toggle("dark");
  const isDark = root.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  setThemeIcon(isDark ? "moon" : "sun");
});

function setThemeIcon(mode) {
  if (mode === "moon") {
    themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"></path>`;
  } else {
    themeIcon.innerHTML = `
      <circle cx="12" cy="12" r="5"></circle>
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
    `;
  }
}