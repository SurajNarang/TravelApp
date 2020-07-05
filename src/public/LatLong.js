var StartLongFinal;
var StartLatFinal;
var EndLongFinal;
var EndLatFinal;
var StartingAirportCode;
var EndingAirportCode;
var FlightCost;
var checkedNextDay = new Boolean(false);
const lufthansaKey = config.LUFT_KEY;
const skyScannerKey = config.SKYSCAN_KEY;
const mykey = config.MY_KEY;
document.write("\<script src='" + "https://maps.googleapis.com/maps/api/js?v=3.exp&amp;libraries=places&amp;key=" + encodeURIComponent(mykey) + "'\>\</script\>");


async function Overall() {
    await determiningLatLong();
    //GetFlightCost("PHL", "LAX");
}
Overall();

function printResult() {
    if ((StartLongFinal != null) && (StartLatFinal != null) && (EndLongFinal != null) && (EndLatFinal != null)) {
        console.log("all numbers found");
        console.log(StartLongFinal + " ," + StartLatFinal + " ," + EndLongFinal + " ," + EndLatFinal);
        GetFlightCost(StartingAirportCode, EndingAirportCode);
        GetLyftCost(StartLatFinal, StartLongFinal, EndLatFinal, EndLongFinal);
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

async function GetFlightCost() {
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

                    if (jresponce.Quotes.length > 1) {
                        let min = jresponce.Quotes[0];
                        for (let x = 0; x < jresponce.Quotes.length; x++) {
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

                                    if (jresponce2.Quotes.length > 1) {
                                        let min = jresponce2.Quotes[0];
                                        for (let x = 0; x < jresponce2.Quotes.length; x++) {
                                            let value = jresponce2.Quotes[x];
                                            min = (value < min) ? value : min
                                        }
                                        airlinePrice = min;
                                    }
                                    console.log(airlinePrice);
                                    document.getElementById('flightcost').innerHTML = "$" + airlinePrice;
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
                                    var message = "*No Flights Yet*"
                                    document.getElementById('flightcost').innerHTML = message.fontcolor("#00008B");
                                    // alert("There are no more flights available from your current address to your destination for for the current day nor the next day");
                                } else {
                                    const MinPriceForTm = jresponce3.Quotes[0].MinPrice;
                                    airlinePrice = MinPriceForTm;

                                    if (jresponce3.Quotes.length > 1) {
                                        let min = jresponce3.Quotes[0];
                                        for (let x = 0; x < jresponce3.Quotes.length; x++) {
                                            let value = jresponce3.Quotes[x];
                                            min = (value < min) ? value : min
                                        }
                                        airlinePrice = min;
                                    }
                                    console.log(airlinePrice);
                                    document.getElementById('flightcost').innerHTML = "$" + airlinePrice;
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

function GetLyftCost(tempStartLat, tempStartLong, tempEndLat, tempEndLong) {
    //ADD SOMETHING TO FIL IN HTML WHEN ROUTE IS TOO LONG
    if(getDistanceFromLatLonInKm(tempStartLat, tempStartLong, tempEndLat, tempEndLong) < 150){

    const dynamicUrl = "http://localhost:3000/lyft?startLat=" + tempStartLat + "&startLong=" + tempStartLong + "&endLat=" + tempEndLat + "&endLong=" + tempEndLong;
    // const dynamicUrl = "http://localhost:3000/lyft?startLat=47.6076018&startLong=-122.3119244&endLat=47.6233218&endLong=-122.3636521";

    fetch(dynamicUrl, {
            mode: "no-cors"
        })
        .then(r => r.json())
        .then((data) => {
            console.log("Lyft Price (dollars): " + data.price / 100);
            console.log("Duration of Trip (minutes): " + data.duration / 60);

            var standardPrice = addZeroes(data.standardPrice / 100);
            
            var XLprice = addZeroes(data.XLprice / 100);
            var finalDuration = data.timeDuration / 60;
            var standardDuration = Math.round(finalDuration);

            document.getElementById('lyftcost').innerHTML = "$" + standardPrice;
            document.getElementById('lyftXLcost').innerHTML = "$" + XLprice;
            document.getElementById('lyftduration').innerHTML = "~ " + standardDuration + " minutes";
            document.getElementById('uberduration').innerHTML = "~ " + standardDuration + " minutes";

        }).catch(err => {
            console.log("Unable to retrieve price data");
        });
    }
    document.getElementById('lyftcost').innerHTML = "***";
    document.getElementById('lyftXLcost').innerHTML = "***";
    document.getElementById('lyftduration').innerHTML = "***";
    document.getElementById('uberduration').innerHTML = "***";
}

function addZeroes(num) {
    // Cast as number
    var num = Number(num);
    // If there is no decimal, or the decimal is less than 2 digits, toFixed
    if (String(num).split(".").length < 2 || String(num).split(".")[1].length<=2 ){
        num = num.toFixed(2);
    }
    // Return the number
    return num;
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  
//   const fetch = require("node-fetch");

//   async function postData ( data = {} ){
  
//       url = 'https://www.uber.com/api/loadFEEstimates';
//       const response = await fetch(url, {
//           method: 'POST',
//           mode: 'cors',
//           headers: {
//               add: 'x-csrf-token: x'
//           },
//           body: {
//               'destination': {
//                   'id': 'AIzaSyDm_njKItPSYzr20AeYersiYRjyokfakXY',
//                   'latitude': '47.61344130000001',
//                   'locale':"en",
//                   'longitude': '-122.304172',
//                   "provider": "google_places"
//               },
//               'origin': {
//                   "id": "AIzaSyDm_njKItPSYzr20AeYersiYRjyokfakXY",
//                   "latitude": '47.6076018',
//                   "locale": "en",
//                   "longitude": '-122.3119244',
//                   "provider": "google_places"
//               }
//           },
//           body: JSON.stringify(data)
//       });
//       return response.json()
//   }
//   console.log(postData());
