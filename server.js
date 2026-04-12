const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.use(express.json({ limit: "50mb" }));

app.post("/pdf", async (req, res) => {
    try {
        const { html } = req.body;

        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage"
            ]
        });

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: "load"
        });

        await page.emulateMediaType("print");

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
        });

        await browser.close();

        res.setHeader("Content-Type", "application/pdf");
        res.send(pdf);

    } catch (e) {
        console.error("PDF ERROR:", e);
        res.status(500).send("PDF ERROR");
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log("PDF service running on port " + PORT);
});