const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.use((req, res, next) => {
    console.log("➡️", req.method, req.url);
    next();
});

app.use(express.json({ limit: "50mb" }));

app.post("/", async (req, res) => {
    try {
        const { html } = req.body;

        const browser = await puppeteer.launch({
            headless: "new",
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-zygote",
                "--single-process"
            ]
        });

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: "networkidle0"
        });

        await page.emulateMediaType("print");

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
        });
        console.log("PDF GENERATED:", pdf.length);

        await browser.close();
        console.log("PDF SIZE:", pdf.length);

        res.setHeader("Content-Type", "application/pdf");
        res.send(pdf);

    } catch (e) {
        console.error("PDF ERROR FULL:", e);
        res.status(500).send("PDF ERROR: " + e.message);
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log("PDF service running on port " + PORT);
});