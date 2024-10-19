const puppeteer = require("puppeteer-core");

async function close_popup(page) {
    try {
        const close_btn = await page.waitForSelector('button[data-testid="uc-accept-all-button"]', { timeout: 25000, visible: true });
        console.log("Popup appeared! Closing...");
        await close_btn.click();
        console.log("Popup closed!");
    } catch (e) {
        console.log("Popup didn't appear.");
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
                const attachment = result['resultlist.realEstate'].galleryAttachments.attachment
                if (Array.isArray(attachment)) {
                    attachment.map(image => {
                        image = image.urls[0].url["@href"]
                        const endIndex = image.indexOf('ORIG');
                        gallery.push(image.substring(0, endIndex).trim())

                    })
                } else if (attachment.urls) {
                    const image = attachment.urls[0].url["@href"]
                    const endIndex = image.indexOf('ORIG');
                    gallery.push(image.substring(0, endIndex).trim())
                }

                let features=[]
                result['resultlist.realEstate'].builtInKitchen == 'true' && features.push(result['resultlist.realEstate'].builtInKitchen)
                result['resultlist.realEstate'].balcony == 'true' && features.push(result['resultlist.realEstate'].balcony)
                result['resultlist.realEstate'].garden == 'true' && features.push(result['resultlist.realEstate'].courtage.hasCourtage)
                result['resultlist.realEstate'].courtage.hasCourtage == 'YES' && features.push(result['resultlist.realEstate'].)
                result['resultlist.realEstate'].lift == 'true' && features.push(result['resultlist.realEstate'].lift)
                result['resultlist.realEstate'].guestToilet == 'true' && features.push(result['resultlist.realEstate'].guestToilet)
                result['resultlist.realEstate'].cellar == 'true' && features.push(result['resultlist.realEstate'].cellar)
                result['resultlist.realEstate'].isBarrierFree == 'true' & features.push(result['resultlist.realEstate'].isBarrierFree)

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
                        estateInfo:features,
                        monthlyRate: result['resultlist.realEstate'].monthlyRate,
                        modificationDate: result["@modification"],
                    })
            }
        })
        
        return resultObject
    } catch (error) {
        console.log(error);
        
        return new Error(error)
    }

}

module.exports = { getData, close_popup }