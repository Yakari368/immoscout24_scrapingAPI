const puppeteer = require("puppeteer-core");
const { setTimeout } = require('node:timers/promises');

async function close_popup(page) {
    try {
        await setTimeout(35000);
        await page.waitForSelector('#usercentrics-root', { timeout: 60000 });
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
                        image = image.urls?.[0].url["@href"];
                            if (image) {
                                const endIndex = image.indexOf('ORIG');
                                gallery.push({
                                    "url": image.substring(0, endIndex).trim(),
                                });
                            }
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
                result['resultlist.realEstate'].courtage?.hasCourtage == 'YES' && features.push('has Courtage')
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
    // First, try to click the "show more" button if it exists and is visible
    try {
        // Wait for the grandfather div to be present
        await page.waitForSelector('div.content-section-first', { timeout: 5000 });
        
        // Check if show more button exists and is visible
        const showMoreExists = await page.evaluate(() => {
            const grandfatherDiv = document.querySelector('div.content-section-first');
            if (!grandfatherDiv) return false;
            
            const showMoreDiv = grandfatherDiv.querySelector('div.show-more');
            if (!showMoreDiv) return false;
            
            const style = window.getComputedStyle(showMoreDiv);
            return style.display !== 'none';
        });
        
        if (showMoreExists) {
            // Click using Puppeteer's click method (more reliable)
            await page.click('div.content-section-first div.show-more a.internal-link');
            // Wait for content to expand
            await setTimeout(1000);
        }
    } catch (error) {
        console.log('Show more button not found or not clickable:', error);
        // Continue anyway - maybe the button doesn't exist
    }
    const allText = await page.evaluate(() => {
        const grandfatherDiv = document.querySelector('div.content-section-first'); // Replace with your CSS selector
        return grandfatherDiv ? grandfatherDiv.textContent.trim().replace('\n', '').replace(/\s+/g, ' ').replace(/{[^}]*}/g, '').trim() : null;
    });
    return allText
}


async function fillForm(page, message, Salutation, Forename, Surname, Company, Email, phone,street,houseNumber,postcode,city) {

    try {
        console.log("loking for button...");
        await page.waitForSelector('button[data-testid="contact-button"]');
        console.log("clicking for button...");
        await page.click('button[data-testid="contact-button"]');    
    } catch (error) {
        throw new Error('problem showing the form');
    }
    

    console.log("filling the form...");

    try {
        try {
            await page.waitForSelector('#message', { timeout: 60000 });
        } catch (e) {
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
        if (await page.$('input[data-testid="street"]')) await page.type('input[data-testid="street"]', street);
        if (await page.$('input[data-testid="houseNumber"]')) await page.type('input[data-testid="houseNumber"]', houseNumber);
        if (await page.$('input[data-testid="postcode"]')) await page.type('input[data-testid="postcode"]', postcode);
        if (await page.$('input[data-testid="city"]')) await page.type('input[data-testid="city"]', city);
        console.log('filling form done');
        await page.waitForSelector('button[type="submit"].Button_button-primary__6QTnx');
        console.log("submiting form...");
        await page.click('button[type="submit"].Button_button-primary__6QTnx');
        console.log("form submited");
    } catch (e) {
        throw new Error('problem filling/submiting form');
    }

    try {
        // Check if CAPTCHA image exists inside the modal
        await page.waitForSelector('div.captcha-image-container.one-whole', { visible: true });
        console.log('CAPTCHA block detected.');
        return 'captcha';

    } catch (e) {
        console.log(e)
        try {
            await page.waitForSelector('#is24-expose-cosma-modal .StatusMessage_status-title__bNvQX');
            // Check if success message "Nachricht gesendet" is present
            const successMessage = await page.$eval(
                '#is24-expose-cosma-modal .StatusMessage_status-title__bNvQX',
                el => el.textContent.trim()
            ).catch(() => null);

            console.log('Success message:', successMessage);
            return 'success';

        } catch (e) {
            console.log(e)
            // If timeout occurs, element not found - no CAPTCHA appeared
            throw new Error('problem identifiying no captcha or success message detected');
        }

    }
}

module.exports = { getData, close_popup, getSonstiges, fillForm }
