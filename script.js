// === Галерея ===
const gallery = document.getElementById("gallery");
const comments = [
  "Вечер в горах", "Закат у моря", "Город ночью",
  "Прогулка в лесу", "Утро в деревне", "Снежные вершины",
  "Осенний парк", "Летний день", "Зимний закат"
];

// Загружаем лайки/дизлайки из localStorage
let stats = JSON.parse(localStorage.getItem("photoStats")) 
          || Array.from({ length: 9 }, () => ({ likes: 0, dislikes: 0 }));

function saveStats() {
  localStorage.setItem("photoStats", JSON.stringify(stats));
}

// Рендер карточек
for (let i = 1; i <= 9; i++) {
  const card = document.createElement("div");
  card.className = "photo-card cursor-pointer";
  card.innerHTML = `
    <div class="photo-frame">
      <img src="img/img${i}.png" alt="Gallery image ${i}">
    </div>
    <div class="photo-caption">
      <p>${comments[i - 1]}</p>
      <div class="photo-actions">
        <button class="like-btn" data-id="${i}">
          <img src="icon/like.svg" alt="Like"><span>${stats[i - 1].likes}</span>
        </button>
        <button class="dislike-btn" data-id="${i}">
          <img src="icon/deslike.svg" alt="Dislike"><span>${stats[i - 1].dislikes}</span>
        </button>
      </div>
    </div>
  `;
  gallery.appendChild(card);
}

// === Модальное окно ===
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalComment = document.getElementById("modalComment");
const closeModal = document.getElementById("closeModal");
let currentIndex = 0;

function openPhoto(index) {
  currentIndex = index;
  modalImg.src = `img/img${index + 1}.png`;
  modalComment.textContent = comments[index];
  modal.classList.remove("hidden");
  document.body.classList.add("no-scroll");
  setTimeout(() => modalImg.classList.add("show"), 50);

  // обновляем лайки/дизлайки
  document.querySelector("#modal .like-btn").dataset.id = index + 1;
  document.querySelector("#modal .dislike-btn").dataset.id = index + 1;
  updateButtons(index + 1);
}

function close() {
  modal.classList.add("hidden");
  document.body.classList.remove("no-scroll");
  modalImg.classList.remove("show");
}

// Открытие фото
gallery.addEventListener("click", e => {
  const img = e.target.closest("img");
  if (!img) return;
  const index = +img.alt.match(/\d+/)[0] - 1;
  openPhoto(index);
});

// Закрытие фото
closeModal.addEventListener("click", () => close());
modal.addEventListener("click", e => { if (e.target === modal) close(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

// === Перелистывание ===
document.getElementById("prevPhoto").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + comments.length) % comments.length;
  openPhoto(currentIndex);
});
document.getElementById("nextPhoto").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % comments.length;
  openPhoto(currentIndex);
});
document.addEventListener("keydown", e => {
  if (modal.classList.contains("hidden")) return;
  if (e.key === "ArrowLeft") {
    currentIndex = (currentIndex - 1 + comments.length) % comments.length;
    openPhoto(currentIndex);
  }
  if (e.key === "ArrowRight") {
    currentIndex = (currentIndex + 1) % comments.length;
    openPhoto(currentIndex);
  }
});
// свайпы
let startX = 0;
modal.addEventListener("touchstart", e => { startX = e.touches[0].clientX; });
modal.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  if (endX - startX > 50) {
    currentIndex = (currentIndex - 1 + comments.length) % comments.length;
    openPhoto(currentIndex);
  } else if (startX - endX > 50) {
    currentIndex = (currentIndex + 1) % comments.length;
    openPhoto(currentIndex);
  }
});

// === Лайки / дизлайки ===
function updateButtons(id) {
  document.querySelectorAll(`[data-id="${id}"]`).forEach(btn => {
    const span = btn.querySelector("span");
    if (btn.classList.contains("like-btn")) span.textContent = stats[id - 1].likes;
    if (btn.classList.contains("dislike-btn")) span.textContent = stats[id - 1].dislikes;
  });
}

document.addEventListener("click", e => {
  const likeBtn = e.target.closest(".like-btn");
  const dislikeBtn = e.target.closest(".dislike-btn");

  if (likeBtn) {
    const id = +likeBtn.dataset.id;
    if (likeBtn.classList.contains("active")) {
      stats[id - 1].likes--; 
      likeBtn.classList.remove("active");
    } else {
      stats[id - 1].likes++;
      const activeDis = document.querySelector(`.dislike-btn[data-id="${id}"].active`);
      if (activeDis) { stats[id - 1].dislikes--; activeDis.classList.remove("active"); }
      likeBtn.classList.add("active");
    }
    updateButtons(id);
    saveStats(); // 💾 сохраняем
  }

  if (dislikeBtn) {
    const id = +dislikeBtn.dataset.id;
    if (dislikeBtn.classList.contains("active")) {
      stats[id - 1].dislikes--; 
      dislikeBtn.classList.remove("active");
    } else {
      stats[id - 1].dislikes++;
      const activeLike = document.querySelector(`.like-btn[data-id="${id}"].active`);
      if (activeLike) { stats[id - 1].likes--; activeLike.classList.remove("active"); }
      dislikeBtn.classList.add("active");
    }
    updateButtons(id);
    saveStats(); // 💾 сохраняем
  }
});

// === Переключение темы ===
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
if (localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add("dark"); setIcon("moon");
} else { setIcon("sun"); }
themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  const isDark = document.documentElement.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  setIcon(isDark ? "moon" : "sun");
});
function setIcon(mode) {
  if (mode === "moon") {
    themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"></path>`;
  } else {
    themeIcon.innerHTML = `<circle cx="12" cy="12" r="5"></circle>
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>`;
  }
}