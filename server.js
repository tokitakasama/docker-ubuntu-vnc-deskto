const express = require('express');
const { chromium } = require('playwright'); // Playwrightからchromiumをインポート
const path = require('path');

const app = express();
const port = 3000;

// JSONボディをパースするためのミドルウェア
app.use(express.json());
// 静的ファイルを配信するためのミドルウェア (publicフォルダ内のindex.htmlを公開)
app.use(express.static(path.join(__dirname, 'public')));

// スクレイピングエンドポイント
app.post('/scrape', async (req, res) => {
    const { url } = req.body; // クライアントから送信されたURLを取得

    if (!url) {
        return res.status(400).json({ error: 'URLが提供されていません。' });
    }

    let browser;
    try {
        // PlaywrightのChromiumブラウザを起動
        // headless: true がデフォルト（UIなし）、headless: false でUIを表示
        browser = await chromium.launch({ headless: true }); // ヘッドレスモードで起動
        const page = await browser.newPage();

        // ページに移動
        // waitUntil: 'domcontentloaded' はDOMがロードされるまで待機
        // timeout: タイムアウト時間を設定（ミリ秒）
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // ページのタイトルを取得
        const pageTitle = await page.title();

        // ページのHTMLコンテンツ全体を取得
        const htmlContent = await page.content();

        // 結果をクライアントに返す
        res.json({
            title: pageTitle,
            html: htmlContent, // HTMLコンテンツを追加
            message: `URL: ${url} のHTMLスクレイピングが成功しました。`
        });

    } catch (error) {
        console.error('スクレイピングエラー:', error);
        // エラー詳細を返す（セキュリティに注意し、本番環境では一般的なメッセージに留める）
        res.status(500).json({ error: 'スクレイピング中にエラーが発生しました。', details: error.message });
    } finally {
        if (browser) {
            await browser.close(); // ブラウザを閉じる
        }
    }
});

// サーバーを起動
app.listen(port, () => {
    console.log(`サーバーが http://localhost:${port} で起動しました。`);
    console.log(`http://localhost:${port}/ を開いてURLを入力してください。`);
});
