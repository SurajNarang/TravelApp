const express = require("express");
const fetch = require("node-fetch");
const path = require('path');
const app = express();

// sets up server
app.listen(3000, () => console.log("Listening at Port 3000"));

// hosting files, serving from public directory
app.use(express.static("public"));



// call by hitting localhost:3000/lyft?startLat=47.6076018&startLong=-122.3119244&endLat=47.6233218&endLong=-122.3636521
app.get("/lyft", (req, response) => {
  console.log(req.url);
  const {  startLat, startLong, endLat, endLong } = req.query;
  const url = `https://www.lyft.com/api/costs?start_lat=${startLat}&start_lng=${startLong}&end_lat=${endLat}&end_lng=${endLong}`;

  fetch(url)
    .then((r) => r.json())
    .then((r) => {
      let costEstimates = r.cost_estimates;
      let prices = costEstimates.map(item=>({min:item.estimated_cost_cents_min, max: item.estimated_cost_cents_max}));
      return { price: (prices[0].min + prices[0].max)/2};
      // let min = costEstimates.map(item1 => (item1.estimated_cost_cents_min));
      // let max = costEstimates.map(item2 => (item2.estimated_cost_cents_max));

      // let stringMin = min.toString();
      // let minLyftCost = stringMin.substr(0, stringMin.indexOf(','));
      // let num1 = parseInt(minLyftCost, 10);

      // let stringMax = max.toString();
      // let maxLyftCost = stringMax.substr(0, stringMax.indexOf(','));
      // let num2 = parseInt(maxLyftCost, 10);

      // var finalCost = 0.5 * (num1 + num2);
      // return finalCost;

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
