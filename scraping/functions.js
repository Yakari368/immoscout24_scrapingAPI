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
    const resultList = await page.evaluate(() => {
        const result = window.IS24 ? window.IS24.resultList.resultListModel.searchResponseModel : null;
        return result["resultlist.resultlist"].resultlistEntries[0].resultlistEntry
    });
    let resultObject = [];
    resultList.map((result, index) => {
        if (result['resultlist.realEstate'].privateOffer == 'true') {
            let gallery=[];
            result['resultlist.realEstate'].galleryAttachments.attachment.map(image=>{
                image = image.urls[0].url["@href"]
                const endIndex = image.indexOf('ORIG');
                gallery.push(image.substring(0, endIndex).trim())
            })
            
            

            resultObject.push(
                {
                    id: index,
                    title: result['resultlist.realEstate'].title,
                    address: result['resultlist.realEstate'].address,
                    contactDetails:result['resultlist.realEstate'].contactDetails,
                    gallery,
                    price: result['resultlist.realEstate'].price,
                    livingSpace: result['resultlist.realEstate'].livingSpace + 'm²',
                    numberOfRooms: result['resultlist.realEstate'].numberOfRooms ,
                    constructionYear: result['resultlist.realEstate'].constructionYear,
                    estateInfo:{
                        builtInKitchen: result['resultlist.realEstate'].builtInKitchen,
                        balcony: result['resultlist.realEstate'].balcony,
                        garden: result['resultlist.realEstate'].garden,
                        hasCourtage: result['resultlist.realEstate'].courtage.hasCourtage,
                        lift: result['resultlist.realEstate'].lift,
                        guestToilet: result['resultlist.realEstate'].guestToilet,
                        cellar: result['resultlist.realEstate'].cellar,
                        isBarrierFree: result['resultlist.realEstate'].isBarrierFree,
                    },
                    monthlyRate:result['resultlist.realEstate'].monthlyRate,
                    modificationDate: result["@modification"],
                })
        }
    })
    return resultObject
}

module.exports = {getData,close_popup}