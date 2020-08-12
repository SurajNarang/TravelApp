const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const app = express();
const rateLimit = require("express-rate-limit");
const layer = 'AIzaSyABIN4TNl44gDDYY4iD_Ql7Dwqsp936mKo';

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
    const {
        startLat,
        startLong,
        endLat,
        endLong
    } = req.query;
    const url = `https://www.lyft.com/api/costs?start_lat=${startLat}&start_lng=${startLong}&end_lat=${endLat}&end_lng=${endLong}`;

    fetch(url)
        .then((r) => r.json())
        .then((r) => {
            let costEstimates = r.cost_estimates;
            let prices = costEstimates.map(item => ({
                min: item.estimated_cost_cents_min,
                max: item.estimated_cost_cents_max,
                duration: item.estimated_duration_seconds
            }));
            return {
                standardPrice: (prices[0].min + prices[0].max) / 2,
                timeDuration: prices[0].duration,
                XLprice: (prices[1].min + prices[1].max) / 2
            };
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

app.get("/luftkey", (req, response) => {

    fetch("https://api.lufthansa.com/v1/oauth/token", {
            body: "client_id=yz6q8w4ppkd42xkhkvkddh8s&client_secret=5WHNjTWeFy&grant_type=client_credentials",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST"
        }).then(response => {
            return response.json().then(data => {
                var accessToken = data.access_token;
                lufthansaKey = "Bearer " + accessToken;
                return lufthansaKey;
            })
        })
        .then(r => {
            response.setHeader("Access-Control-Allow-Origin", "https://localhost:3000");
            response.send(r);
        }).catch(err => {
            console.log("Unable to send luft key");
        })
});

app.get("/getDistanceGoogle", (req, response) => {

    console.log(req.url);
    const {
        startLat,
        startLong,
        endLat,
        endLong
    } = req.query;
    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + startLat + ',' + startLong + '&destinations=' + endLat + ',' + endLong + '&key=' + layer;
    console.log(url)
    const test = fetch(url, {
        method: "GET",
        mode: "cors"
    }).then(response2 => {
        return response2.json().then(response => {
                const data = response;

                var data1 = (data.rows[0].elements[0].distance.text);
                data1.toString();
                var StringData = data1.substr(0, data1.indexOf(' '));

                var num = Number(StringData);
                console.log(addZeroes(num));
                return addZeroes(num);

            }).catch(err => {
                console.log(err);
            })

            .then(r => {
                response.setHeader("Access-Control-Allow-Origin", "https://localhost:3000");
                response.send(r);
            }).catch(err => {
                console.log("Unable to retrieve price data");
            })
    })
});

function addZeroes(num) {
    // Cast as number
    var num = Number(num);
    // If there is no decimal, or the decimal is less than 2 digits, toFixed
    if (String(num).split(".").length < 2 || String(num).split(".")[1].length <= 2) {
        num = num.toFixed(2);
    }
    // Return the number
    return num;
}

app.get("/getRouteDurationGoogle", (req, response) => {

    console.log(req.url);
    const {
        startLat,
        startLong,
        endLat,
        endLong
    } = req.query;

    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + startLat + ',' + startLong + '&destinations=' + endLat + ',' + endLong + '&key=' + layer;
    console.log(url)
    const test = fetch(url, {
        method: "GET",
        mode: "cors"
    }).then(response2 => {
        return response2.json().then(response => {
                const data = response;

                var data1 = (data.rows[0].elements[0].duration.text);
                var finalTime = data1.toString();
                console.log(finalTime);
                return finalTime;

            }).catch(err => {
                console.log(err);
            })

            .then(r => {
                response.setHeader("Access-Control-Allow-Origin", "https://localhost:3000");
                response.send(r);
                //response.status(200).send((r).toString());
            }).catch(err => {
                console.log("Unable to retrieve price data");
            })
    })
});

// app.get("/layer", (req, response) => {

//     console.log(layer1 + " server reached");


//     try {
//         response.setHeader("Access-Control-Allow-Origin", "https://localhost:3000");
//         response.json({key:layer1 });
//         // response.status(200).send((layer1).toString());

//         return layer1;
//     } catch {
//         console.log("Unable to deliver layer");

//     }
// })

app.use('/', express.static(path.join(__dirname, 'public')));