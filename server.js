const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio'); // タイトル取得のために引き続き使用しますが、HTML全体を返すのが主目的
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

    try {
        // AxiosでHTTP GETリクエストを送信
        // User-AgentをChromeのものに設定し、ブラウザからのアクセスに見せかける
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            timeout: 10000 // 10秒のタイムアウト
        });

        const html = response.data; // ★ ここでHTMLコンテンツ全体を取得 ★

        // CheerioでHTMLをロードし、タイトルのみ取得（HTML全体を返すため解析は最低限に）
        const $ = cheerio.load(html);
        const pageTitle = $('title').text();

        // 結果をクライアントに返す
        res.json({
            title: pageTitle,
            html: html, // ★ 取得したHTMLコンテンツ全体を返す ★
            message: `URL: ${url} のHTMLスクレイピングが成功しました。`
        });

    } catch (error) {
        console.error('スクレイピングエラー:', error);
        let errorMessage = 'スクレイピング中にエラーが発生しました。';
        if (axios.isAxiosError(error)) { // Axiosのエラータイプをチェック
            if (error.response) {
                errorMessage += ` ステータスコード: ${error.response.status} (${error.response.statusText})`;
            } else if (error.request) {
                errorMessage += ' サーバーからの応答がありませんでした（ネットワークエラーまたはタイムアウト）。';
            } else {
                errorMessage += ` リクエスト設定エラー: ${error.message}`;
            }
        } else {
            errorMessage += ` 詳細: ${error.message}`;
        }
        res.status(500).json({ error: errorMessage, details: error.message });
    }
});

// サーバーを起動
app.listen(port, () => {
    console.log(`サーバーが http://localhost:${port} で起動しました。`);
    console.log(`http://localhost:${port}/ を開いてURLを入力してください。`);
});
