const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.listen(3000, () => console.log("Listening at Port 3000"));
app.use(express.static("public"));

// call by hitting localhost:3000/lyft?startLat=47.6076018&startLong=-122.3119244&endLat=47.6233218&endLong=-122.3636521
app.get("/lyft", (req, resp) => {
  const { startLat, startLong, endLat, endLong } = req.query;
  const url = `https://www.lyft.com/api/costs?start_lat=${startLat}&start_lng=${startLong}&end_lat=${endLat}&end_lng=${endLong}`;

  fetch(url)
    .then((r) => r.json())
    .then((r) => {
      resp.send(r);
    });
});
