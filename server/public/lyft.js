function GetLyftCost( tempStartLat,tempStartLong, tempEndLat,tempEndLong) {
        const proxyUrl = "";
        const dynamicUrl = "https://www.lyft.com/api/costs?start_lat=" + tempStartLat + "&start_lng=" + tempStartLong + "&end_lat=" + tempEndLat + "&end_lng=" + tempEndLong;
        console.log(proxyUrl+dynamicUrl);
        let h = new Headers();
        h.append('Accept', 'application/json');
        h.append('Content-Type', 'application/json');
        h.append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE');
        // h.append("Access-Control-Allow-Headers", 'origin, x-requested-with');
    
        let url = new Request(dynamicUrl, {
            method: 'GET',
            headers: h,
            mode: 'no-cors',
        });
    
        fetch(url) // with proxy
            .then(function(response) {
            console.log(responce.json());
                return response.json();
            })
            .then(function(data) {
                console.log(JSON.stringify(data));
                var minCost;
                var maxCost;
                var finalLyftCost;
                minCost = data.estimated_cost_cents_min; // Gets the minimum cost of ride
                maxCost = data.estimated_cost_cents_max; // Gets the maximum cost of ride
                finalLyftCost = 0.5 * (minCost + maxCost);
                $(data.forEach(function(index, value) {
                    console.log("Min lyft cost is" + minCost);
                    console.log("Max lyft cost is" + maxCost);
                    console.log("Total lyft cost is" + finalLyftCost);
                }));
            })
    
        .catch(err => {
            console.log("Unable to retrieve price data");
        });
    }

function GetLyftCost2( tempStartLat,tempStartLong, tempEndLat,tempEndLong) {
    const durl = "https://www.lyft.com/api/costs?start_lat=" + tempStartLat + "&start_lng=" + tempStartLong + "&end_lat=" + tempEndLat + "&end_lng=" + tempEndLong;
    
    let h = new Headers();
        h.append('Accept', 'application/json');
        h.append('Content-Type', 'application/json');
        h.append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE');
        // h.append("Access-Control-Allow-Headers", 'origin, x-requested-with');
    
        let url = new Request(dynamicUrl, {
            method: 'GET',
            headers: h,
            mode: 'no-cors',
        });
    


    fetch(url).then(responceHI => {
        console.log(responceHI);
    })
    .catch (err => {
        console.log(err+"error happened");
    });

    

    
}


GetLyftCost2(47.6076018,-122.3119244,47.6233218,-122.3636521);

