const express = require("express");
const { scrape } = require("./scraping/main");


const app = express();
app.use(express.json()); // Middleware to parse JSON body

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.post("/scrape", async (req, res) => {
    const { url, Browser_WS } = req.body;
    console.log(req.body);
    
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