# ベースイメージとして、Node.js の最新LTSバージョンを使用
FROM node:20-slim

# 作業ディレクトリを設定
WORKDIR /app

# npm install のキャッシュを効率化するため、package.json と package-lock.json を先にコピー
COPY package*.json ./

# npm依存関係をインストール
# --omit=dev は開発依存関係（テストフレームワークなど）を除外して本番ビルドを軽量化
RUN npm install --omit=dev

# Playwright がブラウザを実行するために必要なOSレベルの依存関係をインストール
# これらの依存関係は、Node.jsのslimイメージとChromiumの組み合わせで一般的に必要です。
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# ★ここが変更点: postinstallを使わず、Dockerfile内で直接ブラウザをインストール★
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx playwright install chromium

# アプリケーションのコードをコピー
COPY . .

# アプリケーションがリッスンするポート
EXPOSE 3000

# アプリケーションを起動するコマンド
CMD ["npm", "start"]
