var StartLongFinal;
var StartLatFinal;
var EndLongFinal;
var EndLatFinal;
var StartingAirportCode;
var EndingAirportCode;
var FlightCost;
var checkedNextDay = new Boolean(false);
const lufthansaKey = 'Bearer 9xxw44dh98m5n7ubjqursp96';
const skyScannerKey = "f2a0fe483cmsh6dc8cbd8fda93d4p1035a1jsn72c0097275c9";
 
async function Overall() {
   // await determiningLatLong();
   surajUber();
   // surajLyft(39.82552846,-75.49414158,39.83225175,-75.55525303)
}
Overall();

function printResult() {
    if ((StartLongFinal != null) && (StartLatFinal != null) && (EndLongFinal != null) && (EndLatFinal != null)) {
        console.log("all numbers found");
        console.log(StartLongFinal + " ," + StartLatFinal + " ," + EndLongFinal + " ," + EndLatFinal);
        GetFlightCost(StartingAirportCode, EndingAirportCode);
    }

}
async function determiningLatLong() {
    var searchInput = 'search_input';
    var searchInput2 = 'search_input2';

    // Start location autocomplete method
    $(document).ready(function() {
        var autocomplete;
        autocomplete = new google.maps.places.Autocomplete((document.getElementById(searchInput)), {
            types: ['geocode'],
            // Restricts user input to America location 
            componentRestrictions: {
                country: 'USA',
            }
        });

        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            var near_place = autocomplete.getPlace();
            document.getElementById('loc_lat').value = near_place.geometry.location.lat();
            document.getElementById('loc_long').value = near_place.geometry.location.lng();
            document.getElementById('loc_startflight').value = StartingAirportCode;

            // Updates Latitude and Longitude
            document.getElementById('startlatitude_view').innerHTML = near_place.geometry.location.lat();
            document.getElementById('startlongitude_view').innerHTML = near_place.geometry.location.lng();
            console.log(near_place.geometry.location.lat());
            console.log(near_place.geometry.location.lng());
            StartLongFinal = near_place.geometry.location.lng();
            StartLatFinal = near_place.geometry.location.lat();
            GetNearestStartingAirport(StartLatFinal, StartLongFinal);
            document.getElementById('startnearestairport').innerHTML = StartingAirportCode;

            //printResult();

        });
    });

    $(document).on('change', '#' + searchInput, function() {
        document.getElementById('startlatitude_view').innerHTML = '';
        document.getElementById('startlongitude_view').innerHTML = '';
        document.getElementById('startnearestairport').innerHTML = '';
    });

    // Final location autocomplete method
    $(document).ready(function() {
        var autocomplete;
        autocomplete = new google.maps.places.Autocomplete((document.getElementById(searchInput2)), {
            types: ['geocode'],
            // Restricts user input to America location 
            componentRestrictions: {
                country: 'USA',
            }
        });

        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            var near_place = autocomplete.getPlace();
            document.getElementById('loc_lat').value = near_place.geometry.location.lat();
            document.getElementById('loc_long').value = near_place.geometry.location.lng();
            document.getElementById('loc_endflight').value = EndingAirportCode;

            // Updates Latitude and Longitude
            document.getElementById('endlatitude_view').innerHTML = near_place.geometry.location.lat();
            document.getElementById('endlongitude_view').innerHTML = near_place.geometry.location.lng();
            console.log(near_place.geometry.location.lat());
            console.log(near_place.geometry.location.lng());
            EndLatFinal = near_place.geometry.location.lat();
            EndLongFinal = near_place.geometry.location.lng();
            EndingAirportCode = GetNearestEndingAirport(EndLatFinal, EndLongFinal);
            document.getElementById('endnearestairport').innerHTML = EndingAirportCode;


            printResult();
        });
    });

    $(document).on('change', '#' + searchInput, function() {
        document.getElementById('endlatitude_view').innerHTML = '';
        document.getElementById('endlongitude_view').innerHTML = '';
        document.getElementById('endnearestairport').innerHTML = '';
    });
}


function GetNearestStartingAirport(LatFinal, LongFinal) {
    fetch("https://api.lufthansa.com/v1/references/airports/nearest/" + LatFinal + "," + LongFinal, {
            "method": "GET",
            "headers": {
                Accept: 'application/json',
                Authorization: lufthansaKey
            }
        })
        .then(response => {
            const test = response.json().then(response2 => {
                    const test1 = response2.NearestAirportResource.Airports.Airport[0].AirportCode;
                    console.log(test1 + " - Starting airport");
                    var CurrentAirport = test1;
                    StartingAirportCode = CurrentAirport;
                    document.getElementById('startnearestairport').innerHTML = StartingAirportCode;
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
}

function GetNearestEndingAirport(LatFinal1, LongFinal1) {

    fetch("https://api.lufthansa.com/v1/references/airports/nearest/" + LatFinal1 + "," + LongFinal1, {
            "method": "GET",
            "headers": {
                Accept: 'application/json',
                Authorization: lufthansaKey
            }
        })
        .then(response => {
            const test = response.json().then(response2 => {
                    EndingAirportCode = response2.NearestAirportResource.Airports.Airport[0].AirportCode;
                    console.log('Taking a break...');
                    //sleep(4000);
                    console.log(EndingAirportCode + " -Destination airport");
                    //  var CurrentAirport = test1;
                    //  EndingAirportCode = CurrentAirport;
                    document.getElementById('endnearestairport').innerHTML = EndingAirportCode;

                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



async function GetFlightCost(startCode, endCode) {
    if (StartingAirportCode == undefined || EndingAirportCode == undefined) {

        console.log('Taking a break...');
        await sleep(4000);

    }
    console.log("cost in running");
    var skipDay = 0;
    var skipMonth = 0;
    var skipYear = 0;
    var todayDate = new Date();
    var dd = String(todayDate.getDate() + skipDay).padStart(2, '0');
    var mm = String(todayDate.getMonth() + 1 + skipMonth).padStart(2, '0'); //January is 0!
    var yyyy = todayDate.getFullYear() + skipYear;
    checkedNextDay = new Boolean(false);
    var airlinePrice;
    todayDate = yyyy + '-' + mm + '-' + dd;
    todayDate = todayDate.toString();

    fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" + StartingAirportCode + "-sky/" + EndingAirportCode + "-sky/" + todayDate, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
                "x-rapidapi-key": skyScannerKey
            }
        })
        .then(response => {
            const data = response.json();
            data.then(jresponce => {
                    console.log(jresponce);
                    const minPriceToday = jresponce.Quotes[0].MinPrice;
                    airlinePrice = minPriceToday;
                   
                    if(jresponce.Quotes.length > 1){
                        let min = jresponce.Quotes[0];
                        for(let x=0;x<jresponce.Quotes.length;x++){
                            let value = jresponce.Quotes[x];
                            min = (value < min) ? value : min
                        }
                        airlinePrice = min;
                    }
                    console.log(airlinePrice);
                    if (jresponce.Quotes.length === 0) {
                        console.log("Attention Attention, we must check the mext day")
                        var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
                        var day = String(currentDate.getDate()).padStart(2, '0');
                        var month = String(currentDate.getMonth() + 1).padStart(2, '0');
                        var year = currentDate.getFullYear();
                        const tommorowDate = year + '-' + month + '-' + day;
                        tommorowDate = tommorowDate.toString();
                        console.log(tommorowDate);
                        checkedNextDay = true;

                        fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" + StartingAirportCode + "-sky/" + EndingAirportCode + "-sky/" + tommorowDate, {
                                "method": "GET",
                                "headers": {
                                    "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
                                    "x-rapidapi-key": skyScannerKey
                                }
                            })
                            .then(responce2 => {
                                const data2 = responce2.json();
                                data2.then(jresponce2 => {
                                    const MinPriceForTm = jresponce2.Quotes[0].MinPrice;
                                    airlinePrice = MinPriceForTm;
                                   
                                    if(jresponce2.Quotes.length > 1){
                                        let min = jresponce2.Quotes[0];
                                        for(let x=0;x<jresponce2.Quotes.length;x++){
                                            let value = jresponce2.Quotes[x];
                                            min = (value < min) ? value : min
                                        }
                                        airlinePrice = min;
                                    }
                                    console.log(airlinePrice);
                                    document.getElementById('flightcost').value = airlinePrice;
                                })
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    }

                })
                .catch(error => {
                    console.log(" 2nd catch error occurred");
                    var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
                    var day = String(currentDate.getDate()).padStart(2, '0');
                    var month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    var year = currentDate.getFullYear();
                    const tommorowDate = year + '-' + month + '-' + day;
                    //tommorowDate = tommorowDate.toString();
                    console.log(tommorowDate);
                    checkedNextDay = true;

                    fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" + StartingAirportCode + "-sky/" + EndingAirportCode + "-sky/" + tommorowDate, {
                            "method": "GET",
                            "headers": {
                                "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
                                "x-rapidapi-key": skyScannerKey
                            }
                        })
                        .then(responce2 => {
                            const data2 = responce2.json();
                            data2.then(jresponce3 => {
                                if ((jresponce3.Quotes.length) == 0) {
                                    alert("There are no more flights available from your current address to your destination for for the current day nor the next day");
                                } else {
                                    const MinPriceForTm = jresponce3.Quotes[0].MinPrice;
                                    airlinePrice = MinPriceForTm;
                                    
                                    if(jresponce3.Quotes.length > 1){
                                        let min = jresponce3.Quotes[0];
                                        for(let x=0;x<jresponce3.Quotes.length;x++){
                                            let value = jresponce3.Quotes[x];
                                            min = (value < min) ? value : min
                                        }
                                        airlinePrice = min;
                                    }
                                    console.log(airlinePrice);
                                    checkedNextDay = true;
                                }
                            })
                        })
                        .catch(err => {
                            console.log("error error");
                        });
                });
        })
        .catch(err => {
            console.log(" an error occurred");
        });



}

function LyftCost(tempStartLong, tempStartLat, tempEndLong, tempEndLat) {
    const puppeteer = require('puppeteer');

    (async() => {
        let url = "https://www.lyft.com/api/costs?start_lat=" + tempStartLat + "&start_lng=" + tempStartLong + "&end_lat=" + tempEndLat + "&end_lng=" + tempEndLong;

        let browser = await puppeteer.launch({ headless: false });
        let page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle2' });

        let data = await page.evaluate(() => {
            let cost = document.querySelector('estimated_costs_per_max').innerText;

            return {
                cost
            }
        });

        console.log(data);

        await browser.close();

    })();
}

function surajLyft(tempStartLat,tempStartLong,tempEndLat,tempEndLong){
    var url = "https://www.lyft.com/api/costs?start_lat="+tempStartLat+"&start_lng="+tempStartLong+"&end_lat="+tempEndLat+"&end_lng="+tempEndLong;
    console.log(url)
    let result = loadjson(url);
    console.log(result);
    

    // $.getJSON(url,function(data){
    //     console.log("inside the function");
    // });
//     fetch(url)
//   .then(response => response.json())
//   .then(data => console.log(data));
    // (async () => {
    //     const response = await fetch(url);
    //     const json = await response.json();
    //     console.log(JSON.stringify(json));
    //   })()
}

function surajUber(){


    const url = 'https://api.uber.com/v1.2/estimates/price?start_latitude=37.7752315&start_longitude=-122.418075&end_latitude=37.7752415&end_longitude=-122.518075';
    const token = 'JA.VUNmGAAAAAAAEgASAAAABwAIAAwAAAAAAAAAEgAAAAAAAAH4AAAAFAAAAAAADgAQAAQAAAAIAAwAAAAOAAAAzAAAABwAAAAEAAAAEAAAAAGJNrD2_tlyd-NxbJ3aSOCnAAAAleauBT3ouw70YBYbKYFVYtTauU0iHOBauhBpJo2533LWjHxcdE-9ivL_KWs3JG1Dz9EIea4jAmMv30HUAj3KNb79S_eD2j1mJ25gOmWttocL-6PWSMAIfZU3v0Lc30MAdpPbfPcdDGN4CYrv5XZOvguuCC6YNGXAZAhMi-Eah75hoKr8IBTk6J7FpGS5XUHuE3EzMjIz8TmQW60ichNWJYpzLmrTp3UADAAAAIFEkqGyU7_nBQ36GiQAAABiMGQ4NTgwMy0zOGEwLTQyYjMtODA2ZS03YTRjZjhlMTk2ZWU';
    
    fetch(url, {
        "method": "GET",
        "headers": {
            'Accept-Language': 'en_US',
            'Authorization': token,
            'Content-Type': 'application/json',
            'Access-Control-Allow-Methods': 'GET',
        }
    
    }).then(responceHI => {
        console.log(responceHI);
    })
    .catch (err => {
        console.log(err);
    });


    // UBER 
    // POST "https://www.uber.com/api/loadFEEstimates" 
    // HEADER add "x-csrf-token: x" 
    // BODY {  
    //     "destination": 
    //     { "id": "ChIJgb8Ht9BqkFQR7Xm7qmRD4KM",
    //      "latitude": 47.61344130000001,
    //       "locale": "en",
    //        "longitude": -122.304172,
    //         "provider": "google_places" },
    //          "origin": 
    //          { "id": "ChIJN4LWxsVqkFQR1LE-hB6E4GY",
    //           "latitude": 47.6076018,
    //            "locale": "en",
    //             "longitude": -122.3119244,
    //              "provider": "google_places" 
    //             }
    //          }
}