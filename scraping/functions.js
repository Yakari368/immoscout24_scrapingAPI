const puppeteer = require("puppeteer-core");
const { setTimeout } = require('node:timers/promises');

async function close_popup(page) {
    try {
        await setTimeout(35000);
        await page.waitForSelector('#usercentrics-root');
        const shadowHost = await page.$('#usercentrics-root');
        const shadowRoot = await shadowHost.evaluateHandle(el => el.shadowRoot);
        const close_btn = await shadowRoot.$('button[data-testid="uc-accept-all-button"]');
        console.log("Popup appeared! Closing...");
        await close_btn.click();
        console.log("Popup closed!");
    } catch (e) {
        console.log("Popup didn't appear.", e);
    }
}


async function getData(page) {
    try {
        const resultList = await page.evaluate(() => {
            const result = window.IS24 ? window.IS24.resultList.resultListModel.searchResponseModel : null;
            return result["resultlist.resultlist"].resultlistEntries[0].resultlistEntry
        });
        let resultObject = [];
        resultList.map((result, index) => {
            if (result['resultlist.realEstate'].privateOffer == 'true') {
                let gallery = [];
                const attachment = result['resultlist.realEstate'].galleryAttachments?.attachment
                if (Array.isArray(attachment)) {
                    attachment.map(image => {
                        image = image.urls[0].url["@href"]
                        const endIndex = image.indexOf('ORIG');
                        gallery.push({
                            "url": image.substring(0, endIndex).trim(),
                        })

                    })
                } else if (attachment?.urls) {
                    const image = attachment.urls[0].url["@href"]
                    const endIndex = image.indexOf('ORIG');
                    gallery.push({
                        "url": image.substring(0, endIndex).trim(),
                    })
                }

                let features = []
                result['resultlist.realEstate'].builtInKitchen == 'true' && features.push('Built in Kitchen')
                result['resultlist.realEstate'].balcony == 'true' && features.push('Balcony')
                result['resultlist.realEstate'].garden == 'true' && features.push('Garden')
                result['resultlist.realEstate'].courtage.hasCourtage == 'YES' && features.push('has Courtage')
                result['resultlist.realEstate'].lift == 'true' && features.push('Lift')
                result['resultlist.realEstate'].guestToilet == 'true' && features.push('Guest Toilet')
                result['resultlist.realEstate'].cellar == 'true' && features.push('Cellar')
                result['resultlist.realEstate'].isBarrierFree == 'true' & features.push('is Barrier Free')

                resultObject.push(
                    {
                        id: index,
                        title: result['resultlist.realEstate'].title,
                        address: result['resultlist.realEstate'].address,
                        contactDetails: result['resultlist.realEstate'].contactDetails,
                        gallery,
                        price: result['resultlist.realEstate'].price,
                        livingSpace: result['resultlist.realEstate'].livingSpace + 'm²',
                        numberOfRooms: result['resultlist.realEstate'].numberOfRooms,
                        constructionYear: result['resultlist.realEstate'].constructionYear,
                        estateInfo: features,
                        monthlyRate: result['resultlist.realEstate'].monthlyRate,
                        modificationDate: result["@modification"],
                        url: `https://www.immobilienscout24.de/expose/${result.realEstateId}`,
                    })
            }
        })

        return resultObject
    } catch (error) {
        console.log(error);

        return new Error(error)
    }

}

async function getSonstiges(page) {
    const allText = await page.evaluate(() => {
        const grandfatherDiv = document.querySelector('div.content-section-first'); // Replace with your CSS selector
        return grandfatherDiv ? grandfatherDiv.textContent.trim().replace('\n', '').replace(/\s+/g, ' ').replace(/{[^}]*}/g, '').trim() : null;
    });
    return allText
}
async function sendascreeshot(page,title) {
    const screenshotBase64 = await page.screenshot({ encoding: 'base64' });
    const imageData = `data:image/png;base64,${screenshotBase64}`;
    const webhookUrl = 'https://hook.eu2.make.com/nxwkee7ji943muax6fufpoj109fylrlr';
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData,title: title }),
    });
}

async function fillForm(page, message, Salutation, Forename, Surname, Company, Email, phone) {
    console.log("loking for button...");
    await page.waitForSelector('button[data-testid="contact-button"]');
    console.log("clicking for button...");
    await page.click('button[data-testid="contact-button"]');

    const rand = Math.random() * 10000
    console.log("filling the form...");
    sendascreeshot(page,`${rand}_before_message.png`);
try {
    try {
        await page.waitForSelector('#message', { timeout: 60000 });
    }catch(e){
        await page.click('button[data-testid="contact-button"]');
        await page.waitForSelector('#message', { timeout: 60000 });
    }
    await page.type('#message', message);
    await page.select('select[data-testid="salutation"]', Salutation);
    await page.type('input[data-testid="firstName"]', Forename);
    await page.type('input[data-testid="lastName"]', Surname);
    if (await page.$('input[data-testid="company"]')) await page.type('input[data-testid="company"]', Company);
    await page.type('input[data-testid="emailAddress"]', Email);
    await page.type('input[data-testid="phoneNumber"]', phone);
    console.log('filling form done');
    await page.waitForSelector('button[type="submit"].Button_button-primary__6QTnx');
    console.log("submiting form...");
    await page.click('button[type="submit"].Button_button-primary__6QTnx');
    console.log("form submited");
}catch(e){
    sendascreeshot(page,`${rand}_after_message.png`);
}
    
    sendascreeshot(page,`${rand}_captcha_before.png`);

    try {
        await page.waitForSelector('#is24-expose-cosma-modal');
        sendascreeshot(page,`${rand}_captcha_mid.png`);
        // If the CAPTCHA modal is detected, solve the CAPTCHA
        const client = await page.target().createCDPSession();
        const { status } = await client.send('Captcha.solve', { detectTimeout: 30000 });
        console.log(`CAPTCHA solve status: ${status}`);

        sendascreeshot(page,`${rand}_captcha_after.png`);
    } catch (e) {
        // If timeout occurs, element not found - no CAPTCHA appeared
        console.log('CAPTCHA modal not detected, no solving needed.');
    }
    await setTimeout(35000);
     sendascreeshot(page,`${rand}end.png`);
}

module.exports = { getData, close_popup, getSonstiges, fillForm }
