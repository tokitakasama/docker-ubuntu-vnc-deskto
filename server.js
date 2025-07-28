const express = require('express');
const { chromium } = require('playwright');
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
        browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-video-decode',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const pageTitle = await page.title();
        const htmlContent = await page.content();

        res.json({
            title: pageTitle,
            html: htmlContent,
            message: `URL: ${url} のスクレイピングが成功しました。`
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
