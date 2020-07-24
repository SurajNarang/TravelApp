var StartLongFinal;
var StartLatFinal;
var EndLongFinal;
var EndLatFinal;
var StartingAirportCode;
var EndingAirportCode;
var FlightCost;
var StartLocPlaceID;
var EndLocPlaceID;
var RouteTooFar = new Boolean(true);
var checkedNextDay = new Boolean(false);

// Credentials
var lufthansaKey = 'Bearer e77g7fattdps7cwqaxeqd7e4';
const clientID = config.CLIENT_ID;
const clientSec = config.CLIENT_SECRET;
const skyScannerKey = config.SKYSCAN_KEY;
const mykey = config.GOOGLE_KEY;

document.write("\<script src='" + "https://maps.googleapis.com/maps/api/js?v=3.exp&amp;libraries=places&amp;key=" + encodeURIComponent(mykey) + "'\>\</script\>");


async function Overall() { 
       await fetchCalc();

    await determiningLatLong();
    //GetFlightCost("PHL", "LAX");
    //getDistanceGoogle(37.7752315, -122.418075, 37.7752415, -122.518075);
}
Overall();

async function printResult() {
    
    if ((StartLongFinal != null) && (StartLatFinal != null) && (EndLongFinal != null) && (EndLatFinal != null)) {
        console.log("all numbers found");
        console.log(StartLongFinal + " ," + StartLatFinal + " ," + EndLongFinal + " ," + EndLatFinal);
        console.log("Here is the current LUFT key: " + lufthansaKey);
        await GetLyftCost(StartLatFinal, StartLongFinal, EndLatFinal, EndLongFinal);
        await GetFlightCost(StartingAirportCode, EndingAirportCode);
        await GetUberCost(StartLatFinal, StartLongFinal, EndLatFinal, EndLongFinal, StartLocPlaceID, EndLocPlaceID);

        checkIfSameAirport();
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

            var geocoder1 = new google.maps.Geocoder;
            var latlng = {
                lat: Number(StartLatFinal),
                lng: Number(StartLongFinal)
            };

            geocoder1.geocode({
                'location': latlng
            }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        StartLocPlaceID = results[1].place_id;
                        console.log("Origin Place ID: " + StartLocPlaceID);
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });

            // printResult();

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

            var geocoder2 = new google.maps.Geocoder;
            var latlng = {
                lat: Number(EndLatFinal),
                lng: Number(EndLongFinal)
            };

            geocoder2.geocode({
                'location': latlng
            }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        EndLocPlaceID = results[1].place_id;
                        console.log("Destination Place ID: " + EndLocPlaceID);
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });

            $(document).ready(function() {
                $('#clickMe').click(function() {
                    $("#display_loading").show();

                    setTimeout(function() {

                        document.getElementById("display_loading").style.display = "none";
                    }, 8000);

                    printResult();
                });

            });

        });
    });

    $(document).on('change', '#' + searchInput, function() {
        document.getElementById('endlatitude_view').innerHTML = '';
        document.getElementById('endlongitude_view').innerHTML = '';
        document.getElementById('endnearestairport').innerHTML = '';
    });
}

function hideGif() {

    show = function() {
            myDiv.style.display = "block";
            setTimeout(hide, 5000); // 5 seconds
        },

        hide = function() {
            myDiv.style.display = "none";
        };

    show();
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
                    // document.getElementById('startnearestairport').innerHTML = StartingAirportCode;
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
                    // document.getElementById('endnearestairport').innerHTML = EndingAirportCode;

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
        await sleep(500);

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
                        let min = jresponce.Quotes[0].MinPrice;
                        for (let x = 0; x < jresponce.Quotes.length; x++) {
                            let value = jresponce.Quotes[x].MinPrice;
                            min = (value < min) ? value : min
                        }
                        airlinePrice = min;
                    }

                    // Getting the Carrier ID associated with min price
                    var CarrierID = jresponce3.Quotes[0].OutboundLeg.CarrierIds;
                    var date = jresponce3.Quotes[0].QuoteDateTime;


                    for (let y = 0; y < jresponce3.Quotes.length; y++) {
                        let value = jresponce3.Quotes[y].MinPrice;
                        if (value = airlinePrice) {
                            CarrierID = jresponce3.Quotes[y].OutboundLeg.CarrierIds;
                            date = jresponce3.Quotes[y].QuoteDateTime;
                        }
                    }
                    console.log("Carrier ID: " + CarrierID);

                    // Getting Airline Name associated with min price

                    var AirLineName = jresponce3.Carriers[0].CarrierId;
                    for (let z = 0; z < jresponce3.Carriers.length; z++) {
                        let id = jresponce3.Carriers[z].CarrierId;
                        if (id = CarrierID) {
                            AirLineName = jresponce3.Carriers[z].Name;
                        }
                    }

                    // Getting rid of the T separator between the date and time
                    date.toString();

                    var StringDate = date.substr(0, date.indexOf('T'));
                    var StringTime = date.substr(date.indexOf('T') + 1);
                    console.log("Airline Price: " + airlinePrice);
                    console.log("Airline Date & Time: " + StringDate + ", " + StringTime)
                    console.log("Airline Name: " + AirLineName);

                    document.getElementById('flightcost').innerHTML = "$" + airlinePrice;
                    document.getElementById('flightdate').innerHTML = StringDate + ", " + StringTime;
                    document.getElementById('airline').innerHTML = AirLineName;

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
                                        let min = jresponce2.Quotes[0].MinPrice;
                                        for (let x = 0; x < jresponce2.Quotes.length; x++) {
                                            let value = jresponce2.Quotes[x].MinPrice;
                                            min = (value < min) ? value : min
                                        }
                                        airlinePrice = min;
                                    }
                                    // Getting the Carrier ID associated with min price
                                    var CarrierID = jresponce3.Quotes[0].OutboundLeg.CarrierIds;
                                    var date = jresponce3.Quotes[0].QuoteDateTime;


                                    for (let y = 0; y < jresponce3.Quotes.length; y++) {
                                        let value = jresponce3.Quotes[y].MinPrice;
                                        if (value = airlinePrice) {
                                            CarrierID = jresponce3.Quotes[y].OutboundLeg.CarrierIds;
                                            date = jresponce3.Quotes[y].QuoteDateTime;
                                        }
                                    }
                                    console.log("Carrier ID: " + CarrierID);

                                    // Getting Airline Name associated with min price

                                    var AirLineName = jresponce3.Carriers[0].CarrierId;
                                    for (let z = 0; z < jresponce3.Carriers.length; z++) {
                                        let id = jresponce3.Carriers[z].CarrierId;
                                        if (id = CarrierID) {
                                            AirLineName = jresponce3.Carriers[z].Name;
                                        }
                                    }

                                    // Getting rid of the T separator between the date and time
                                    date.toString();

                                    var StringDate = date.substr(0, date.indexOf('T'));
                                    var StringTime = date.substr(date.indexOf('T') + 1);
                                    console.log("Airline Price: " + airlinePrice);
                                    console.log("Airline Date & Time: " + StringDate + ", " + StringTime)
                                    console.log("Airline Name: " + AirLineName);

                                    document.getElementById('flightcost').innerHTML = "$" + airlinePrice;
                                    document.getElementById('flightdate').innerHTML = StringDate + ", " + StringTime;
                                    document.getElementById('airline').innerHTML = AirLineName;
                                })
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    }

                })
                .catch(error => {
                    console.log(" 2nd catch error occurred");
                    var currentDate = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
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
                                    var NAmessage = "N/A"
                                    document.getElementById('flightcost').innerHTML = message.fontcolor("#00008B").fontsize(2.5);
                                    document.getElementById('flightdate').innerHTML = NAmessage.fontcolor("#00008B");
                                    document.getElementById('airline').innerHTML = NAmessage.fontcolor("#00008B");
                                    // alert("There are no more flights available from your current address to your destination for for the current day nor the next day");
                                } else {
                                    const MinPriceForTm = jresponce3.Quotes[0].MinPrice;
                                    airlinePrice = MinPriceForTm;

                                    // Gets the minimum airline price
                                    if (jresponce3.Quotes.length > 1) {
                                        let min = jresponce3.Quotes[0].MinPrice;
                                        for (let x = 0; x < jresponce3.Quotes.length; x++) {
                                            let value = jresponce3.Quotes[x].MinPrice;
                                            min = (value < min) ? value : min
                                        }
                                        airlinePrice = min;
                                    }

                                    // Getting the Carrier ID associated with min price
                                    var CarrierID = jresponce3.Quotes[0].OutboundLeg.CarrierIds;
                                    var date = jresponce3.Quotes[0].QuoteDateTime;


                                    for (let y = 0; y < jresponce3.Quotes.length; y++) {
                                        let value = jresponce3.Quotes[y].MinPrice;
                                        if (value = airlinePrice) {
                                            CarrierID = jresponce3.Quotes[y].OutboundLeg.CarrierIds;
                                            date = jresponce3.Quotes[y].QuoteDateTime;
                                        }
                                    }
                                    console.log("Carrier ID: " + CarrierID);

                                    // Getting Airline Name associated with min price

                                    var AirLineName = jresponce3.Carriers[0].CarrierId;
                                    for (let z = 0; z < jresponce3.Carriers.length; z++) {
                                        let id = jresponce3.Carriers[z].CarrierId;
                                        if (id = CarrierID) {
                                            AirLineName = jresponce3.Carriers[z].Name;
                                        }
                                    }

                                    // Getting rid of the T separator between the date and time
                                    date.toString();

                                    var StringDate = date.substr(0, date.indexOf('T'));
                                    var StringTime = date.substr(date.indexOf('T') + 1);
                                    console.log("Airline Price: " + airlinePrice);
                                    console.log("Airline Date & Time: " + StringDate + ", " + StringTime)
                                    console.log("Airline Name: " + AirLineName);

                                    document.getElementById('flightcost').innerHTML = "$" + airlinePrice;
                                    document.getElementById('flightdate').innerHTML = StringDate + ", " + StringTime;
                                    document.getElementById('airline').innerHTML = AirLineName;
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

async function GetLyftCost(lyftStartLat, lyftStartLong, lyftEndLat, lyftEndLong) {

    const travelMiles = await getDistanceGoogle(lyftStartLat, lyftStartLong, lyftEndLat, lyftEndLong);
    console.log(travelMiles + " Travel Miles");
    if (travelMiles < 150 && typeof travelMiles !== 'undefined') {

        RouteTooFar = false;
        const dynamicUrl = "/lyft?startLat=" + lyftStartLat + "&startLong=" + lyftStartLong + "&endLat=" + lyftEndLat + "&endLong=" + lyftEndLong;
        // const dynamicUrl = "http://localhost:3000/lyft?startLat=47.6076018&startLong=-122.3119244&endLat=47.6233218&endLong=-122.3636521";

        await fetch(dynamicUrl, {
                mode: "no-cors"
            })
            .then(r => r.json())
            .then(async(data) => {
                const routeTime = await getRouteDurationGoogle(lyftStartLat, lyftStartLong, lyftEndLat, lyftEndLong);
                console.log("Route time: " + routeTime);

                var price1 = data.price / 100;
                console.log("Lyft Price (dollars): " + price1);
                console.log("Duration of Trip (minutes): " + routeTime);

                var standardPrice = addZeroes(data.standardPrice / 100);

                var XLprice = addZeroes(data.XLprice / 100);
                var finalDuration = routeTime;

                document.getElementById('lyftcost').innerHTML = "$" + standardPrice;
                document.getElementById('lyftXLcost').innerHTML = "$" + XLprice;
                document.getElementById('lyftduration').innerHTML = "~ " + finalDuration;
                document.getElementById('uberduration').innerHTML = "~ " + finalDuration;
                document.getElementById('uberdistance').innerHTML = "~ " + travelMiles + " miles";
                document.getElementById('lyftdistance').innerHTML = "~ " + travelMiles + " miles";

            }).catch(err => {
                console.log("Unable to retrieve price data");
            });
    } else {
        document.getElementById('lyftcost').innerHTML = "***";
        document.getElementById('lyftXLcost').innerHTML = "***";
        document.getElementById('lyftduration').innerHTML = "***";
        document.getElementById('uberduration').innerHTML = "***";
        document.getElementById('uberdistance').innerHTML = "***";
        document.getElementById('lyftdistance').innerHTML = "***";

        if (RouteTooFar == true) {
            var boldText = "***"
            boldText = boldText.bold();
            document.getElementById('route').innerHTML = boldText + " = This route is not accessible by Uber/Lyft ( > 150 miles)";
        }
    }
}

async function fetchCalc() {

    const NewToken = await fetch("https://api.lufthansa.com/v1/oauth/token", {
        body: "client_id=yz6q8w4ppkd42xkhkvkddh8s&client_secret=5WHNjTWeFy&grant_type=client_credentials",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST"
    }).then(responce => {
        responce.json().then(data => {
            var accessToken = data.access_token;
            var expiresIn = data.expires_in;
            lufthansaKey = "Bearer "+accessToken;
            console.log("Refreshed token: " + accessToken);
            console.log("Token expires in: " + expiresIn);
           // writeToken(accessToken, expires_in);
        })
    }).catch(err => {
        console.log(err)
    });

    return NewToken;
}

// async function writeToken(access_token, expires_in) {
//     const customer = {
//         "luftkey": access_token,
//         "expiresin": expires_in
//     }

//     const jsonString = JSON.stringify(customer)
//     console.log(jsonString)
// }

// fs.writeFile('keys.json', jsonString, err => {
//     if (err) {
//         console.log('Error writing file', err)
//     } else {
//         console.log('Successfully wrote file')
//     }
// })

// Regenerates token every 36 hours

// setInterval(async function() {
//     await fetchCalc();
// }, 3600000);
//129600000 = 36 hours

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

async function getDistanceGoogle(lat1, lon1, lat2, lon2) {

    url = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + lat1 + ',' + lon1 + '&destinations=' + lat2 + ',' + lon2 + '&key=' + mykey;
    console.log(url);
    const test = await fetch(url, {
        method: "GET",
        mode: "cors"
    }).then(async response => {
        console.log("Response", response)

        const data = await response.json();
        var data1 = (data.rows[0].elements[0].distance.text);
        console.log(data1 + " data1");
        data1.toString();
        var StringData = data1.substr(0, data1.indexOf(' '));

        var num = Number(StringData);
        console.log("DISTANCE METHOD: " + num);
        return addZeroes(num);

    }).catch(err => {
        console.log(err);
    })

    return test;
}

async function getRouteDurationGoogle(lat1, lon1, lat2, lon2) {

    url = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + lat1 + ',' + lon1 + '&destinations=' + lat2 + ',' + lon2 + '&key=' + mykey;
    const duration = await fetch(url, {
            method: "GET",
            mode: "cors"
        }).then(response => response.json())
        .then((data) => {
            var time = (data.rows[0].elements[0].duration.text);
            console.log("TIME METHOD" + time);
            return time;
        }).catch(err => {
            console.log(err);
        });

    return duration;
}

// try {
//     const uberFetch = await ...
//     // uberFetch should have the response object
//     // make sure call is successful 
//     // can use .status === 200 or .ok 
//     if (uberFetch.ok){
//     // deserialize json response 
//     const data = await uberFetch.json()
//     // we are all good return data 
//     return { uberX : data...total, uberXl: data...total }
//     } else {
//     // non 2xx status code 
//     console.log("Status code", uberFetch.status)
//     }
//     } catch(err){
//     console.log("An error occurred", err)
//     }
//     // if we are here something went wrong
//     // return empty result possibly retry later
//     return { uberX : 0, uberXl: 0 }


async function GetUberCost(uberStartLat, uberStartLong, uberEndLat, uberEndLong, startID, endID) {
    const travelMiles = await getDistanceGoogle(uberStartLat, uberStartLong, uberEndLat, uberEndLong);
    if (travelMiles < 150) {

        const url = 'https://cors-anywhere.herokuapp.com/https://www.uber.com/api/loadFEEstimates';
        console.log(url);
        var count = 1;
        const maxTries = 10;
        while (true) {
            //while starts
            try {
                const uberFetch = await fetch(url, {
                    "method": "POST",
                    "mode": "cors",
                    "headers": {
                        'x-csrf-token': 'x',
                        'Content-type': 'application/json',
                    },
                    "body": JSON.stringify({
                        'destination': {
                            "id": endID,
                            "latitude": uberEndLat,
                            "locale": "en",
                            "longitude": uberEndLong,
                            "provider": "google_places"
                        },
                        "origin": {
                            "id": startID,
                            'latitude': uberStartLat,
                            "locale": "en",
                            "longitude": uberStartLong,
                            "provider": "google_places"
                        }
                    })
                })
                console.log("Status of uber: " + uberFetch.status);
                if (uberFetch.ok) { // or status == 200
                    //deserializes json response 
                    console.log("Attempt #: " + count);
                    const data = await uberFetch.json();
                    console.log("Status of data: " + data.status);
                    const finalData = data;
                    const uberXcost = await addZeroes(finalData.data.prices[1].total);
                    console.log("UberX Price: " + uberXcost);
                    document.getElementById('ubercost').innerHTML = "$" + uberXcost;

                    const uberXLcost = await addZeroes(finalData.data.prices[5].total);
                    console.log("UberXL Price: " + uberXLcost);
                    document.getElementById('uberXLcost').innerHTML = "$" + uberXLcost;
                    // return { uberX: uberXcost, uberXl: uberXLcost }
                } else {
                    // non 2xx status code 
                    console.log("Status code", uberFetch.status)
                }
                break;
            } catch (err) {
                console.log("An error occured", err);

                if (++count == maxTries) {
                    document.getElementById('ubercost').innerHTML = "<font size='1'> Unable to compute! </font>";
                    document.getElementById('uberXLcost').innerHTML = "<font size='1'> Unable to compute! </font>";
                    throw err;
                }
            }
        }
        // return { uberX: 0, uberXl: 0 };
    } else {
        document.getElementById('ubercost').innerHTML = "***";
        document.getElementById('uberXLcost').innerHTML = "***";
    }
}



//     }).then(async responce => {
//         console.log("return json response line");
//         return responce.json()
//     }).then(async data => {

//         console.log("Reached Uber data")

//         const finalData = data;
//         const uberXcost = await addZeroes(finalData.data.prices[1].total);
//         console.log("UberX Price: " + uberXcost);
//         document.getElementById('ubercost').innerHTML = "$" + uberXcost;

//         const uberXLcost = await addZeroes(finalData.data.prices[5].total);
//         console.log("UberXL Price: " + uberXLcost);
//         document.getElementById('uberXLcost').innerHTML = "$" + uberXLcost;
//     })
//     .catch(err => {
//         console.log(err);
//     });

// return uberFetch;

function checkIfSameAirport() {
    // if (StartingAirportCode === EndingAirportCode) {
    //     document.getElementById('startnearestairport').innerHTML = "-_-";
    //     document.getElementById('endnearestairport').innerHTML = "-_-";
    // } else {
    document.getElementById('startnearestairport').innerHTML = StartingAirportCode;
    document.getElementById('endnearestairport').innerHTML = EndingAirportCode;
    // }
}