const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/scrape', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URLが提供されていません。' });
    }

    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // ページに移動
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // ページのタイトルを取得
        const pageTitle = await page.title();

        // ★ ここを修正: ページのHTMLコンテンツ全体を取得 ★
        const htmlContent = await page.content();

        // 結果をクライアントに返す
        res.json({
            title: pageTitle,
            html: htmlContent, // HTMLコンテンツを追加
            message: `URL: ${url} のHTMLスクレイピングが成功しました。`
        });

    } catch (error) {
        console.error('スクレイピングエラー:', error);
        res.status(500).json({ error: 'スクレイピング中にエラーが発生しました。', details: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

app.listen(port, () => {
    console.log(`サーバーが http://localhost:${port} で起動しました。`);
    console.log(`http://localhost:${port}/ を開いてURLを入力してください。`);
});
