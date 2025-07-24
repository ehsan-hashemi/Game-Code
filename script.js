// ------------------ داده‌ها ------------------

let cards = JSON.parse(localStorage.getItem("cards")) || {};
let games = JSON.parse(localStorage.getItem("games")) || {};

function saveData() {
  localStorage.setItem("cards", JSON.stringify(cards));
  localStorage.setItem("games", JSON.stringify(games));
}

// ------------------ صفحه‌ی اصلی (index.html) ------------------

function processCode() {
  const code = document.getElementById("cardCode").value.trim();
  const card = cards[code];
  if (card) {
    showMenu(code);
  } else {
    showPopup("❌ خطا", "کد وارد شده نامعتبر است!");
  }
}

function showMenu(code) {
  const menu = document.getElementById("menu");
  menu.innerHTML = `
    <h2>کارت: ${code}</h2>
    <button onclick="showStock('${code}')">📦 موجودی</button>
    <button onclick="chargeCard('${code}')">💰 شارژ</button>
    <button onclick="deductCard('${code}')">🎮 کسر بابت بازی</button>
    <button onclick="changeStatus('${code}')">🔄 تغییر وضعیت</button>
    <button onclick="showTransactions('${code}')">📜 تراکنش‌ها</button>
  `;
  menu.classList.remove("hidden");
}

function showPopup(title, message) {
  const popup = document.getElementById("popup");
  popup.innerHTML = `<h3>${title}</h3><p>${message}</p>`;
  popup.classList.remove("hidden");
}

function showStock(code) {
  const card = cards[code];
  showPopup("📦 موجودی", `کد: ${code}<br>موجودی: ${card.balance}R<br>وضعیت: ${card.status}`);
}

function chargeCard(code) {
  const amount = prompt("مبلغ شارژ را وارد کنید:");
  if (amount && !isNaN(amount)) {
    cards[code].balance += parseInt(amount);
    cards[code].transactions.push(`شارژ: +${amount}R`);
    saveData();
    showStock(code);
  }
}

function deductCard(code) {
  const popup = document.getElementById("popup");
  if (Object.keys(games).length === 0) {
    showPopup("❌ خطا", "هیچ بازی‌ای ثبت نشده است!");
    return;
  }

  let options = "";
  for (const name in games) {
    options += `<option value="${name}">${name} - ${games[name]}R</option>`;
  }

  popup.innerHTML = `
    <h3>کسر مبلغ بابت بازی</h3>
    <p>کارت: ${code}</p>
    <select id="gameSelect">${options}</select>
    <br><br>
    <button onclick="applyDeduction('${code}')">تأیید</button>
  `;
  popup.classList.remove("hidden");
}

function applyDeduction(code) {
  const gameName = document.getElementById("gameSelect").value;
  const price = games[gameName];
  if (cards[code].balance >= price) {
    cards[code].balance -= price;
    cards[code].transactions.push(`کسر: -${price}R بابت ${gameName}`);
    saveData();
    showPopup("✅ موفق", `کسر ${price}R بابت بازی ${gameName}`);
  } else {
    showPopup("❌ خطا", "موجودی کافی نیست!");
  }
}

function changeStatus(code) {
  const current = cards[code].status;
  const popup = document.getElementById("popup");
  popup.innerHTML = `
    <h3>تغییر وضعیت کارت ${code}</h3>
    <p>وضعیت فعلی: <strong>${current}</strong></p>
    <select id="statusSelect">
      <option value="Active">فعال</option>
      <option value="Inactive">غیرفعال</option>
    </select>
    <br><br>
    <button onclick="applyStatus('${code}')">تأیید</button>
  `;
  popup.classList.remove("hidden");
}

function applyStatus(code) {
  const newStatus = document.getElementById("statusSelect").value;
  cards[code].status = newStatus;
  saveData();
  showPopup("✅ وضعیت تغییر کرد", `کارت ${code} اکنون ${newStatus} است.`);
}


function showTransactions(code) {
  const tx = cards[code].transactions;
  const html = tx.length ? tx.map(t => `• ${t}`).join("<br>") : "تراکنشی ثبت نشده است.";
  showPopup("📜 تراکنش‌ها", `کد: ${code}<br>${html}`);
}

// ------------------ مدیریت کارت‌ها (manage-cards.html) ------------------

function addCard() {
  const code = document.getElementById("newCardCode").value.trim();
  const status = document.getElementById("newCardStatus").value;
  if (code && !cards[code]) {
    cards[code] = { balance: 0, status, transactions: [] };
    saveData();
    renderCards();
  }
}

function renderCards() {
  const list = document.getElementById("cardList");
  if (!list) return;
  list.innerHTML = "";
  for (const code in cards) {
    const card = cards[code];
    const li = document.createElement("li");
    li.innerHTML = `
      <span>کد: ${code} | موجودی: ${card.balance}R | وضعیت: ${card.status}</span>
      <button onclick="deleteCard('${code}')">🗑 حذف</button>
    `;
    list.appendChild(li);
  }
}

function deleteCard(code) {
  if (confirm(`آیا مطمئن هستید که می‌خواهید کارت ${code} را حذف کنید؟`)) {
    delete cards[code];
    saveData();
    renderCards();
  }
}

function clearCards() {
  if (confirm("آیا مطمئن هستید که می‌خواهید همه کارت‌ها حذف شوند؟")) {
    cards = {};
    saveData();
    renderCards();
  }
}

// ------------------ مدیریت بازی‌ها (manage-games.html) ------------------

function addGame() {
  const name = document.getElementById("newGameName").value.trim();
  const price = parseInt(document.getElementById("newGamePrice").value);
  if (name && !games[name] && !isNaN(price)) {
    games[name] = price;
    saveData();
    renderGames();
  }
}

function renderGames() {
  const list = document.getElementById("gameList");
  if (!list) return;
  list.innerHTML = "";
  for (const name in games) {
    const price = games[name];
    const li = document.createElement("li");
    li.innerHTML = `
      <span>🎮 ${name} - ${price}R</span>
      <button onclick="deleteGame('${name}')">🗑 حذف</button>
    `;
    list.appendChild(li);
  }
}

function deleteGame(name) {
  if (confirm(`آیا مطمئن هستید که می‌خواهید بازی ${name} را حذف کنید؟`)) {
    delete games[name];
    saveData();
    renderGames();
  }
}

function clearGames() {
  if (confirm("آیا مطمئن هستید که می‌خواهید همه بازی‌ها حذف شوند؟")) {
    games = {};
    saveData();
    renderGames();
  }
}

// 🌙 تغییر حالت تاریک/روشن
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

// 🕒 بارگذاری حالت ذخیره‌شده از قبل
window.addEventListener("DOMContentLoaded", () => {
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "true") {
    document.body.classList.add("dark");
  }

  // اگر فرم تراکنش وجود دارد، هندلرها را وصل کن
  const transactionForm = document.getElementById("transaction-form");
  if (transactionForm) {
    transactionForm.addEventListener("submit", handleTransaction);
  }

  // اگر فرم کارت وجود دارد
  const cardForm = document.getElementById("card-form");
  if (cardForm) {
    cardForm.addEventListener("submit", handleCardAdd);
  }

  // اگر فرم بازی وجود دارد
  const gameForm = document.getElementById("game-form");
  if (gameForm) {
    gameForm.addEventListener("submit", handleGameAdd);
  }
});

// 💳 هندل تراکنش
function handleTransaction(event) {
  event.preventDefault();

  const fromCard = document.getElementById("from-card").value;
  const toCard = document.getElementById("to-card").value;
  const amount = document.getElementById("amount").value;

  if (!fromCard || !toCard || !amount) {
    alert("لطفاً همه‌ی فیلدها را پر کنید.");
    return;
  }

  const timestamp = new Date().toLocaleString("fa-IR");
  const message = `تراکنش از ${fromCard} به ${toCard} به مبلغ ${amount} تومان در ${timestamp} ثبت شد.`;

  showPopup(message);
}

// ➕ هندل افزودن کارت
function handleCardAdd(event) {
  event.preventDefault();

  const cardName = document.getElementById("card-name").value;
  if (!cardName) {
    alert("نام کارت را وارد کنید.");
    return;
  }

  const timestamp = new Date().toLocaleString("fa-IR");
  const message = `کارت "${cardName}" در ${timestamp} اضافه شد.`;

  showPopup(message);
}

// 🎮 هندل افزودن بازی
function handleGameAdd(event) {
  event.preventDefault();

  const gameName = document.getElementById("game-name").value;
  if (!gameName) {
    alert("نام بازی را وارد کنید.");
    return;
  }

  const timestamp = new Date().toLocaleString("fa-IR");
  const message = `بازی "${gameName}" در ${timestamp} اضافه شد.`;

  showPopup(message);
}

// 🔔 نمایش پیام در پاپ‌آپ
function showPopup(message) {
  const popup = document.getElementById("popup");
  if (!popup) return;

  popup.textContent = message;
  popup.classList.remove("hidden");

  setTimeout(() => {
    popup.classList.add("hidden");
  }, 4000);
}

// ------------------ بارگذاری خودکار ------------------

window.addEventListener("DOMContentLoaded", () => {
  renderCards();
  renderGames();
});