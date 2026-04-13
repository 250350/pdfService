const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const app = express();

app.use(express.json({ limit: "50mb" }));

app.post("/pdf", async (req, res) => {
    try {
        const { html } = req.body;

        console.log("➡️ POST /pdf");
        console.log("BEFORE PDF");

        const browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless
        });

        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true
        });

        console.log("PDF GENERATED:", pdf.length);

        await browser.close();

        res.setHeader("Content-Type", "application/pdf");
        res.send(pdf);

    } catch (e) {
        console.error("PDF ERROR FULL:", e);
        res.status(500).send(e.message);
    }
});

app.listen(3001, () => console.log("PDF service running"));