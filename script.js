// Tailwind config
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#364049",
        "background-light": "#f7f7f7",
        "background-dark": "#17191b",
      },
      fontFamily: {
        display: ["Public Sans"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
};

// --------- Галерея -----------
const gallery = document.getElementById("gallery");
const images = 9;
const comments = [
  "Первое фото — красивый момент!",
  "Второе фото — супер!",
  "Третье фото — невероятное!",
  "Четвёртое фото — огонь!",
  "Пятое фото — шикарно!",
  "Шестое фото — класс!",
  "Седьмое фото — топ!",
  "Восьмое фото — круто снято!",
  "Девятое фото — вау!",
];

// Загружаем состояние из localStorage
let stats =
  JSON.parse(localStorage.getItem("photoStats")) ||
  Array.from({ length: images }, () => ({
    likes: 0,
    dislikes: 0,
    user: null,
  }));

for (let i = 1; i <= images; i++) {
  const wrapper = document.createElement("div");
  wrapper.className = "grid-item group";

  wrapper.innerHTML = `
    <img src="img/img${i}.png" alt="Gallery image ${i}"
      class="w-full h-auto rounded-lg transition-transform duration-300 group-hover:scale-105 cursor-pointer">
    <div class="mt-2 bg-white dark:bg-background-dark rounded-lg p-3 shadow text-primary">
      <p class="text-sm mb-2">${comments[i - 1]}</p>
      <div class="flex items-center space-x-4 text-sm">
        <button class="like-btn flex items-center space-x-1 transition" data-id="${i}">
          <img src="icon/like.svg" alt="Like" class="w-5 h-5 opacity-60 icon-hover transition">
          <span class="text-gray-500 transition">${stats[i - 1].likes}</span>
        </button>
        <button class="dislike-btn flex items-center space-x-1 transition" data-id="${i}">
          <img src="icon/deslike.svg" alt="Dislike" class="w-5 h-5 opacity-60 icon-hover transition">
          <span class="text-gray-500 transition">${stats[i - 1].dislikes}</span>
        </button>
      </div>
    </div>
  `;

  wrapper.querySelector("img").addEventListener("click", () => {
    openModal(i);
  });

  gallery.appendChild(wrapper);
  updateCounts(i); // применяем подсветку при загрузке
}

// --------- Модальное окно -----------
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalComment = document.getElementById("modalComment");
const closeModal = document.getElementById("closeModal");

const modalLikeBtn = modal.querySelector(".like-btn");
const modalDislikeBtn = modal.querySelector(".dislike-btn");

let currentId = null;

function openModal(id) {
  currentId = id;
  modalImg.src = `img/img${id}.png`;
  modalComment.textContent = comments[id - 1];

  // Обновляем счётчики и подсветку
  modalLikeBtn.setAttribute("data-id", id);
  modalDislikeBtn.setAttribute("data-id", id);
  updateCounts(id);

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Плавное проявление фото
  modalImg.classList.remove("show");
  modalImg.classList.add("fade-in");
  setTimeout(() => modalImg.classList.add("show"), 10);
}

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
});

// --------- Лайки/дизлайки (ограничение: 1 на фото) -----------
document.addEventListener("click", (e) => {
  const likeBtn = e.target.closest(".like-btn");
  const dislikeBtn = e.target.closest(".dislike-btn");

  if (likeBtn) {
    const id = parseInt(likeBtn.getAttribute("data-id"));
    toggleReaction(id, "like");
  }

  if (dislikeBtn) {
    const id = parseInt(dislikeBtn.getAttribute("data-id"));
    toggleReaction(id, "dislike");
  }
});

function toggleReaction(id, type) {
  const item = stats[id - 1];

  if (item.user === type) {
    // снимаем реакцию
    item.user = null;
    item[type === "like" ? "likes" : "dislikes"]--;
  } else {
    // убираем противоположную реакцию если была
    if (item.user === "like") item.likes--;
    if (item.user === "dislike") item.dislikes--;

    // ставим новую реакцию
    item.user = type;
    item[type === "like" ? "likes" : "dislikes"]++;
  }

  // сохраняем
  localStorage.setItem("photoStats", JSON.stringify(stats));

  // обновляем UI
  updateCounts(id);
}

function updateCounts(id) {
  const item = stats[id - 1];

  const allLikeBtns = document.querySelectorAll(`.like-btn[data-id="${id}"]`);
  const allDislikeBtns = document.querySelectorAll(`.dislike-btn[data-id="${id}"]`);

  allLikeBtns.forEach((btn) => {
    const span = btn.querySelector("span");
    span.textContent = item.likes;

    span.classList.remove("text-green-600", "font-semibold", "text-gray-500");
    btn.querySelector("img").classList.remove("opacity-100");

    if (item.user === "like") {
      span.classList.add("text-green-600", "font-semibold");
      btn.querySelector("img").classList.add("opacity-100");
    } else {
      span.classList.add("text-gray-500");
    }
  });

  allDislikeBtns.forEach((btn) => {
    const span = btn.querySelector("span");
    span.textContent = item.dislikes;

    span.classList.remove("text-red-600", "font-semibold", "text-gray-500");
    btn.querySelector("img").classList.remove("opacity-100");

    if (item.user === "dislike") {
      span.classList.add("text-red-600", "font-semibold");
      btn.querySelector("img").classList.add("opacity-100");
    } else {
      span.classList.add("text-gray-500");
    }
  });
}