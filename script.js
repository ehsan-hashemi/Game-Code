// ------------------ داده‌ها ------------------

let cards = JSON.parse(localStorage.getItem("cards")) || {};
let games = JSON.parse(localStorage.getItem("games")) || {};

function saveData() {
  localStorage.setItem("cards", JSON.stringify(cards));
  localStorage.setItem("games", JSON.stringify(games));
}

// ------------------ حالت تاریک ------------------

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

function loadDarkMode() {
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "true") {
    document.body.classList.add("dark");
  }
}

// ------------------ پاپ‌آپ ------------------

function showPopup(title, message) {
  const popup = document.getElementById("popup");
  if (!popup) return;
  popup.innerHTML = `<h3>${title}</h3><p>${message}</p>`;
  popup.classList.remove("hidden");
  setTimeout(() => popup.classList.add("hidden"), 4000);
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
    <button type="button" onclick="showStock('${code}')">📦 موجودی</button>
    <button type="button" onclick="chargeCard('${code}')">💰 شارژ</button>
    <button type="button" onclick="deductCard('${code}')">🎮 کسر بابت بازی</button>
    <button type="button" onclick="changeStatus('${code}')">🔄 تغییر وضعیت</button>
    <button type="button" onclick="showTransactions('${code}')">📜 تراکنش‌ها</button>

  `;
  menu.classList.remove("hidden");
}

function showStock(code) {
  const card = cards[code];
  showPopup("📦 موجودی", `کد: ${code}<br>موجودی: ${card.balance}R<br>وضعیت: ${card.status}`);
}

function chargeCard(code) {
  const amount = prompt("مبلغ شارژ را وارد کنید:");
  if (amount && !isNaN(amount)) {
    const value = parseInt(amount);
    cards[code].balance += value;
    const time = new Date().toLocaleString("fa-IR");
    cards[code].transactions.push(`شارژ: +${value}R در ${time}`);
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
  const card = cards[code];

  if (card.balance >= price) {
    card.balance -= price;
    const time = new Date().toLocaleString("fa-IR");
    card.transactions.push(`کسر: -${price}R بابت ${gameName} در ${time}`);
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
  const time = new Date().toLocaleString("fa-IR");
  cards[code].transactions.push(`تغییر وضعیت به ${newStatus} در ${time}`);
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

// ------------------ بارگذاری خودکار ------------------

window.addEventListener("DOMContentLoaded", () => {
  loadDarkMode();
  renderCards();
  renderGames();
});