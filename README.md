# 小小探索家：2D平面探索解謎網頁遊戲

這是一個專為 7～9 歲設計的日常生活學習型網頁遊戲，含：

- 2D 平面探索地圖
- 主線故事
- 簡 / 中 / 難三種任務
- 任務獎勵（幣與 XP）
- 商店可購買道具、衣服、配件
- 任務依賴道具解鎖
- 進度紀錄（`localStorage`）
- 全頻道聊天
- 多人最多 3 人（透過 Cloudflare Worker WebSocket）

## 一、直接在本機啟動

1. 用瀏覽器直接開啟 `index.html` 即可離線遊玩。
2. 首次遊玩會先輸入角色名字，會自動建立本機進度。

## 二、GitHub Pages（gH）部署

1. 將此資料夾推到 GitHub repo，例如 `kid-2d-town-game`。
2. 進入 `Settings -> Pages`。
3. 選擇 `Source = GitHub Actions`（本專案已預設加入 `pages.yml`，推 `main` 會自動部署）。
4. 等待 1～3 分鐘後即可取得網址。

## 三、Cloudflare 多人 WebSocket 部署

### 1) 安裝 wrangler（若尚未）

```bash
npm i -g wrangler
wrangler login
```

### 2) 部署 Worker

```bash
wrangler deploy
```

完成後會取得類似：

- `https://<你的工作名稱>.<account>.workers.dev`

### 3) 把 Worker URL 設定進前端

打開 `index.html` 內：

```html
<script>
  window.__GAME_WS_URL__ = "wss://<你的-worker-網址>";
</script>
```

或直接在頁面「多人聊天室」區塊填入 `Cloudflare WS`，按「儲存連線網址」：

你也可以直接用網址參數一次到位，例如：

```
https://你的-gH-url/?ws=wss://<你的-worker-網址>
```

然後把多人模式切到「多人（CF）」。

### 4) 房間與人數

- `roomInput` 輸入同房間代碼可一起玩。
- 服務端限制每個房間最多 3 人，超過會回傳已滿。

## 四、資料與進度

- 進度會存到瀏覽器 `localStorage`（key：`tiny-town-adventure-v1`）。
- 任務完成後會留下紀錄、道具與幣值。
- 如要重置進度，可清除該 key 或開無痕模式。

## 五、檔案結構

- `index.html`：介面、遊戲畫面
- `styles.css`：樣式
- `app.js`：遊戲核心邏輯
- `worker.js`：Cloudflare Worker（多人+聊天）
- `wrangler.toml`：Cloudflare 部署設定
- `README.md`：你現在看的這份說明
