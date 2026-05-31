# 國中 99 單字練習

這是一個純靜態 PWA，可直接部署到 GitHub Pages、Netlify、Vercel 或任何靜態主機。開啟後可以在 iPhone Safari 使用「加入主畫面」當作 app 學習。

## 網址

- 99 單字版：`https://xier9.github.io/Recite2000SingleWords/`
- 2000 單字版：`https://xier9.github.io/Recite2000SingleWords/2000/`

## 本機預覽

```bash
python3 -m http.server 4173
```

打開 `http://localhost:4173`。

## iPhone 使用

1. 把這個資料夾發布到支援 HTTPS 的靜態網站。
2. 用 iPhone Safari 開啟網址。
3. 點分享按鈕，選「加入主畫面」。
4. 從主畫面開啟後可離線使用已快取的頁面。

## 功能

- 學習：一次顯示 5 個單字、中文、詞性、音標與例句。
- 朗讀：點單字、播放按鈕或例句即可用英文發音。
- 複習：翻卡模式，可標記「已會」或「加強」。
- 測驗：類 Quizlet 的選擇題，會優先抽加強與尚未熟悉的字。
- 進度：使用瀏覽器 `localStorage` 儲存在同一台裝置上。
