const STORAGE_KEY = "tiny-town-adventure-v1";
const WS_URL_STORAGE_KEY = "tiny-town-ws-url";
const VOICE_ENABLED_KEY = "tiny-town-voice-enabled";
const WORLD_W = 16;
const WORLD_H = 10;
const TILE = 48;
let WS_URL = window.__GAME_WS_URL__ || "";

const mapRows = [
  "################",
  "#......##.......#",
  "#.##...##..##...#",
  "#....S..##..A...#",
  "#.##....##..##..#",
  "#....##.......#.#",
  "#.####...###...##",
  "#......Q..###....",
  "#.##...Q..##..A.#",
  "################"
];

const QUESTS = [
  {
    id: "q-breakfast",
    name: "早餐小幫手",
    desc: "今天忘了很多同學都要參加晨會，請選出出門前最重要的一件事。",
    x: 2,
    y: 1,
    difficulty: "easy",
    type: "single",
    prompt: "離開家前，下列哪個步驟最適合先做？",
    options: ["先吃完整晚餐", "先填寫報到卡、帶上作業與筆", "先把玩具收進床下", "先躺在床上休息"],
    answer: 1,
    reward: { coins: 20, xp: 10 },
    rewardText: "你學會了整理出門流程，獲得 20 幣與 10 XP。"
  },
  {
    id: "q-trash",
    name: "快樂分類隊",
    desc: "把廚餘、可回收、一般垃圾分清楚。",
    x: 14,
    y: 1,
    difficulty: "easy",
    prompt: "哪個放進「可回收」？",
    options: ["香蕉皮", "牛奶紙盒", "口香糖", "餐紙袋"],
    answer: 1,
    reward: { coins: 15, xp: 8 },
    rewardText: "垃圾分類成功，獲得獎勵 15 幣。"
  },
  {
    id: "q-weather",
    name: "晴天行囊",
    desc: "外出前看天氣，該帶什麼?",
    x: 9,
    y: 2,
    difficulty: "easy",
    requires: ["raincoat"],
    prompt: "下雨天出門，哪件物品最重要？",
    options: ["雨衣", "滑板", "泳圈", "羽毛球拍"],
    answer: 0,
    reward: { coins: 12, xp: 7 },
    consume: ["raincoat"],
    rewardText: "任務完成，雨天也不怕，獲得 12 幣與 7 XP。"
  },
  {
    id: "q-map",
    name: "搭公車不迷路",
    desc: "搭乘路線要學會看站名與方向。",
    x: 1,
    y: 4,
    difficulty: "medium",
    prompt: "你要去「圖書館」，公車顯示在 2 號線，第一站已經是你要換車點。你應該怎麼做？",
    options: ["直接站起來下車試試", "等到顯示停靠站到「公園路口」再換 5 路", "一路坐到路線終點再折返", "問每個人都會知道"],
    answer: 1,
    reward: { coins: 25, xp: 16 },
    requires: ["route-card"],
    rewardText: "你利用站牌資訊順利抵達，獎勵 25 幣與 16 XP。"
  },
  {
    id: "q-kitchen",
    name: "不浪費的晚餐",
    desc: "冰箱中的食物要先檢查到期日再放進保鮮箱。",
    x: 11,
    y: 4,
    difficulty: "medium",
    prompt: "下列哪樣最先處理？",
    options: ["先洗衣服再煮飯", "先看今天前幾天到期的食材", "先上網買新食物", "把所有食物倒掉"],
    answer: 1,
    reward: { coins: 28, xp: 16 },
    rewardText: "你知道先看保鮮期限，避免浪費，獲得 28 幣與 16 XP。"
  },
  {
    id: "q-assembly",
    name: "修好玩具車輪",
    desc: "要修理玩具需要對的工具與步驟。",
    x: 14,
    y: 6,
    difficulty: "medium",
    requires: ["toolbox"],
    prompt: "修理玩具車最需要先做什麼？",
    options: ["先用拳頭硬摳", "先卸下鬆掉螺絲再換上新軸", "先把零件丟掉", "先塞進水裡沖掉"],
    answer: 1,
    reward: { coins: 30, xp: 20 },
    consume: ["toolbox"],
    rewardText: "你用工具箱完成修理，獎勵 30 幣與 20 XP。"
  },
  {
    id: "q-nightwalk",
    name: "社區安全巡邏",
    desc: "黑夜行走需要注意安全。",
    x: 2,
    y: 7,
    difficulty: "hard",
    requires: ["flashlight"],
    prompt: "夜晚外出時，遇到陌生人要求你帶路，最安全的回應是？",
    options: ["立刻跟著去", "先大聲求助並向附近大人或巡邏員報告", "靜悄悄跟去", "把手機關閉"],
    answer: 1,
    reward: { coins: 36, xp: 30 },
    rewardText: "你懂得向大人求助，獲得 36 幣與 30 XP。"
  },
  {
    id: "q-borrow",
    name: "節電小小調查",
    desc: "教你找出不用時要關掉的電器，省下家裡電費。",
    x: 9,
    y: 8,
    difficulty: "hard",
    prompt: "要節電時，最該先關掉下列哪組？",
    options: ["放在冰箱裡的豆漿 + 冰箱溫度", "忘記熄火的電暖氣 + 不用的電視", "牆上掛歷 + 鞋盒", "窗簾與筆記本"],
    answer: 1,
    reward: { coins: 40, xp: 34 },
    rewardText: "你幫助大家發現節電重點，獲得 40 幣與 34 XP。"
  },
  {
    id: "q-errands",
    name: "購物任務：不亂買",
    desc: "有了清單比亂買還省錢。",
    x: 12,
    y: 8,
    difficulty: "hard",
    requires: ["shopping-list"],
    prompt: "媽媽給你的採買清單上有 3 項，最省時做法？",
    options: ["看到好看就都買", "按清單逐項比對，先找同一區域再結帳", "只買便宜的，忽略清單", "先買玩具再回家補齊"],
    answer: 1,
    reward: { coins: 42, xp: 40 },
    consume: ["shopping-list"],
    rewardText: "你完成有效率採買，獲得 42 幣與 40 XP。"
  }
];

const SHOP_ITEMS = [
  {
    id: "raincoat",
    name: "黃色雨衣",
    category: "衣服",
    price: 18,
    desc: "在雨天任務中很實用，任務 q-weather 需要。",
    type: "wearable"
  },
  {
    id: "route-card",
    name: "交通路線卡",
    category: "配件",
    price: 22,
    desc: "搭乘路線與轉乘提醒卡，任務 q-map 需要。",
    type: "tool"
  },
  {
    id: "toolbox",
    name: "小工具箱",
    category: "道具",
    price: 28,
    desc: "含起子與螺絲，任務 q-assembly 需要。",
    type: "tool"
  },
  {
    id: "flashlight",
    name: "發光手電筒",
    category: "道具",
    price: 35,
    desc: "夜晚巡邏任務 q-nightwalk 需要。",
    type: "tool"
  },
  {
    id: "shopping-list",
    name: "採買清單本",
    category: "道具",
    price: 16,
    desc: "任務 q-errands 的必要工具。",
    type: "tool"
  },
  {
    id: "badge",
    name: "探索徽章",
    category: "配件",
    price: 12,
    desc: "完成任務後給自己戴上的證明，沒有限制。",
    type: "wearable"
  }
];

const elements = {
  canvas: document.getElementById("gameCanvas"),
  ctx: null,
  storyText: document.getElementById("storyText"),
  coinText: document.getElementById("coinText"),
  xpText: document.getElementById("xpText"),
  playerName: document.getElementById("playerName"),
  questList: document.getElementById("questList"),
  inventory: document.getElementById("inventory"),
  shop: document.getElementById("shop"),
  chatLog: document.getElementById("chatLog"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  roomInput: document.getElementById("roomInput"),
  wsUrlInput: document.getElementById("wsUrlInput"),
  modeSelect: document.getElementById("modeSelect"),
  onlineHint: document.getElementById("onlineHint"),
  saveWsBtn: document.getElementById("saveWsBtn"),
  resetBtn: document.getElementById("resetBtn"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayBody: document.getElementById("overlayBody"),
  overlayClose: document.getElementById("overlayClose"),
  overlayOptions: document.getElementById("questOptions"),
  nameModal: document.getElementById("nameModal"),
  nameInput: document.getElementById("nameInput"),
  startBtn: document.getElementById("startBtn"),
  voiceToggle: document.getElementById("voiceToggle"),
  testVoiceBtn: document.getElementById("testVoiceBtn"),
  questVoiceControls: document.getElementById("questVoiceControls"),
  replayVoiceBtn: document.getElementById("replayVoiceBtn"),
  stopVoiceBtn: document.getElementById("stopVoiceBtn")
};

elements.ctx = elements.canvas.getContext("2d");
elements.ctx.imageSmoothingEnabled = false;

let state = {
  player: {
    id: crypto.randomUUID(),
    name: "",
    x: 2,
    y: 2,
    color: "#2d8bf3",
    hp: 3
  },
  xp: 0,
  coins: 40,
  completed: [],
  storyStep: 0,
  inventory: {},
  messages: [],
  multiplayer: false
};

const remotePlayers = new Map();
let ws = null;
let wsConnected = false;
let canMove = true;
let lastMoveAt = 0;
const moveDelay = 110;
let speechEnabled = true;
let hasInteracted = false;
let currentQuestSpeechText = "";

function isSpeechAvailable() {
  return typeof speechSynthesis !== "undefined" && typeof speechSynthesis.speak === "function";
}

function getStorySpeechText(stateText) {
  return `任務訊息：${stateText}`;
}

function setSpeechEnabled(next) {
  speechEnabled = Boolean(next);
  localStorage.setItem(VOICE_ENABLED_KEY, speechEnabled ? "1" : "0");
  if (!speechEnabled) stopSpeech();
}

function stopSpeech() {
  if (isSpeechAvailable()) {
    speechSynthesis.cancel();
  }
}

function normalizeSpeakText(value) {
  return String(value || "").replace(/\s+/g, " ").replace(/[_*#]/g, " ").trim();
}

function safeSpeak(text, force = false) {
  if (!force && !speechEnabled) return;
  if (!hasInteracted && !force) return;
  const clean = normalizeSpeakText(text);
  if (!clean || !isSpeechAvailable()) return;

  stopSpeech();
  currentQuestSpeechText = clean;
  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = "zh-TW";
  utter.rate = 1;
  utter.pitch = 1;
  utter.volume = 1;
  speechSynthesis.speak(utter);
}

function speakQuestText(quest) {
  const prompt = `任務名稱：${quest.name}，難度${quest.difficulty}。${quest.prompt}。選項如下：`;
  const options = (quest.options || []).map((opt, idx) => `第${idx + 1}題，${opt}`).join("。");
  safeSpeak(`${prompt} ${options}`);
}

function speakChoiceText(opt, idx) {
  safeSpeak(`第${idx + 1}個選項：${opt}`);
}

function setQuestSpeechText(value) {
  currentQuestSpeechText = normalizeSpeakText(value);
  if (elements.replayVoiceBtn) {
    elements.replayVoiceBtn.disabled = currentQuestSpeechText.length === 0;
  }
}

function syncWsUrl() {
  const queryUrl = new URLSearchParams(window.location.search).get("ws");
  if (queryUrl) {
    WS_URL = resolveWsUrl(queryUrl);
    if (WS_URL) {
      localStorage.setItem(WS_URL_STORAGE_KEY, WS_URL);
    }
  } else if (!WS_URL && localStorage.getItem(WS_URL_STORAGE_KEY)) {
    WS_URL = localStorage.getItem(WS_URL_STORAGE_KEY).trim();
  }
  if (!WS_URL && elements.wsUrlInput) {
    elements.wsUrlInput.value = "";
  } else if (elements.wsUrlInput) {
    elements.wsUrlInput.value = WS_URL;
  }
}

function resolveWsUrl(base) {
  if (!base) return "";
  return base.trim().replace(/^https:\/\//, "wss://").replace(/^http:\/\//, "ws://").replace(/\/$/, "");
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return state;
  try {
    const parsed = JSON.parse(saved);
    return {
      ...state,
      ...parsed,
      player: { ...state.player, ...(parsed.player || {}) }
    };
  } catch {
    return state;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function tileAt(x, y) {
  return mapRows[y]?.[x] || "#";
}

function isWalkable(x, y) {
  if (x < 0 || y < 0 || x >= WORLD_W || y >= WORLD_H) return false;
  const t = tileAt(x, y);
  return t !== "#";
}

function isQuestAt(x, y) {
  return QUESTS.find((q) => q.x === x && q.y === y);
}

function hasItem(itemId) {
  return state.inventory[itemId] > 0;
}

function completeCount() {
  return state.completed.length;
}

function completed(id) {
  return state.completed.includes(id);
}

function markComplete(questId) {
  if (!completed(questId)) {
    state.completed.push(questId);
    saveState();
  }
}

function canAttempt(q) {
  if (completed(q.id)) return false;
  if (q.requires && q.requires.some((it) => !hasItem(it))) return false;
  return true;
}

function missingItems(q) {
  if (!q.requires) return [];
  return q.requires.filter((id) => !hasItem(id));
}

function updateStoryText() {
  let storyText;
  if (completeCount() >= 9) {
    storyText = "你已完成所有任務，鄰里變得更有秩序，獲得「小小探索家」稱號！";
  } else if (completeCount() >= 6) {
    storyText = "你已幫助六位居民，夜晚也開始安全回歸，繼續往前探索。";
  } else if (completeCount() >= 3) {
    storyText = "你已解開三道日常謎題，村長準備了新的活動道具給你。";
  } else {
    storyText = "歡迎來到「幸福鎮」，完成各難度日常任務，帶回幫助與積分。";
  }
  elements.storyText.textContent = storyText;
  safeSpeak(getStorySpeechText(storyText), hasInteracted);
}

function clampInventoryLabel(id) {
  const item = SHOP_ITEMS.find((it) => it.id === id);
  return item ? item.name : id;
}

function renderInventory() {
  elements.inventory.innerHTML = "";
  const ids = Object.entries(state.inventory);
  if (ids.length === 0) {
    elements.inventory.innerHTML = `<div class="inv-item muted">目前還沒有道具，先去商店看看吧。</div>`;
    return;
  }

  ids.forEach(([id, count]) => {
    const box = document.createElement("div");
    box.className = "inv-item";
    const item = SHOP_ITEMS.find((i) => i.id === id);
    const name = item ? `${item.name}（${item.category}）` : clampInventoryLabel(id);
    box.innerHTML = `<strong>${name}</strong><span> × ${count}</span>`;
    elements.inventory.appendChild(box);
  });
}

function renderShop() {
  elements.shop.innerHTML = "";
  SHOP_ITEMS.forEach((item) => {
    const itemCard = document.createElement("div");
    itemCard.className = "shop-item";
    itemCard.innerHTML = `
      <div><strong>${item.name}</strong>（${item.category}）</div>
      <div>${item.desc}</div>
      <div class="muted">價格：${item.price} 幣</div>
    `;
    const buyBtn = document.createElement("button");
    buyBtn.textContent = state.coins >= item.price ? "購買" : "幣不夠";
    buyBtn.disabled = state.coins < item.price;
    buyBtn.addEventListener("click", () => {
      if (state.coins < item.price) return;
      state.coins -= item.price;
      state.inventory[item.id] = (state.inventory[item.id] || 0) + 1;
      renderTopBar();
      renderInventory();
      renderQuestList();
      appendChat(`[系統] ${state.player.name} 在商店買了 ${item.name}。`);
      if (wsConnected && ws) {
        sendToServer({ type: "purchase", id: item.id, name: item.name });
      }
      saveState();
    });
    itemCard.appendChild(buyBtn);
    elements.shop.appendChild(itemCard);
  });
}

function renderTopBar() {
  elements.coinText.textContent = `錢幣：${state.coins}`;
  elements.xpText.textContent = `經驗：${state.xp}`;
  elements.playerName.textContent = state.player.name;
}

function updateQuestCard(q) {
  const panel = document.createElement("div");
  const reqs = q.requires ? q.requires.map(clampInventoryLabel).join("、") : "";
  panel.className = `quest-item ${completed(q.id) ? "done" : "pending"}`;
  const tag = `<span class="tag ${q.difficulty}">${q.difficulty}</span>`;
  const status = completed(q.id)
    ? "已完成 ✅"
    : canAttempt(q)
      ? "可開始"
      : "尚需道具";
  panel.innerHTML = `
    <div>${tag}<strong>${q.name}</strong> - ${status}</div>
    <div class="muted">${q.desc}</div>
    ${reqs ? `<div class="required">需要：${reqs}</div>` : ""}
  `;
  if (isQuestReachable(q) && !completed(q.id)) {
    const btn = document.createElement("button");
    btn.textContent = "前往任務";
    btn.addEventListener("click", () => {
      openQuest(q);
    });
    panel.appendChild(btn);
  }
  return panel;
}

function renderQuestList() {
  elements.questList.innerHTML = "";
  const ordered = [...QUESTS].sort((a, b) => {
    const d = ["easy", "medium", "hard"];
    if (d.indexOf(a.difficulty) !== d.indexOf(b.difficulty)) {
      return d.indexOf(a.difficulty) - d.indexOf(b.difficulty);
    }
    return a.x - b.x;
  });
  ordered.forEach((q) => {
    elements.questList.appendChild(updateQuestCard(q));
  });
}

function isQuestReachable(q) {
  const dx = Math.abs(state.player.x - q.x);
  const dy = Math.abs(state.player.y - q.y);
  return dx + dy <= 1;
}

function appendChat(text, who = "系統") {
  const line = document.createElement("div");
  line.className = "chat-line";
  line.innerHTML = `<strong>[${who}]</strong> ${text}`;
  elements.chatLog.appendChild(line);
  elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
}

function draw() {
  const { ctx, canvas } = elements;
  const w = TILE * WORLD_W;
  const h = TILE * WORLD_H;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < WORLD_H; y++) {
    for (let x = 0; x < WORLD_W; x++) {
      const tile = tileAt(x, y);
      let fill = "#f1fbff";
      if (tile === "#") fill = "#8db3d1";
      else if (tile === "S") fill = "#e8f8c0";
      else if (tile === "A") fill = "#ffe5a3";
      ctx.fillStyle = fill;
      ctx.fillRect(x * TILE, y * TILE + 16, TILE, TILE);

      if (tile === "#") {
        ctx.fillStyle = "#5d7487";
        ctx.fillRect(x * TILE + 14, y * TILE + 30, 20, 4);
      }
      if (tile === "S") {
        ctx.fillStyle = "#3f6f4f";
        ctx.fillText("商店", x * TILE + 12, y * TILE + 40);
      }
      if (tile === "A") {
        ctx.fillStyle = "#8f4a00";
        ctx.fillText("任務", x * TILE + 12, y * TILE + 40);
      }
    }
  }

  QUESTS.forEach((q) => {
    const x = q.x * TILE;
    const y = q.y * TILE + 16;
    if (completed(q.id)) {
      ctx.fillStyle = "#8ecf9e";
    } else if (canAttempt(q)) {
      ctx.fillStyle = "#f4c542";
    } else {
      ctx.fillStyle = "#f28a8a";
    }
    ctx.fillRect(x + 16, y + 16, 16, 16);
  });

  const sx = state.player.x * TILE;
  const sy = state.player.y * TILE + 16;
  ctx.fillStyle = state.player.color;
  ctx.beginPath();
  ctx.arc(sx + TILE / 2, sy + TILE / 2, TILE / 2 - 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(state.player.name.slice(0, 3), sx + 8, sy + 30);

  remotePlayers.forEach((r) => {
    const rx = r.x * TILE;
    const ry = r.y * TILE + 16;
    ctx.fillStyle = "#4caf50";
    ctx.beginPath();
    ctx.rect(rx + 8, ry + 8, TILE - 16, TILE - 16);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(r.name?.slice(0, 3) || "P", rx + 10, ry + 22);
  });

}

function openQuest(quest) {
  if (!quest) return;
  elements.overlayTitle.textContent = `${quest.name}（${quest.difficulty}）`;
  const missing = missingItems(quest);
  if (missing.length > 0) {
    const bodyText = `你還缺少 ${missing.map(clampInventoryLabel).join("、")}，先去商店買到再來吧。`;
    elements.overlayBody.textContent = bodyText;
    elements.overlayOptions.innerHTML = "";
    setQuestSpeechText(bodyText);
    safeSpeak(bodyText);
    elements.questVoiceControls.classList.remove("hidden");
    elements.replayVoiceBtn.disabled = false;
    elements.overlay.classList.remove("hidden");
    return;
  }
  elements.overlayBody.textContent = quest.prompt;
  const fullPrompt = `你到達任務「${quest.name}」，${quest.prompt}`;
  setQuestSpeechText(fullPrompt);
  speakQuestText(quest);
  elements.questVoiceControls.classList.remove("hidden");
  elements.replayVoiceBtn.disabled = false;
  elements.overlayOptions.innerHTML = "";
  quest.options.forEach((opt, idx) => {
    const row = document.createElement("div");
    row.className = "quest-option-row";

    const btn = document.createElement("button");
    btn.className = "quest-option-select";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      if (!state.player) return;
      if (idx === quest.answer) {
        const reward = quest.reward;
        state.coins += reward.coins;
        state.xp += reward.xp;
        markComplete(quest.id);
        if (quest.consume) {
          quest.consume.forEach((it) => {
            if (state.inventory[it] > 0) state.inventory[it] -= 1;
            if (state.inventory[it] <= 0) delete state.inventory[it];
          });
        }
        appendChat(`[系統] ${state.player.name} 完成任務《${quest.name}》，${quest.rewardText}`);
        if (wsConnected && ws) {
          sendToServer({ type: "quest-complete", id: quest.id, reward });
        }
        updateStoryText();
        saveState();
        renderTopBar();
        renderInventory();
        renderQuestList();
        closeOverlay();
        safeSpeak(`太棒了！${state.player.name}，你完成 ${quest.name} 任務，${quest.rewardText}`, true);
        maybeWin();
      } else {
        appendChat(`[系統] ${state.player.name} 沒有答對，先回去想一想。`);
        safeSpeak("答案不對，請再想一想。", true);
        closeOverlay();
      }
    });

    const speakBtn = document.createElement("button");
    speakBtn.type = "button";
    speakBtn.className = "quest-option-speak";
    speakBtn.textContent = "🔊";
    speakBtn.title = `播報「${opt}」`;
    speakBtn.setAttribute("aria-label", `播報第${idx + 1}項選項`);
    speakBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      hasInteracted = true;
      speakChoiceText(opt, idx);
    });

    row.appendChild(btn);
    row.appendChild(speakBtn);
    elements.overlayOptions.appendChild(row);
  });
  const cancel = document.createElement("button");
  cancel.className = "quest-cancel";
  cancel.textContent = "稍後解答";
  cancel.addEventListener("click", closeOverlay);
  elements.overlayOptions.appendChild(cancel);
  elements.overlay.classList.remove("hidden");
}

function closeOverlay() {
  elements.overlay.classList.add("hidden");
  currentQuestSpeechText = "";
  if (elements.questVoiceControls) {
    elements.questVoiceControls.classList.add("hidden");
  }
  if (elements.replayVoiceBtn) {
    elements.replayVoiceBtn.disabled = true;
  }
}

function maybeWin() {
  if (completeCount() >= 9) {
    const winText = "恭喜你完成全任務，全鎮發放「小小探索家榮耀獎」：新增 100 幣與獎勵外套。";
    appendChat(winText);
    safeSpeak(winText, true);
    state.coins += 100;
    state.inventory["badge"] = (state.inventory["badge"] || 0) + 1;
    renderTopBar();
    renderInventory();
    saveState();
    renderQuestList();
  }
}

function movePlayer(dx, dy) {
  const now = Date.now();
  if (!canMove || now - lastMoveAt < moveDelay) return;
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;
  if (!isWalkable(nx, ny)) return;

  state.player.x = nx;
  state.player.y = ny;
  lastMoveAt = now;
  saveState();
  renderQuestList();
  if (wsConnected && ws) sendToServer({ type: "move", x: nx, y: ny });
}

function nearbyQuest() {
  return QUESTS.find((q) => isQuestReachable(q));
}

function interact() {
  const q = nearbyQuest();
  if (!q) {
    appendChat("[系統] 這附近沒有任務，先去有「任務」標記的地方吧。");
    return;
  }
  openQuest(q);
}

function sendToServer(payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({ ...payload, playerId: state.player.id }));
}

function connectMultiplayer(roomId) {
  if (wsConnected || ws) leaveMultiplayer();
  if (!WS_URL) {
    appendChat("未設定多人連線網址，將使用離線模式（單機）。");
    state.multiplayer = false;
    elements.onlineHint.textContent = "未設定伺服器";
    return;
  }
  try {
    const cleanBase = resolveWsUrl(WS_URL);
    if (!cleanBase) {
      appendChat("多人連線網址格式不正確，請重新填寫 wss:// 或 https://。");
      elements.onlineHint.textContent = "連線網址無效";
      state.multiplayer = false;
      return;
    }
    const cleanRoom = encodeURIComponent(roomId || "town-01");
    ws = new WebSocket(`${cleanBase}/?room=${cleanRoom}&name=${encodeURIComponent(state.player.name)}&id=${state.player.id}`);
    ws.addEventListener("open", () => {
      wsConnected = true;
      state.multiplayer = true;
      appendChat("多人連線成功，你已加入聊天室。");
      elements.onlineHint.textContent = "連線中";
      sendToServer({ type: "join", name: state.player.name, x: state.player.x, y: state.player.y, color: state.player.color });
    });
    ws.addEventListener("message", (evt) => {
      let msg = {};
      try {
        msg = JSON.parse(evt.data || "{}");
      } catch {
        appendChat("[系統] 收到無效封包，略過。");
        return;
      }
      if (!msg.type) return;
      switch (msg.type) {
        case "full":
          appendChat("這個房間已滿（三人上限）。請換房間後再試。");
          ws.close();
          break;
        case "state":
          if (Array.isArray(msg.players)) {
            remotePlayers.clear();
            msg.players.forEach((p) => {
              if (p.id && p.id !== state.player.id) {
                remotePlayers.set(p.id, p);
              }
            });
          }
          break;
        case "peer-join":
          if (msg.id !== state.player.id) {
            remotePlayers.set(msg.id, { id: msg.id, name: msg.name, x: msg.x, y: msg.y, color: msg.color });
            appendChat(`[全站] ${msg.name} 進入房間。`);
          }
          break;
        case "peer-leave":
          remotePlayers.delete(msg.id);
          if (msg.name) appendChat(`[全站] ${msg.name} 離開。`);
          break;
        case "move":
          if (msg.playerId && msg.playerId !== state.player.id) {
            if (remotePlayers.has(msg.playerId)) {
              const p = remotePlayers.get(msg.playerId);
              p.x = msg.x;
              p.y = msg.y;
            } else {
              remotePlayers.set(msg.playerId, { id: msg.playerId, name: msg.name || "同伴", x: msg.x, y: msg.y });
            }
          }
          break;
        case "chat":
          appendChat(`${msg.name || "匿名"}: ${msg.text}`);
          break;
        case "system":
          appendChat(`[伺服器] ${msg.text}`);
          break;
      }
    });
    ws.addEventListener("close", () => {
      wsConnected = false;
      state.multiplayer = false;
      elements.onlineHint.textContent = "已離線";
      remotePlayers.clear();
    });
    ws.addEventListener("error", () => {
      appendChat("多人通道發生連線錯誤，切回離線可繼續遊戲。");
      wsConnected = false;
      state.multiplayer = false;
      elements.onlineHint.textContent = "連線異常";
    });
  } catch (error) {
    appendChat("連線多人模式失敗，改為單機。");
  }
}

function setServerUrl(nextUrl) {
  const normalized = resolveWsUrl(nextUrl) || (nextUrl || "").trim();
  WS_URL = normalized;
  if (normalized) {
    localStorage.setItem(WS_URL_STORAGE_KEY, normalized);
    appendChat(`已儲存多人連線網址：${normalized}`);
  } else {
    localStorage.removeItem(WS_URL_STORAGE_KEY);
    appendChat("已清除多人連線網址，離線模式可用。");
  }
  syncWsUrl();
  if (state.player.name && elements.modeSelect.value === "multi") {
    connectMultiplayer(elements.roomInput.value);
  }
}

function leaveMultiplayer() {
  if (ws) {
    ws.close();
    ws = null;
  }
  remotePlayers.clear();
  wsConnected = false;
  state.multiplayer = false;
  elements.onlineHint.textContent = "未連線";
}

function handleChatSubmit(e) {
  e.preventDefault();
  const value = elements.chatInput.value.trim();
  if (!value) return;
  const msg = `${value}`;
  appendChat(`${state.player.name}: ${msg}`);
  if (wsConnected && ws) {
    sendToServer({ type: "chat", text: msg });
  } else {
    if (value.length > 0) {
      appendChat("（未連線：目前僅本機可見）");
    }
  }
  elements.chatInput.value = "";
}

function loop() {
  draw();
  requestAnimationFrame(loop);
}

function wireControls() {
  const storedVoiceEnabled = localStorage.getItem(VOICE_ENABLED_KEY);
  const shouldEnableVoice = storedVoiceEnabled === null ? true : storedVoiceEnabled === "1";
  speechEnabled = shouldEnableVoice;
  elements.voiceToggle.checked = speechEnabled;
  setQuestSpeechText("");
  elements.questVoiceControls.classList.add("hidden");
  elements.replayVoiceBtn.disabled = true;
  if (!isSpeechAvailable()) {
    speechEnabled = false;
    elements.voiceToggle.disabled = true;
    elements.testVoiceBtn.disabled = true;
    elements.replayVoiceBtn.disabled = true;
    elements.stopVoiceBtn.disabled = true;
    elements.voiceToggle.checked = false;
  }

  elements.voiceToggle.addEventListener("change", () => {
    setSpeechEnabled(elements.voiceToggle.checked);
  });
  elements.testVoiceBtn.addEventListener("click", () => {
    hasInteracted = true;
    safeSpeak("你有開啟任務語音，接下來會念任務指示給你聽。", true);
  });
  elements.replayVoiceBtn.addEventListener("click", () => {
    hasInteracted = true;
    if (currentQuestSpeechText) {
      safeSpeak(currentQuestSpeechText, true);
    }
  });
  elements.stopVoiceBtn.addEventListener("click", stopSpeech);

  window.addEventListener("keydown", (e) => {
    if (document.activeElement === elements.chatInput || document.activeElement === elements.nameInput) return;
    if (elements.overlay.classList.contains("hidden") === false) return;
    if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") movePlayer(0, -1);
    if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") movePlayer(0, 1);
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") movePlayer(-1, 0);
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") movePlayer(1, 0);
    if (e.code === "Space") interact();
  });

  elements.overlayClose.addEventListener("click", closeOverlay);
  elements.chatForm.addEventListener("submit", handleChatSubmit);

  elements.startBtn.addEventListener("click", () => {
    hasInteracted = true;
    const inputName = elements.nameInput.value.trim() || "小探險家";
    state.player.name = inputName;
    elements.nameModal.classList.add("hidden");
    initAfterStart();
  });

  elements.modeSelect.addEventListener("change", () => {
    if (elements.modeSelect.value === "multi") {
      syncWsUrl();
      if (!WS_URL) {
        appendChat("多人模式需要設定 WS 伺服器網址，已切回單人。");
        elements.modeSelect.value = "single";
        return;
      }
      if (state.player.name) {
        connectMultiplayer(elements.roomInput.value);
      }
    } else {
      leaveMultiplayer();
    }
  });
  elements.saveWsBtn.addEventListener("click", () => {
    setServerUrl(elements.wsUrlInput.value);
  });
  elements.resetBtn.addEventListener("click", () => {
    if (confirm("要清除本地進度與背包並回到起始狀態嗎？")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(WS_URL_STORAGE_KEY);
      state = {
        player: {
          id: crypto.randomUUID(),
          name: state.player.name || "小探險家",
          x: 2,
          y: 2,
          color: "#2d8bf3",
          hp: 3
        },
        xp: 0,
        coins: 40,
        completed: [],
        storyStep: 0,
        inventory: {},
        messages: [],
        multiplayer: false
      };
      renderTopBar();
      renderInventory();
      renderQuestList();
      renderShop();
      updateStoryText();
      appendChat("已重置進度，請重新挑戰任務。");
    }
  });
  elements.nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") elements.startBtn.click();
  });
}

function initAfterStart() {
  renderTopBar();
  renderInventory();
  renderQuestList();
  renderShop();
  updateStoryText();
  saveState();
  if (elements.modeSelect.value === "multi") {
    connectMultiplayer(elements.roomInput.value);
  } else {
    elements.onlineHint.textContent = "單人模式";
  }
}

window.addEventListener("beforeunload", () => {
  saveState();
});

function init() {
  state = loadState();
  syncWsUrl();
  renderTopBar();
  if (!state.player.name) {
    hasInteracted = false;
    elements.nameInput.focus();
  } else {
    hasInteracted = true;
    elements.nameModal.classList.add("hidden");
    initAfterStart();
  }
  wireControls();
  loop();
}

init();
