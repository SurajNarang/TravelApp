const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const app = express();
const rateLimit = require("express-rate-limit");

// Enabled for heroku reverse proxy
// app.set('trust proxy', 1);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests
    message: "Too many requests created from this IP, please try again in a half hour!"
});
app.use(apiLimiter);

// sets up server
app.listen(3000, () => console.log("Listening at Port 3000"));

// hosting files, serving from public directory
app.use(express.static("public"));

// call by hitting localhost:3000/lyft?startLat=47.6076018&startLong=-122.3119244&endLat=47.6233218&endLong=-122.3636521
app.get("/lyft", (req, response) => {

    console.log(req.url);
    const { startLat, startLong, endLat, endLong } = req.query;
    const url = `https://www.lyft.com/api/costs?start_lat=${startLat}&start_lng=${startLong}&end_lat=${endLat}&end_lng=${endLong}`;

    fetch(url)
        .then((r) => r.json())
        .then((r) => {
            let costEstimates = r.cost_estimates;
            let prices = costEstimates.map(item => ({ min: item.estimated_cost_cents_min, max: item.estimated_cost_cents_max, duration: item.estimated_duration_seconds }));
            return { standardPrice: (prices[0].min + prices[0].max) / 2, timeDuration: prices[0].duration, XLprice: (prices[1].min + prices[1].max) / 2 };
            // Combined array of standard & XL prices, time duration
        })

    .then(r => {
        response.setHeader("Access-Control-Allow-Origin", "https://localhost:3000");
        response.send(r);
        //response.status(200).send((r).toString());
    }).catch(err => {
        console.log("Unable to retrieve price data");
    })
});

app.use('/', express.static(path.join(__dirname, 'public')));