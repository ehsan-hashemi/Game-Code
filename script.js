// Load or initialize data
let cards = JSON.parse(localStorage.getItem("cards")) || {};
let games = JSON.parse(localStorage.getItem("games")) || {};

function saveData() {
  localStorage.setItem("cards", JSON.stringify(cards));
  localStorage.setItem("games", JSON.stringify(games));
}

// ------------------ index.html ------------------

function processCode() {
  const code = document.getElementById("cardCode").value.trim();
  const card = cards[code];
  if (card) {
    showMenu(code);
  } else {
    showPopup("خطا", "کد وارد شده نامعتبر است!");
  }
}

function showMenu(code) {
  const menu = document.getElementById("menu");
  menu.innerHTML = `
    <h2>کارت: ${code}</h2>
    <button onclick="showStock('${code}')">موجودی</button>
    <button onclick="chargeCard('${code}')">شارژ</button>
    <button onclick="deductCard('${code}')">کسر</button>
    <button onclick="changeStatus('${code}')">وضعیت</button>
    <button onclick="showTransactions('${code}')">تراکنش‌ها</button>
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
  showPopup("موجودی", `کد: ${code}<br>موجودی: ${card.balance}R<br>وضعیت: ${card.status}`);
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
  const game = prompt("نام بازی را وارد کنید:");
  if (games[game]) {
    const price = games[game];
    cards[code].balance -= price;
    cards[code].transactions.push(`کسر: -${price}R برای ${game}`);
    saveData();
    showPopup("موفق", `کسر ${price}R برای ${game}`);
  } else {
    showPopup("خطا", "بازی یافت نشد!");
  }
}

function changeStatus(code) {
  const status = prompt("وضعیت جدید را وارد کنید (Active/Inactive):");
  if (status === "Active" || status === "Inactive") {
    cards[code].status = status;
    saveData();
    showPopup("وضعیت تغییر کرد", `کارت ${code} اکنون ${status} است.`);
  } else {
    showPopup("خطا", "وضعیت نامعتبر است!");
  }
}

function showTransactions(code) {
  const tx = cards[code].transactions.join("<br>");
  showPopup("تراکنش‌ها", `کد: ${code}<br>${tx}`);
}

// ------------------ manage-cards.html ------------------

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
