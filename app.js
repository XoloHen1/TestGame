const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const resourceIcons = {
  wood: "🌲",
  ore: "⛏️",
  grain: "🌾",
  herbs: "🌿",
  wool: "🧶",
  coal: "⬛",
  salt: "🧂",
  stone: "🪨",
  planks: "🪵",
  ingot: "🔩",
  flour: "🥣",
  cloth: "🧵",
  extract: "🧪",
  brick: "🧱",
  tools: "🛠️",
  bread: "🥖",
  clothes: "👕",
  medicine: "💊",
  furniture: "🪑",
  wagons: "🛞",
  supplies: "📦"
};

const resources = {
  wood: { name: "Древесина", base: 5, tier: "Сырьё" },
  ore: { name: "Руда", base: 8, tier: "Сырьё" },
  grain: { name: "Зерно", base: 4, tier: "Сырьё" },
  herbs: { name: "Травы", base: 7, tier: "Сырьё" },
  wool: { name: "Шерсть", base: 6, tier: "Сырьё" },
  coal: { name: "Уголь", base: 7, tier: "Сырьё" },
  salt: { name: "Соль", base: 5, tier: "Сырьё" },
  stone: { name: "Камень", base: 4, tier: "Сырьё" },
  planks: { name: "Доски", base: 14, tier: "Материал" },
  ingot: { name: "Слитки", base: 22, tier: "Материал" },
  flour: { name: "Мука", base: 10, tier: "Материал" },
  cloth: { name: "Ткань", base: 18, tier: "Материал" },
  extract: { name: "Экстракт", base: 24, tier: "Материал" },
  brick: { name: "Кирпич", base: 13, tier: "Материал" },
  tools: { name: "Инструменты", base: 42, tier: "Товар" },
  bread: { name: "Хлеб", base: 24, tier: "Товар" },
  clothes: { name: "Одежда", base: 38, tier: "Товар" },
  medicine: { name: "Лекарства", base: 58, tier: "Товар" },
  furniture: { name: "Мебель", base: 50, tier: "Товар" },
  wagons: { name: "Повозки", base: 95, tier: "Ценный товар" },
  supplies: { name: "Припасы", base: 116, tier: "Ценный товар" }
};

const cityDefs = {
  ridge: {
    name: "Шахтёрский хребет",
    tax: 0.08,
    distance: 1,
    demand: { ore: 0.72, coal: 0.78, stone: 0.74, wood: 1.3, bread: 1.36, tools: 1.2, medicine: 1.28 },
    consumption: { bread: 6, tools: 2, wood: 4, medicine: 1 },
    stock: { ore: 150, coal: 130, stone: 160, wood: 34, bread: 30, tools: 18, medicine: 10 }
  },
  forest: {
    name: "Лесные земли",
    tax: 0.06,
    distance: 1,
    demand: { wood: 0.7, herbs: 0.75, wool: 0.9, ore: 1.28, tools: 1.22, salt: 1.24, ingot: 1.16 },
    consumption: { tools: 2, salt: 3, ingot: 1, bread: 3 },
    stock: { wood: 160, herbs: 120, wool: 80, ore: 25, tools: 16, salt: 20 }
  },
  capital: {
    name: "Столица",
    tax: 0.12,
    distance: 2,
    demand: { bread: 1.42, clothes: 1.48, furniture: 1.5, medicine: 1.38, supplies: 1.55, wagons: 1.25 },
    consumption: { bread: 9, clothes: 4, furniture: 2, medicine: 3, supplies: 1 },
    stock: { bread: 45, clothes: 22, furniture: 14, medicine: 20, supplies: 8, grain: 38 }
  },
  port: {
    name: "Порт",
    tax: 0.1,
    distance: 2,
    demand: { salt: 0.68, grain: 1.16, planks: 1.28, cloth: 1.22, wagons: 1.32, flour: 1.18 },
    consumption: { planks: 4, cloth: 2, grain: 4, wagons: 1 },
    stock: { salt: 150, grain: 32, planks: 26, cloth: 18, wagons: 5, flour: 16 }
  },
  oasis: {
    name: "Оазис",
    tax: 0.09,
    distance: 3,
    demand: { herbs: 0.82, extract: 1.34, medicine: 1.5, bread: 1.55, wood: 1.62, clothes: 1.22 },
    consumption: { bread: 5, wood: 5, medicine: 2, clothes: 2 },
    stock: { herbs: 100, extract: 20, medicine: 12, bread: 18, wood: 14, clothes: 14 }
  }
};

const workshops = [
  { id: "forestCamp", title: "Лесная артель", type: "Сырьё", cost: {}, result: { wood: 11 }, shifts: 1, text: "Древесина нужна почти всем городам и повозкам." },
  { id: "mine", title: "Рудник", type: "Сырьё", cost: {}, result: { ore: 7, stone: 4 }, shifts: 1, text: "Даёт руду и камень для тяжёлой промышленности." },
  { id: "coalPit", title: "Угольная яма", type: "Сырьё", cost: {}, result: { coal: 8 }, shifts: 1, text: "Уголь нужен для слитков и кирпича." },
  { id: "farm", title: "Ферма", type: "Сырьё", cost: {}, result: { grain: 12, wool: 4 }, shifts: 1, text: "Пища и шерсть для городского спроса." },
  { id: "saltGarden", title: "Соляные пруды", type: "Сырьё", cost: {}, result: { salt: 8 }, shifts: 1, text: "Соль дешева в порту и дорога в глубине карты." },
  { id: "herbalist", title: "Травник", type: "Сырьё", cost: {}, result: { herbs: 8 }, shifts: 1, text: "Основа экстрактов и лекарств." },
  { id: "sawmill", title: "Лесопилка", type: "Материал", cost: { wood: 8 }, result: { planks: 5 }, shifts: 1, text: "Повышает ценность древесины." },
  { id: "smelter", title: "Плавильня", type: "Материал", cost: { ore: 6, coal: 3 }, result: { ingot: 3 }, shifts: 1, text: "Слитки открывают инструменты и припасы." },
  { id: "mill", title: "Мельница", type: "Материал", cost: { grain: 8 }, result: { flour: 6 }, shifts: 1, text: "Мука компактнее зерна и нужна хлебу." },
  { id: "loom", title: "Ткацкая", type: "Материал", cost: { wool: 5 }, result: { cloth: 3 }, shifts: 1, text: "Ткань покупают порт, столица и оазис." },
  { id: "extractor", title: "Алхимическая ступа", type: "Материал", cost: { herbs: 5, salt: 2 }, result: { extract: 2 }, shifts: 1, text: "Экстракт даёт высокую маржу в лекарствах." },
  { id: "kiln", title: "Печь кирпича", type: "Материал", cost: { stone: 7, coal: 2 }, result: { brick: 5 }, shifts: 1, text: "Кирпич часто нужен гильдейским стройкам." },
  { id: "forge", title: "Кузница", type: "Товар", cost: { ingot: 2, planks: 1 }, result: { tools: 2 }, shifts: 2, text: "Инструменты поддерживают всю экономику." },
  { id: "bakery", title: "Пекарня", type: "Товар", cost: { flour: 4, wood: 1 }, result: { bread: 5 }, shifts: 1, text: "Хлеб постоянно потребляется городами." },
  { id: "tailor", title: "Портная", type: "Товар", cost: { cloth: 2, extract: 1 }, result: { clothes: 2 }, shifts: 2, text: "Одежда выгодна в столице и оазисе." },
  { id: "apothecary", title: "Аптека", type: "Товар", cost: { extract: 2, salt: 2 }, result: { medicine: 2 }, shifts: 2, text: "Лекарства растут в цене при кризисах." },
  { id: "carpenter", title: "Столярная", type: "Товар", cost: { planks: 3, cloth: 1 }, result: { furniture: 2 }, shifts: 2, text: "Мебель дорогая, но съедает материалы." },
  { id: "wagonWorks", title: "Повозочная", type: "Ценный товар", cost: { planks: 6, tools: 2, cloth: 2 }, result: { wagons: 1 }, shifts: 3, text: "Повозки дают крупную прибыль в порту." },
  { id: "quartermaster", title: "Склад припасов", type: "Ценный товар", cost: { tools: 2, bread: 5, medicine: 1 }, result: { supplies: 1 }, shifts: 3, text: "Припасы резко дорожают во время войны." }
];

const events = [
  { name: "Фестиваль в столице", effect: "Одежда, хлеб и мебель дорожают", mod: { bread: 1.28, clothes: 1.45, furniture: 1.38 }, consumption: { capital: { bread: 3, clothes: 2, furniture: 1 } } },
  { name: "Засуха", effect: "Зерно и хлеб в дефиците", mod: { grain: 1.55, flour: 1.35, bread: 1.48 }, production: { grain: 0.72 } },
  { name: "Военный заказ", effect: "Инструменты, лекарства и припасы растут", mod: { tools: 1.32, medicine: 1.35, supplies: 1.6, ingot: 1.2 }, risk: 1.12 },
  { name: "Обвал шахты", effect: "Руда и уголь дорожают", mod: { ore: 1.5, coal: 1.38, ingot: 1.22, tools: 1.14 }, production: { ore: 0.75, coal: 0.85 } },
  { name: "Морской путь", effect: "Соль дешевеет, порт снижает пошлины", mod: { salt: 0.72, cloth: 0.9 }, tax: { port: 0.75 } }
];

const contractsPool = [
  { city: "capital", item: "bread", qty: 15, premium: 1.35, rep: 3 },
  { city: "capital", item: "clothes", qty: 7, premium: 1.42, rep: 4 },
  { city: "ridge", item: "tools", qty: 6, premium: 1.34, rep: 3 },
  { city: "ridge", item: "medicine", qty: 5, premium: 1.45, rep: 4 },
  { city: "port", item: "planks", qty: 12, premium: 1.28, rep: 3 },
  { city: "port", item: "wagons", qty: 2, premium: 1.55, rep: 5 },
  { city: "oasis", item: "wood", qty: 18, premium: 1.38, rep: 3 },
  { city: "oasis", item: "medicine", qty: 6, premium: 1.48, rep: 5 },
  { city: "forest", item: "salt", qty: 12, premium: 1.32, rep: 3 },
  { city: "forest", item: "ingot", qty: 7, premium: 1.3, rep: 3 }
];

const guildGoals = [
  { name: "Торговый двор", need: { planks: 80, tools: 30, brick: 90 }, reward: 620, rep: 18, perk: "+10 к складу" },
  { name: "Караван-сарай", need: { wagons: 5, cloth: 35, furniture: 18 }, reward: 780, rep: 24, perk: "+1 смена в день" },
  { name: "Дом лекарей", need: { medicine: 30, extract: 28, bread: 70 }, reward: 920, rep: 28, perk: "+15 к складу" },
  { name: "Биржевая палата", need: { supplies: 8, tools: 45, brick: 110 }, reward: 1100, rep: 34, perk: "+2 репутации за контракт" }
];

const initialInventory = Object.fromEntries(Object.keys(resources).map((id) => [id, 0]));
Object.assign(initialInventory, { wood: 18, ore: 12, grain: 18, herbs: 8, wool: 6, coal: 8, salt: 6, stone: 10 });

const initialState = {
  version: 2,
  day: 1,
  coins: 340,
  reputation: 0,
  storageLimit: 170,
  energyLimit: 7,
  energy: 7,
  marketCity: "capital",
  inventory: initialInventory,
  cities: makeInitialCities(),
  eventIndex: 0,
  nextEventIndex: 1,
  priceSeed: 4,
  guildIndex: 0,
  guildProgress: {},
  activeCaravans: [],
  contracts: [],
  log: ["Компания получила лицензию на торговлю между городами."]
};

let state = loadState();
normalizeState();
ensureContracts();

function makeInitialCities() {
  const cities = {};
  Object.entries(cityDefs).forEach(([cityId, city]) => {
    cities[cityId] = { stock: {} };
    Object.keys(resources).forEach((itemId) => {
      const baseStock = city.stock[itemId] ?? Math.round(45 / (resources[itemId].base / 10 + 1));
      cities[cityId].stock[itemId] = baseStock;
    });
  });
  return cities;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("karavanika-state"));
    if (!saved || saved.version !== 2) return clone(initialState);
    return {
      ...clone(initialState),
      ...saved,
      inventory: { ...initialInventory, ...saved.inventory },
      cities: mergeCities(saved.cities)
    };
  } catch {
    return clone(initialState);
  }
}

function normalizeState() {
  state.inventory = { ...initialInventory, ...(state.inventory || {}) };
  state.cities = mergeCities(state.cities);
  state.contracts = Array.isArray(state.contracts) ? state.contracts : [];
  state.activeCaravans = Array.isArray(state.activeCaravans) ? state.activeCaravans : [];
  state.guildProgress = state.guildProgress && typeof state.guildProgress === "object" ? state.guildProgress : {};
  state.marketCity = cityDefs[state.marketCity] ? state.marketCity : "capital";
  state.eventIndex = events[state.eventIndex] ? state.eventIndex : 0;
  state.nextEventIndex = events[state.nextEventIndex] ? state.nextEventIndex : 1;
  state.energyLimit = Number.isFinite(state.energyLimit) ? state.energyLimit : initialState.energyLimit;
  state.energy = Number.isFinite(state.energy) ? Math.min(state.energy, state.energyLimit) : state.energyLimit;
  state.storageLimit = Number.isFinite(state.storageLimit) ? state.storageLimit : initialState.storageLimit;
  state.log = Array.isArray(state.log) ? state.log : [...initialState.log];
}

function mergeCities(savedCities = {}) {
  const cities = makeInitialCities();
  Object.keys(cities).forEach((cityId) => {
    cities[cityId].stock = { ...cities[cityId].stock, ...(savedCities[cityId]?.stock || {}) };
  });
  return cities;
}

function saveState() {
  localStorage.setItem("karavanika-state", JSON.stringify(state));
}

function currentEvent() {
  return events[state.eventIndex];
}

function cityTax(cityId) {
  const city = cityDefs[cityId];
  return city.tax * (currentEvent().tax?.[cityId] || 1);
}

function stockNorm(itemId) {
  return Math.max(24, Math.round(190 / Math.sqrt(resources[itemId].base)));
}

function scarcity(cityId, itemId) {
  const stock = state.cities[cityId].stock[itemId] ?? 0;
  const ratio = stockNorm(itemId) / Math.max(1, stock);
  return clamp(0.68, 1.95, 0.55 + ratio * 0.45);
}

function priceOf(cityId, itemId, mode = "sell") {
  const city = cityDefs[cityId];
  const demand = city.demand[itemId] || 1;
  const wave = 0.94 + ((Math.sin((state.day * 1.9 + state.priceSeed + itemId.length + cityId.length) * 0.93) + 1) / 2) * 0.16;
  const taxed = mode === "buy" ? 1 + cityTax(cityId) + 0.08 : Math.max(0.55, 1 - cityTax(cityId));
  return Math.max(1, Math.round(resources[itemId].base * demand * scarcity(cityId, itemId) * (currentEvent().mod[itemId] || 1) * wave * taxed));
}

function clamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

function inventoryTotal() {
  return Object.values(state.inventory).reduce((sum, qty) => sum + qty, 0);
}

function canFit(amount) {
  return inventoryTotal() + amount <= state.storageLimit;
}

function bundleQty(bundle) {
  return Object.values(bundle).reduce((sum, qty) => sum + qty, 0);
}

function formatBundle(bundle) {
  const entries = Object.entries(bundle || {});
  if (!entries.length) return "нет";
  return entries.map(([id, qty]) => `${icon(id)} ${resources[id].name} ${qty}`).join(", ");
}

function icon(itemId) {
  return resourceIcons[itemId] || "◇";
}

function hasItems(bundle) {
  return Object.entries(bundle || {}).every(([id, qty]) => state.inventory[id] >= qty);
}

function mutateInventory(bundle, sign) {
  Object.entries(bundle || {}).forEach(([id, qty]) => {
    state.inventory[id] += qty * sign;
  });
}

function addLog(text) {
  state.log.unshift(`День ${state.day}: ${text}`);
  state.log = state.log.slice(0, 35);
}

function toast(text, type = "success") {
  const el = document.getElementById("toast");
  el.textContent = text;
  el.dataset.type = type;
  el.classList.add("is-visible");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => el.classList.remove("is-visible"), 2300);
  tg?.HapticFeedback?.notificationOccurred(type === "error" ? "error" : "success");
}

function produce(workshopId) {
  const workshop = workshops.find((item) => item.id === workshopId);
  if (!workshop) return;
  if (state.energy < workshop.shifts) return toast("Не хватает рабочих смен. Перейди к следующему дню.", "error");
  const eventProduction = currentEvent().production || {};
  const result = Object.fromEntries(Object.entries(workshop.result).map(([id, qty]) => [id, Math.max(1, Math.round(qty * (eventProduction[id] || 1)))]));
  const output = bundleQty(result);
  if (!hasItems(workshop.cost)) return toast("Недостаточно ресурсов для цеха.", "error");
  if (!canFit(output - bundleQty(workshop.cost))) return toast("На складе не хватает места.", "error");

  mutateInventory(workshop.cost, -1);
  mutateInventory(result, 1);
  state.energy -= workshop.shifts;
  addLog(`${workshop.title}: произведено ${formatBundle(result)}.`);
  render();
}

function sell(itemId, qty) {
  const cityId = state.marketCity;
  qty = Math.min(qty, state.inventory[itemId]);
  if (qty <= 0) return toast("На складе нет такого товара.", "error");
  const income = priceOf(cityId, itemId, "sell") * qty;
  state.inventory[itemId] -= qty;
  state.cities[cityId].stock[itemId] += qty;
  state.coins += income;
  addLog(`Продано в ${cityDefs[cityId].name}: ${resources[itemId].name} ${qty} за ${income}.`);
  render();
}

function buy(itemId, qty) {
  const cityId = state.marketCity;
  qty = Math.min(qty, state.cities[cityId].stock[itemId]);
  if (qty <= 0) return toast("В городе нет товара.", "error");
  if (!canFit(qty)) return toast("На складе не хватает места.", "error");
  const cost = priceOf(cityId, itemId, "buy") * qty;
  if (state.coins < cost) return toast("Недостаточно монет.", "error");
  state.coins -= cost;
  state.inventory[itemId] += qty;
  state.cities[cityId].stock[itemId] -= qty;
  addLog(`Куплено в ${cityDefs[cityId].name}: ${resources[itemId].name} ${qty} за ${cost}.`);
  render();
}

function sendCaravan() {
  const from = document.getElementById("caravanFrom").value;
  const to = document.getElementById("caravanTo").value;
  const itemId = document.getElementById("caravanItem").value;
  const qty = Number(document.getElementById("caravanQty").value);
  const guard = document.getElementById("caravanGuard").checked;
  if (from === to) return toast("Выбери разные города.", "error");
  if (!Number.isFinite(qty) || qty <= 0) return toast("Укажи количество товара.", "error");
  if (state.inventory[itemId] < qty) return toast("Недостаточно товара на складе.", "error");
  const fee = caravanFee(from, to, qty, guard);
  if (state.coins < fee) return toast("Недостаточно монет на пошлину.", "error");

  state.inventory[itemId] -= qty;
  state.coins -= fee;
  state.activeCaravans.push({
    from,
    to,
    itemId,
    qty,
    guard,
    daysLeft: travelDays(from, to, guard),
    fee
  });
  addLog(`Караван отправлен: ${resources[itemId].name} ${qty} из ${cityDefs[from].name} в ${cityDefs[to].name}.`);
  render();
}

function travelDays(from, to, guard) {
  const distance = Math.abs(cityDefs[from].distance - cityDefs[to].distance) + 1;
  return guard ? distance + 1 : distance;
}

function caravanRisk(from, to, guard) {
  const base = 0.08 + Math.abs(cityDefs[from].distance - cityDefs[to].distance) * 0.04;
  return clamp(0.03, 0.34, base * (currentEvent().risk || 1) * (guard ? 0.42 : 1));
}

function caravanFee(from, to, qty, guard) {
  const distance = Math.abs(cityDefs[from].distance - cityDefs[to].distance) + 1;
  return Math.round(8 + qty * distance * 0.9 + (guard ? 24 : 0));
}

function finishCaravan(route) {
  const risk = caravanRisk(route.from, route.to, route.guard);
  const lost = Math.random() < risk ? Math.max(1, Math.ceil(route.qty * (route.guard ? 0.12 : 0.28))) : 0;
  const delivered = Math.max(0, route.qty - lost);
  const income = delivered * priceOf(route.to, route.itemId, "sell");
  state.cities[route.to].stock[route.itemId] += delivered;
  state.coins += income;
  state.reputation += delivered > 0 ? 1 : 0;
  addLog(`Караван прибыл в ${cityDefs[route.to].name}: продано ${delivered}, потери ${lost}, выручка ${income}.`);
}

function completeContract(index) {
  const contract = state.contracts[index];
  if (!contract) return;
  if (state.inventory[contract.item] < contract.qty) return toast("Недостаточно товара для контракта.", "error");
  const payout = contractPayout(contract);
  state.inventory[contract.item] -= contract.qty;
  state.cities[contract.city].stock[contract.item] += contract.qty;
  state.coins += payout;
  state.reputation += contract.rep + (state.guildIndex > 3 ? 2 : 0);
  addLog(`Контракт ${cityDefs[contract.city].name}: ${resources[contract.item].name} ${contract.qty}, выплата ${payout}.`);
  state.contracts.splice(index, 1);
  ensureContracts();
  render();
}

function contractPayout(contract) {
  return Math.round(priceOf(contract.city, contract.item, "sell") * contract.qty * contract.premium);
}

function ensureContracts(force = false) {
  if (force) state.contracts = [];
  while (state.contracts.length < 4) {
    const source = contractsPool[(state.day + state.priceSeed + state.contracts.length * 3) % contractsPool.length];
    state.contracts.push({ ...source, due: state.day + 4 + state.contracts.length });
  }
}

function contributeGuild() {
  const goal = guildGoals[state.guildIndex];
  const progress = state.guildProgress;
  const nextItem = Object.entries(goal.need).find(([id, need]) => (progress[id] || 0) < need);
  if (!nextItem) return;
  const [itemId, need] = nextItem;
  const left = need - (progress[itemId] || 0);
  const qty = Math.min(state.inventory[itemId], left, Math.max(1, Math.ceil(need * 0.2)));
  if (qty <= 0) return toast(`Нужен товар: ${resources[itemId].name}.`, "error");
  state.inventory[itemId] -= qty;
  progress[itemId] = (progress[itemId] || 0) + qty;
  addLog(`В гильдию внесено: ${resources[itemId].name} ${qty}.`);

  const done = Object.entries(goal.need).every(([id, needQty]) => (progress[id] || 0) >= needQty);
  if (done) {
    state.coins += goal.reward;
    state.reputation += goal.rep;
    if (goal.perk.includes("складу")) state.storageLimit += Number(goal.perk.match(/\d+/)?.[0] || 0);
    if (goal.perk.includes("смена")) state.energyLimit += 1;
    addLog(`Гильдия завершила "${goal.name}". Награда ${goal.reward}, эффект: ${goal.perk}.`);
    state.guildIndex = (state.guildIndex + 1) % guildGoals.length;
    state.guildProgress = {};
  }
  render();
}

function nextDay() {
  state.day += 1;
  state.energy = state.energyLimit;
  state.priceSeed = (state.priceSeed * 5 + state.day * 7) % 31;
  if (state.day % 4 === 0) {
    state.eventIndex = state.nextEventIndex;
    state.nextEventIndex = (state.nextEventIndex + 1) % events.length;
    addLog(`Новое событие: ${currentEvent().name}.`);
  }
  consumeCities();
  resolveCaravans();
  decayContracts();
  state.coins = Math.max(0, state.coins - storageRent());
  addLog(`Оплачены аренда склада и лицензии: ${storageRent()} монет.`);
  ensureContracts();
  render();
}

function storageRent() {
  return 4 + Math.floor(inventoryTotal() / 35);
}

function consumeCities() {
  Object.entries(cityDefs).forEach(([cityId, city]) => {
    const extra = currentEvent().consumption?.[cityId] || {};
    const items = new Set([...Object.keys(city.consumption), ...Object.keys(extra)]);
    items.forEach((itemId) => {
      const amount = (city.consumption[itemId] || 0) + (extra[itemId] || 0);
      state.cities[cityId].stock[itemId] = Math.max(0, state.cities[cityId].stock[itemId] - amount);
    });
  });
}

function resolveCaravans() {
  state.activeCaravans.forEach((route) => {
    route.daysLeft -= 1;
  });
  const arrived = state.activeCaravans.filter((route) => route.daysLeft <= 0);
  state.activeCaravans = state.activeCaravans.filter((route) => route.daysLeft > 0);
  arrived.forEach(finishCaravan);
}

function decayContracts() {
  const before = state.contracts.length;
  state.contracts = state.contracts.filter((contract) => contract.due >= state.day);
  if (state.contracts.length < before) addLog("Часть просроченных контрактов ушла с биржи.");
}

function render() {
  document.getElementById("coins").textContent = state.coins;
  document.getElementById("day").textContent = state.day;
  document.getElementById("energy").textContent = `${state.energy}/${state.energyLimit}`;
  document.getElementById("storage").textContent = `${inventoryTotal()}/${state.storageLimit}`;
  document.getElementById("reputation").textContent = state.reputation;
  document.getElementById("eventName").textContent = currentEvent().name;
  document.getElementById("eventEffect").textContent = `${currentEvent().effect}. Далее: ${events[state.nextEventIndex].name}`;

  renderMarketSelect();
  renderTicker();
  renderProduction();
  renderInventory();
  renderMarket();
  renderCities();
  renderCaravanBuilder();
  renderActiveCaravans();
  renderContracts();
  renderGuild();
  renderLog();
  saveState();
}

function renderMarketSelect() {
  const select = document.getElementById("marketCity");
  const html = Object.entries(cityDefs).map(([id, city]) => `<option value="${id}">${city.name}</option>`).join("");
  if (select.innerHTML !== html) select.innerHTML = html;
  select.value = state.marketCity;
}

function renderTicker() {
  const bestItems = Object.keys(resources).map((itemId) => {
    const best = Object.keys(cityDefs).reduce((top, cityId) => {
      const price = priceOf(cityId, itemId, "sell");
      return price > top.price ? { cityId, price } : top;
    }, { cityId: "capital", price: 0 });
    return { itemId, ...best };
  }).sort((a, b) => b.price - a.price).slice(0, 10);

  document.getElementById("ticker").innerHTML = bestItems.map(({ itemId, cityId, price }) => `
    <button class="ticker-item" type="button" data-pick-city="${cityId}">
      <strong><span class="res-icon">${icon(itemId)}</span>${resources[itemId].name}</strong>
      <span>${price} в ${cityDefs[cityId].name}</span>
    </button>
  `).join("");
}

function renderProduction() {
  document.getElementById("productionGrid").innerHTML = workshops.map((workshop) => {
    const result = Object.fromEntries(Object.entries(workshop.result).map(([id, qty]) => [id, Math.max(1, Math.round(qty * (currentEvent().production?.[id] || 1)))]));
    const locked = state.energy < workshop.shifts || !hasItems(workshop.cost);
    return `
      <article class="card production-card">
        <div class="card-title">
          <span class="badge">${workshop.type}</span>
          <strong>${workshop.title}</strong>
        </div>
        <p class="recipe">${workshop.text}</p>
        <dl class="mini-list">
          <div><dt>Затраты</dt><dd>${formatBundle(workshop.cost)}</dd></div>
          <div><dt>Выход</dt><dd>${formatBundle(result)}</dd></div>
          <div><dt>Смены</dt><dd>${workshop.shifts}</dd></div>
        </dl>
        <button class="${locked ? "icon-button" : "primary-button"} full" type="button" data-produce="${workshop.id}">Запустить</button>
      </article>
    `;
  }).join("");
}

function renderInventory() {
  document.getElementById("inventory").innerHTML = Object.entries(resources).map(([id, item]) => `
    <div class="item">
      <div class="item-icon">${icon(id)}</div>
      <span>${item.name}</span>
      <small>${item.tier}</small>
      <strong>${state.inventory[id]}</strong>
    </div>
  `).join("");
}

function renderMarket() {
  const cityId = state.marketCity;
  const city = cityDefs[cityId];
  document.getElementById("marketGrid").innerHTML = Object.entries(resources).map(([itemId, item]) => {
    const sellPrice = priceOf(cityId, itemId, "sell");
    const buyPrice = priceOf(cityId, itemId, "buy");
    const stock = state.cities[cityId].stock[itemId];
    const deficit = scarcity(cityId, itemId) > 1.12 ? "Дефицит" : scarcity(cityId, itemId) < 0.9 ? "Избыток" : "Баланс";
    return `
      <article class="card market-card">
        <div class="card-title">
          <strong><span class="res-icon">${icon(itemId)}</span>${item.name}</strong>
          <span class="badge">${deficit}</span>
        </div>
        <dl class="price-grid">
          <div><dt>Продажа</dt><dd class="positive">${sellPrice}</dd></div>
          <div><dt>Покупка</dt><dd>${buyPrice}</dd></div>
          <div><dt>Запас города</dt><dd>${stock}</dd></div>
          <div><dt>Налог</dt><dd>${Math.round(cityTax(cityId) * 100)}%</dd></div>
        </dl>
        <div class="button-row">
          <button class="icon-button" type="button" data-buy="${itemId}">Купить 5</button>
          <button class="primary-button" type="button" data-sell="${itemId}">Продать 5</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderCities() {
  document.getElementById("cityGrid").innerHTML = Object.entries(cityDefs).map(([cityId, city]) => {
    const shortages = Object.keys(resources)
      .map((itemId) => ({ itemId, scarcity: scarcity(cityId, itemId), price: priceOf(cityId, itemId, "sell") }))
      .sort((a, b) => b.scarcity - a.scarcity)
      .slice(0, 4);
    return `
      <article class="card city-card">
        <div class="card-title">
          <strong>${city.name}</strong>
          <span class="badge">Налог ${Math.round(cityTax(cityId) * 100)}%</span>
        </div>
        <p class="recipe">Потребление: ${formatBundle(city.consumption)}</p>
        <div class="shortage-list">
          ${shortages.map(({ itemId, price }) => `<button type="button" data-pick-city="${cityId}" class="shortage"><span><span class="res-icon">${icon(itemId)}</span>${resources[itemId].name}</span><strong>${price}</strong></button>`).join("")}
        </div>
      </article>
    `;
  }).join("");
}

function renderCaravanBuilder() {
  const cityOptions = Object.entries(cityDefs).map(([id, city]) => `<option value="${id}">${city.name}</option>`).join("");
  const itemOptions = Object.entries(resources).map(([id, item]) => `<option value="${id}">${icon(id)} ${item.name}</option>`).join("");
  document.getElementById("caravanBuilder").innerHTML = `
    <label>Откуда<select class="select" id="caravanFrom">${cityOptions}</select></label>
    <label>Куда<select class="select" id="caravanTo">${cityOptions}</select></label>
    <label>Товар<select class="select" id="caravanItem">${itemOptions}</select></label>
    <label>Количество<input class="input" id="caravanQty" min="1" max="40" value="10" type="number" /></label>
    <label class="check"><input id="caravanGuard" type="checkbox" /> Охрана каравана</label>
    <button class="primary-button full" type="button" data-send-caravan="true">Отправить</button>
  `;
  document.getElementById("caravanFrom").value = "forest";
  document.getElementById("caravanTo").value = state.marketCity;
}

function renderActiveCaravans() {
  const el = document.getElementById("activeCaravans");
  if (!state.activeCaravans.length) {
    el.innerHTML = `<div class="empty">Нет караванов в пути.</div>`;
    return;
  }
  el.innerHTML = state.activeCaravans.map((route) => `
    <article class="card compact">
      <strong><span class="res-icon">${icon(route.itemId)}</span>${resources[route.itemId].name} ${route.qty}</strong>
      <p class="recipe">${cityDefs[route.from].name} -> ${cityDefs[route.to].name}</p>
      <p class="subtle">Осталось дней: ${route.daysLeft}. Риск: ${Math.round(caravanRisk(route.from, route.to, route.guard) * 100)}%</p>
    </article>
  `).join("");
}

function renderContracts() {
  document.getElementById("contractGrid").innerHTML = state.contracts.map((contract, index) => `
    <article class="card contract-card">
      <div class="card-title">
        <strong>${cityDefs[contract.city].name}</strong>
        <span class="badge">до дня ${contract.due}</span>
      </div>
      <p class="recipe">Поставка: ${icon(contract.item)} ${resources[contract.item].name} ${contract.qty}. Премия: +${Math.round((contract.premium - 1) * 100)}%.</p>
      <dl class="price-grid">
        <div><dt>Выплата</dt><dd class="positive">${contractPayout(contract)}</dd></div>
        <div><dt>Репутация</dt><dd>${contract.rep}</dd></div>
      </dl>
      <button class="primary-button full" type="button" data-contract="${index}">Выполнить</button>
    </article>
  `).join("");
}

function renderGuild() {
  const goal = guildGoals[state.guildIndex];
  const progress = state.guildProgress;
  const required = Object.entries(goal.need);
  const done = required.reduce((sum, [id, need]) => sum + Math.min(need, progress[id] || 0), 0);
  const total = required.reduce((sum, [, need]) => sum + need, 0);
  document.getElementById("guildName").textContent = "Проект гильдии";
  document.getElementById("guildGoal").textContent = goal.name;
  document.getElementById("guildProgress").style.width = `${Math.round((done / total) * 100)}%`;
  document.getElementById("guildReward").textContent = `Нужно: ${required.map(([id, need]) => `${resources[id].name} ${progress[id] || 0}/${need}`).join(", ")}. Награда: ${goal.reward}, ${goal.rep} репутации, ${goal.perk}.`;
}

function renderLog() {
  document.getElementById("log").innerHTML = state.log.map((entry) => `<div class="log-entry">${entry}</div>`).join("");
}

document.addEventListener("click", (click) => {
  const tab = click.target.closest("[data-tab]");
  if (tab) {
    document.querySelectorAll(".tab, .tab-page").forEach((el) => el.classList.remove("is-active"));
    tab.classList.add("is-active");
    document.getElementById(tab.dataset.tab).classList.add("is-active");
  }

  const cityPick = click.target.closest("[data-pick-city]");
  if (cityPick) {
    state.marketCity = cityPick.dataset.pickCity;
    document.querySelectorAll(".tab, .tab-page").forEach((el) => el.classList.remove("is-active"));
    document.querySelector('[data-tab="market"]').classList.add("is-active");
    document.getElementById("market").classList.add("is-active");
    render();
  }

  if (click.target.dataset.produce) produce(click.target.dataset.produce);
  if (click.target.dataset.sell) sell(click.target.dataset.sell, 5);
  if (click.target.dataset.buy) buy(click.target.dataset.buy, 5);
  if (click.target.dataset.sendCaravan) sendCaravan();
  if (click.target.dataset.contract) completeContract(Number(click.target.dataset.contract));
});

document.getElementById("marketCity").addEventListener("change", (change) => {
  state.marketCity = change.target.value;
  render();
});
document.getElementById("nextDay").addEventListener("click", nextDay);
document.getElementById("refreshContracts").addEventListener("click", () => {
  state.priceSeed = (state.priceSeed + 9) % 37;
  ensureContracts(true);
  addLog("Биржа обновила контракты торговых домов.");
  render();
});
document.getElementById("contributeGuild").addEventListener("click", contributeGuild);

render();
