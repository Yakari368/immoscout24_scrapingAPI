const express = require("express");
const { scrape,isAvailable, scrapeSonstiges, sendMessage,callWebhook } = require("./scraping/main");
const { sendTestEmail } = require('./test-email-send')


const app = express();
app.use(express.json()); // Middleware to parse JSON body

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.post("/scrape", async (req, res) => {
    const { url, Browser_WS } = req.body;
    
    // Validate URL
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            return res.status(400).json({ message: "Invalid URL: Must be HTTP or HTTPS" });
        }
    } catch (error) {
        return res.status(400).json({ message: "Invalid URL format" });
    }

    // Validate WSS URL
    try {
        const parsedWssUrl = new URL(Browser_WS);
        if (parsedWssUrl.protocol !== "wss:") {
            return res.status(400).json({ message: "Invalid WSS URL: Must start with wss://" });
        }
    } catch (error) {
        return res.status(400).json({ message: "Invalid WSS URL format" });
    }

    try {

        const data= await scrape(url,Browser_WS)
        res.json(data);
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: "Error accessing the URL" });
    }
});

app.post("/availability", async (req, res) => {
    const { url, Browser_WS } = req.body;
    
    // Validate URL
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            return res.status(400).json({ message: "Invalid URL: Must be HTTP or HTTPS" });
        }
    } catch (error) {
        return res.status(400).json({ message: "Invalid URL format" });
    }

    // Validate WSS URL
    try {
        const parsedWssUrl = new URL(Browser_WS);
        if (parsedWssUrl.protocol !== "wss:") {
            return res.status(400).json({ message: "Invalid WSS URL: Must start with wss://" });
        }
    } catch (error) {
        return res.status(400).json({ message: "Invalid WSS URL format" });
    }

    try {

        const data= await isAvailable(url,Browser_WS)
        res.json(data);
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: "Error accessing the URL" });
    }
});

app.post("/sonstiges", async (req, res) => {
    const { url, Browser_WS } = req.body;
    
    // Validate URL
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            return res.status(400).json({ message: "Invalid URL: Must be HTTP or HTTPS" });
        }
    } catch (error) {
        return res.status(400).json({ message: "Invalid URL format" });
    }

    // Validate WSS URL
    try {
        const parsedWssUrl = new URL(Browser_WS);
        if (parsedWssUrl.protocol !== "wss:") {
            return res.status(400).json({ message: "Invalid WSS URL: Must start with wss://" });
        }
    } catch (error) {
        return res.status(400).json({ message: "Invalid WSS URL format" });
    }

    try {

        const data= await scrapeSonstiges(url,Browser_WS)
        res.json(data);
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: "Error accessing the URL" });
    }
}); 

const textToHtml = (rawText) => {

    return  `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;">
    ${rawText.replace(/\n/g, '<br>')}
  </body>
</html>
`;
};

app.post("/sendMessage", async (req, res) => {
    const { url, Browser_WS,callBackWebhook,contactID, message, outreachStage, Salutation, Forename, Surname, Company, Email, phone,street,houseNumber,postcode,city, isTesting = false} = req.body;
    
    // Validate URL
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            return res.status(400).json({ message: "Invalid URL: Must be HTTP or HTTPS" });
        }
    } catch (error) {
        return res.status(400).json({ message: "Invalid URL format" });
    }

    // Validate WSS URL
    try {
        const parsedWssUrl = new URL(Browser_WS);
        if (parsedWssUrl.protocol !== "wss:") {
            return res.status(400).json({ message: "Invalid WSS URL: Must start with wss://" });
        }
    } catch (error) {
        return res.status(400).json({ message: "Invalid WSS URL format" });
    }

    try {
        res.status(200).send();
        
        const data= isTesting ?
        await sendTestEmail({subject: 'subject: Neue Nachricht', text: message, html: textToHtml(message), replyTo: Email}) 
        : await sendMessage(url,Browser_WS.replace('${sessionId}', `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`), message, Salutation, Forename, Surname, Company, Email, phone,street,houseNumber,postcode,city)
        callWebhook(callBackWebhook, {
            contactID,message,outreachStage,
            statue:data,
        })
    } catch (error) {
        console.log(error);
        callWebhook(callBackWebhook, {
            contactID,
            statue:'failed',
            error:error.message,
        })
    }
}); 
