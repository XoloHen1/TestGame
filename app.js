const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const resources = {
  wood: { name: "Древесина", base: 5 },
  ore: { name: "Руда", base: 8 },
  grain: { name: "Зерно", base: 4 },
  herbs: { name: "Травы", base: 6 },
  planks: { name: "Доски", base: 13 },
  tools: { name: "Инструменты", base: 24 },
  bread: { name: "Хлеб", base: 12 },
  elixir: { name: "Эликсир", base: 31 }
};

const workshops = [
  { id: "forest", title: "Лесная артель", result: { wood: 8 }, cost: {}, text: "Добывает древесину для досок и караванов." },
  { id: "mine", title: "Рудник", result: { ore: 5 }, cost: {}, text: "Поставляет руду для инструментов." },
  { id: "farm", title: "Ферма", result: { grain: 10 }, cost: {}, text: "Выращивает зерно для городских заказов." },
  { id: "herbalist", title: "Травник", result: { herbs: 6 }, cost: {}, text: "Собирает травы для алхимии." },
  { id: "sawmill", title: "Лесопилка", result: { planks: 4 }, cost: { wood: 6 }, text: "Перерабатывает древесину в доски." },
  { id: "forge", title: "Кузница", result: { tools: 2 }, cost: { ore: 4, planks: 1 }, text: "Создаёт инструменты для торговли и проектов." },
  { id: "bakery", title: "Пекарня", result: { bread: 5 }, cost: { grain: 6, wood: 1 }, text: "Печёт хлеб, который ценят столица и караваны." },
  { id: "lab", title: "Алхимия", result: { elixir: 2 }, cost: { herbs: 5, grain: 2 }, text: "Варит дорогие эликсиры для редких контрактов." }
];

const events = [
  { name: "Фестиваль", effect: "Хлеб +35%", mod: { bread: 1.35, elixir: 1.15 } },
  { name: "Стройка моста", effect: "Доски +40%", mod: { planks: 1.4, wood: 1.12 } },
  { name: "Военный заказ", effect: "Инструменты +45%", mod: { tools: 1.45, ore: 1.18 } },
  { name: "Засуха", effect: "Зерно +50%", mod: { grain: 1.5, bread: 1.2 } },
  { name: "Морская ярмарка", effect: "Эликсиры +40%", mod: { elixir: 1.4, herbs: 1.18 } }
];

const caravans = [
  { city: "Столица", item: "bread", qty: 8, bonus: 1.65, cost: 12 },
  { city: "Шахтёрский хребет", item: "tools", qty: 3, bonus: 1.8, cost: 16 },
  { city: "Порт", item: "planks", qty: 7, bonus: 1.55, cost: 10 },
  { city: "Оазис", item: "elixir", qty: 3, bonus: 1.9, cost: 20 }
];

const guildGoals = [
  { name: "Склад гильдии", item: "planks", need: 35, reward: 180, rep: 8 },
  { name: "Ярмарочная площадь", item: "bread", need: 45, reward: 220, rep: 10 },
  { name: "Караванный двор", item: "tools", need: 18, reward: 260, rep: 12 },
  { name: "Дом лекарей", item: "elixir", need: 14, reward: 310, rep: 14 }
];

const initialState = {
  day: 1,
  coins: 160,
  reputation: 0,
  storageLimit: 120,
  inventory: { wood: 10, ore: 6, grain: 12, herbs: 5, planks: 0, tools: 0, bread: 0, elixir: 0 },
  eventIndex: 0,
  priceSeed: 3,
  guildIndex: 0,
  guildProgress: 0,
  log: ["Компания открыла торговую контору в Караванике."]
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("karavanika-state"));
    return saved ? { ...initialState, ...saved, inventory: { ...initialState.inventory, ...saved.inventory } } : structuredClone(initialState);
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem("karavanika-state", JSON.stringify(state));
}

function priceOf(id) {
  const event = events[state.eventIndex];
  const wave = 0.88 + ((Math.sin((state.day + state.priceSeed + id.length) * 1.37) + 1) / 2) * 0.34;
  return Math.max(1, Math.round(resources[id].base * wave * (event.mod[id] || 1)));
}

function inventoryTotal() {
  return Object.values(state.inventory).reduce((sum, value) => sum + value, 0);
}

function canFit(amount) {
  return inventoryTotal() + amount <= state.storageLimit;
}

function formatBundle(bundle) {
  const entries = Object.entries(bundle);
  if (!entries.length) return "Без затрат";
  return entries.map(([id, qty]) => `${resources[id].name}: ${qty}`).join(", ");
}

function hasItems(bundle) {
  return Object.entries(bundle).every(([id, qty]) => state.inventory[id] >= qty);
}

function addLog(text) {
  state.log.unshift(`День ${state.day}: ${text}`);
  state.log = state.log.slice(0, 24);
}

function toast(text) {
  const el = document.getElementById("toast");
  el.textContent = text;
  el.classList.add("is-visible");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => el.classList.remove("is-visible"), 2200);
  tg?.HapticFeedback?.notificationOccurred("success");
}

function produce(workshop) {
  const outputQty = Object.values(workshop.result).reduce((sum, value) => sum + value, 0);
  if (!canFit(outputQty)) return toast("На складе не хватает места.");
  if (!hasItems(workshop.cost)) return toast("Не хватает ресурсов для производства.");

  Object.entries(workshop.cost).forEach(([id, qty]) => {
    state.inventory[id] -= qty;
  });
  Object.entries(workshop.result).forEach(([id, qty]) => {
    state.inventory[id] += qty;
  });
  addLog(`${workshop.title}: произведено ${formatBundle(workshop.result)}.`);
  render();
}

function sell(id, qty) {
  if (state.inventory[id] < qty) return toast("Недостаточно товара.");
  const income = priceOf(id) * qty;
  state.inventory[id] -= qty;
  state.coins += income;
  addLog(`Продано ${resources[id].name}: ${qty} за ${income} монет.`);
  render();
}

function buy(id, qty) {
  const cost = Math.ceil(priceOf(id) * qty * 1.15);
  if (!canFit(qty)) return toast("На складе не хватает места.");
  if (state.coins < cost) return toast("В казне недостаточно монет.");
  state.coins -= cost;
  state.inventory[id] += qty;
  addLog(`Куплено ${resources[id].name}: ${qty} за ${cost} монет.`);
  render();
}

function sendCaravan(route) {
  if (state.inventory[route.item] < route.qty) return toast("Не хватает товара для каравана.");
  if (state.coins < route.cost) return toast("Не хватает монет на пошлину.");
  const income = Math.round(priceOf(route.item) * route.qty * route.bonus);
  state.inventory[route.item] -= route.qty;
  state.coins += income - route.cost;
  state.reputation += 2;
  addLog(`Караван в город ${route.city} принёс ${income - route.cost} монет прибыли.`);
  render();
}

function contributeGuild() {
  const goal = guildGoals[state.guildIndex];
  const available = state.inventory[goal.item];
  const left = goal.need - state.guildProgress;
  const contribution = Math.min(available, left, Math.max(1, Math.ceil(goal.need * 0.25)));
  if (contribution <= 0) return toast("Нет подходящих товаров для взноса.");
  state.inventory[goal.item] -= contribution;
  state.guildProgress += contribution;
  addLog(`В гильдию внесено ${resources[goal.item].name}: ${contribution}.`);

  if (state.guildProgress >= goal.need) {
    state.coins += goal.reward;
    state.reputation += goal.rep;
    addLog(`Гильдейский проект "${goal.name}" выполнен. Награда: ${goal.reward} монет.`);
    state.guildIndex = (state.guildIndex + 1) % guildGoals.length;
    state.guildProgress = 0;
  }
  render();
}

function nextDay() {
  state.day += 1;
  state.priceSeed = (state.priceSeed * 7 + state.day * 3) % 19;
  if (state.day % 3 === 0) state.eventIndex = (state.eventIndex + 1) % events.length;
  state.coins = Math.max(0, state.coins - 3);
  addLog("Оплачены складские сборы: 3 монеты.");
  render();
}

function render() {
  const event = events[state.eventIndex];
  document.getElementById("coins").textContent = state.coins;
  document.getElementById("day").textContent = state.day;
  document.getElementById("reputation").textContent = state.reputation;
  document.getElementById("storage").textContent = `${inventoryTotal()}/${state.storageLimit}`;
  document.getElementById("eventName").textContent = event.name;
  document.getElementById("eventEffect").textContent = event.effect;

  renderTicker();
  renderProduction();
  renderInventory();
  renderMarket();
  renderCaravans();
  renderGuild();
  renderLog();
  saveState();
}

function renderTicker() {
  document.getElementById("ticker").innerHTML = Object.keys(resources).map((id) => {
    const price = priceOf(id);
    const diff = price - resources[id].base;
    const cls = diff >= 0 ? "positive" : "negative";
    const sign = diff >= 0 ? "+" : "";
    return `<div class="ticker-item"><strong>${resources[id].name}</strong> <span class="${cls}">${price} (${sign}${diff})</span></div>`;
  }).join("");
}

function renderProduction() {
  document.getElementById("productionGrid").innerHTML = workshops.map((workshop) => `
    <article class="card">
      <h3>${workshop.title}</h3>
      <p class="recipe">${workshop.text}</p>
      <p class="recipe">Затраты: ${formatBundle(workshop.cost)}</p>
      <div class="card-row">
        <span class="positive">Выход: ${formatBundle(workshop.result)}</span>
        <button class="icon-button" type="button" data-produce="${workshop.id}">Сделать</button>
      </div>
    </article>
  `).join("");
}

function renderInventory() {
  document.getElementById("inventory").innerHTML = Object.entries(resources).map(([id, resource]) => `
    <div class="item">
      <span>${resource.name}</span>
      <strong>${state.inventory[id]}</strong>
    </div>
  `).join("");
}

function renderMarket() {
  document.getElementById("marketGrid").innerHTML = Object.entries(resources).map(([id, resource]) => {
    const price = priceOf(id);
    return `
      <article class="card">
        <h3>${resource.name}</h3>
        <p class="recipe">Рыночная цена: <span class="price">${price}</span>. Покупка у игроков дороже на 15%.</p>
        <div class="card-row">
          <button class="icon-button" type="button" data-buy="${id}">Купить 5</button>
          <button class="primary-button" type="button" data-sell="${id}">Продать 5</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderCaravans() {
  document.getElementById("caravanGrid").innerHTML = caravans.map((route, index) => {
    const income = Math.round(priceOf(route.item) * route.qty * route.bonus) - route.cost;
    return `
      <article class="card">
        <h3>${route.city}</h3>
        <p class="recipe">Нужно: ${resources[route.item].name}: ${route.qty}. Пошлина: ${route.cost} монет.</p>
        <div class="card-row">
          <span class="${income >= 0 ? "positive" : "negative"}">Прогноз: ${income}</span>
          <button class="primary-button" type="button" data-caravan="${index}">Отправить</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderGuild() {
  const goal = guildGoals[state.guildIndex];
  const pct = Math.min(100, Math.round((state.guildProgress / goal.need) * 100));
  document.getElementById("guildName").textContent = "Проект гильдии";
  document.getElementById("guildGoal").textContent = `${goal.name}: ${resources[goal.item].name} ${state.guildProgress}/${goal.need}`;
  document.getElementById("guildProgress").style.width = `${pct}%`;
  document.getElementById("guildReward").textContent = `Награда: ${goal.reward} монет и ${goal.rep} репутации.`;
}

function renderLog() {
  document.getElementById("log").innerHTML = state.log.map((entry) => `<div class="log-entry">${entry}</div>`).join("");
}

document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-tab]");
  if (tab) {
    document.querySelectorAll(".tab, .tab-page").forEach((el) => el.classList.remove("is-active"));
    tab.classList.add("is-active");
    document.getElementById(tab.dataset.tab).classList.add("is-active");
  }

  const produceId = event.target.dataset.produce;
  if (produceId) produce(workshops.find((workshop) => workshop.id === produceId));

  const sellId = event.target.dataset.sell;
  if (sellId) sell(sellId, 5);

  const buyId = event.target.dataset.buy;
  if (buyId) buy(buyId, 5);

  const caravanId = event.target.dataset.caravan;
  if (caravanId) sendCaravan(caravans[Number(caravanId)]);
});

document.getElementById("nextDay").addEventListener("click", nextDay);
document.getElementById("refreshMarket").addEventListener("click", () => {
  state.priceSeed = (state.priceSeed + 5) % 23;
  addLog("Торговцы обновили заявки на рынке.");
  render();
});
document.getElementById("contributeGuild").addEventListener("click", contributeGuild);

render();
