const puppeteer = require("puppeteer-core");
const axios = require('axios');
const { close_popup,getData,getSonstiges,fillForm }=require("./functions");


async function callWebhook(url, body, headers = {}) {
  try {
    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    throw error;
  }
}


async function isAvailable(url,BROWSER_WS) {
    const browser = await puppeteer.connect({
        browserWSEndpoint: BROWSER_WS,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await close_popup(page);
    const element = await page.$('#is24-main .status-warning .status-title');
    if (element) {
        const text = await page.evaluate(el => el.textContent, element);
        console.log(text);
        return{isItAvailable:!(text=="Angebot wurde deaktiviert")};
    } else {
        return {isItAvailable:true};
    }
}

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

async function scrapeSonstiges(url,BROWSER_WS) {
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
    const JSONResult = await getSonstiges(page)
    console.log("data extracted! closing browser ...");
    await browser.close();
    return JSONResult
}

async function sendMessage(url, BROWSER_WS, message, Salutation, Forename, Surname, Company, Email, phone) {
    console.log("Connecting to browser...");
    const browser = await puppeteer.connect({
        browserWSEndpoint: BROWSER_WS,
    });
    console.log("Connected! Navigate to site...");
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    console.log("Navigated! Waiting for popup...");
    await close_popup(page);
    console.log("Sending Message..");
    const JSONResult = await fillForm(page, message, Salutation, Forename, Surname, Company, Email, phone)
    console.log("data extracted! closing browser ...");
    await browser.close();
    return JSONResult
}

module.exports = {scrape,isAvailable,scrapeSonstiges,sendMessage,callWebhook}
