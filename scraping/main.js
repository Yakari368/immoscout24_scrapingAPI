const puppeteer = require("puppeteer-core");
const { close_popup,getData }=require("./functions");

async function scrape(url,BROWSER_WS) {
    console.log("Connecting to browser...");
    const browser = await puppeteer.connect({
        browserWSEndpoint: BROWSER_WS,
    });
    console.log("Connected! Navigate to site...");
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    console.log("Navigated! Waiting for popup...");
    await close_popup(page);
    console.log("Extracting data...");
    const JSONResult = await getData(page)
    console.log("data extracted! closing browser ...");
    await browser.close();
    return JSONResult
}

module.exports = {scrape}