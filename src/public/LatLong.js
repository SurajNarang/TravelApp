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
var finalUberPrice;
var finalUberXLPrice;
var lufthansaKey;
const skyScannerKey = config.SKYSCAN_KEY;
//const mykey = config.GOOGLE_KEY;

var layer3 ;
async function layer() {
     return fetch("/layer", {
        // mode: "no-cors"
    })
    .then(r => r.text()).then(key => {
        layer3 = key
        console.log(layer3);
        return layer3;
    })
    .catch(err => {console.log(err)})
}
//layer3 =  layer() ;
document.write("\<script src='" + "https://maps.googleapis.com/maps/api/js?v=3.exp&amp;libraries=places&amp;key=" + encodeURIComponent(layer3) + "'\>\</script\>");

async function getToken(callback) {
    layer3 = await layer()
    await fetchCalc();

    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            console.log("time out")
            resolve();
        });
    })
}

async function LatLongData() {
    await determiningLatLong();
}

getToken().then(LatLongData);


async function printResult() {
    if ((StartLongFinal != null) && (StartLatFinal != null) && (EndLongFinal != null) && (EndLatFinal != null)) {
        await GetLyftCost(StartLatFinal, StartLongFinal, EndLatFinal, EndLongFinal);
        await GetFlightCost(StartingAirportCode, EndingAirportCode);
        await printAirports();
        await GetUberCost(StartLatFinal, StartLongFinal, EndLatFinal, EndLongFinal, StartLocPlaceID, EndLocPlaceID);
    }
}

async function determiningLatLong() {
    var searchInput = 'search_input';
    var searchInput2 = 'search_input2';

    // Start location autocomplete method
    $(document).ready(function () {
        var autocomplete;
        autocomplete = new google.maps.places.Autocomplete((document.getElementById(searchInput)), {
            types: ['geocode'],
            // Restricts user input to America location 
            componentRestrictions: {
                country: 'USA',
            }
        });

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var near_place = autocomplete.getPlace();
            document.getElementById('loc_lat').value = near_place.geometry.location.lat();
            document.getElementById('loc_long').value = near_place.geometry.location.lng();
            document.getElementById('loc_startflight').value = StartingAirportCode;

            // Updates Start Latitude and Longitude
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
            }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        StartLocPlaceID = results[1].place_id;
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });
        });
    });

    $(document).on('change', '#' + searchInput, function () {
        document.getElementById('startlatitude_view').innerHTML = '';
        document.getElementById('startlongitude_view').innerHTML = '';
        document.getElementById('startnearestairport').innerHTML = '';
    });

    // Final location autocomplete method
    $(document).ready(function () {
        var autocomplete;
        autocomplete = new google.maps.places.Autocomplete((document.getElementById(searchInput2)), {
            types: ['geocode'],
            // Restricts user input to America location 
            componentRestrictions: {
                country: 'USA',
            }
        });

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var near_place = autocomplete.getPlace();
            document.getElementById('loc_lat').value = near_place.geometry.location.lat();
            document.getElementById('loc_long').value = near_place.geometry.location.lng();
            document.getElementById('loc_endflight').value = EndingAirportCode;

            // Updates End Latitude and Longitude
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
            }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        EndLocPlaceID = results[1].place_id;
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });

            $(document).ready(function () {
                $('#clickMe').click(function () {
                    // Disables reset button until fully loaded
                    document.getElementById("reset-button").disabled = true;
                    setTimeout(function () {
                        document.getElementById("reset-button").disabled = false;
                    }, 11500);


                    if ((StartLongFinal != null) && (StartLatFinal != null) && (EndLongFinal != null) && (EndLatFinal != null)) {

                        $("#display_loading").show();

                        setTimeout(function () {

                            document.getElementById("display_loading").style.display = "none";
                        }, 11000);

                        printResult();
                    }
                });
            });
        });
    });

    $(document).on('change', '#' + searchInput, function () {
        document.getElementById('endlatitude_view').innerHTML = '';
        document.getElementById('endlongitude_view').innerHTML = '';
        document.getElementById('endnearestairport').innerHTML = '';
    });
}

// Fetches nearest airport code according to user's start location

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
                })
                .catch(err => {});
        })
        .catch(err => {});
}

// Fetches nearest airport code according to user's end location

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
                    console.log(EndingAirportCode + " -Destination airport");
                })
                .catch(err => {});
        })
        .catch(err => {});
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Retrieves most cost-efficient airfare according to the user's start and end location

async function GetFlightCost() {
    var airlinePrice;
    if (StartingAirportCode == undefined || EndingAirportCode == undefined) {
        await sleep(500);
    }

    var todayDate = new Date(new Date().getTime() + (24 * 60 * 60 * 1000))
    var dd = String(todayDate.getDate()).padStart(2, '0');
    var mm = String(todayDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = todayDate.getFullYear();
    todayDate = yyyy + '-' + mm + '-' + dd;
    todayDate = todayDate.toString();

    fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" + StartingAirportCode + "-sky/" + EndingAirportCode + "-sky/" + todayDate, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
            "x-rapidapi-key": skyScannerKey
        }
    }).then(response => {
        const data = response.json();
        data.then(jresponse => {
            if (jresponse.Quotes.length == 0) {


                var TomDate = new Date(new Date().getTime() + (24 * 60 * 60 * 1000) + (24 * 60 * 60 * 1000));
                var day = String(TomDate.getDate()).padStart(2, '0');
                var month = String(TomDate.getMonth() + 1).padStart(2, '0');
                var year = TomDate.getFullYear();
                const tommorowDate = year + '-' + month + '-' + day;

                fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" + StartingAirportCode + "-sky/" + EndingAirportCode + "-sky/" + tommorowDate, {
                    "method": "GET",
                    "headers": {
                        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
                        "x-rapidapi-key": skyScannerKey
                    }
                }).then(response1 => {
                    response1.json().then(response2 => {
                        if (response2.Quotes.length == 0) {

                            var Third = new Date(new Date().getTime() + (24 * 60 * 60 * 1000) + (24 * 60 * 60 * 1000) + (24 * 60 * 60 * 1000));
                            var day = String(Third.getDate()).padStart(2, '0');
                            var month = String(Third.getMonth() + 1).padStart(2, '0');
                            var year = Third.getFullYear();
                            const ThirdDate = year + '-' + month + '-' + day;

                            fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" + StartingAirportCode + "-sky/" + EndingAirportCode + "-sky/" + ThirdDate, {
                                "method": "GET",
                                "headers": {
                                    "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
                                    "x-rapidapi-key": skyScannerKey
                                }
                            }).then(response3 => {
                                response3.json().then(response4 => {
                                    if (response4.Quotes.length == 0) {
                                        var message = "*No Flights Yet*"
                                        var NAmessage = "N/A"
                                        document.getElementById('flightcost').innerHTML = message.fontcolor("#00008B");
                                        document.getElementById('flightdate').innerHTML = NAmessage.fontcolor("#00008B");
                                        document.getElementById('airline').innerHTML = NAmessage.fontcolor("#00008B");

                                    } else {
                                        const MinPriceForThird = response4.Quotes[0].MinPrice;
                                        airlinePrice = MinPriceForThird;

                                        if (response4.Quotes.length > 1) {
                                            let min = response4.Quotes[0].MinPrice;
                                            for (let x = 0; x < response4.Quotes.length; x++) {
                                                let value = response4.Quotes[x].MinPrice;
                                                min = (value < min) ? value : min
                                            }
                                            airlinePrice = min;
                                        }

                                        // Getting the Carrier ID associated with min price
                                        var CarrierID = response4.Quotes[0].OutboundLeg.CarrierIds;
                                        var date = response4.Quotes[0].OutboundLeg.DepartureDate;


                                        for (let y = 0; y < response4.Quotes.length; y++) {
                                            let value = response4.Quotes[y].MinPrice;
                                            if (value === airlinePrice) {
                                                CarrierID = response4.Quotes[y].OutboundLeg.CarrierIds;
                                                date = response4.Quotes[y].OutboundLeg.DepartureDate;
                                            }
                                        }

                                        // Getting Airline Name associated with min price
                                        var AirLineName = response4.Carriers[0].Name;
                                        for (let z = 0; z < response4.Carriers.length; z++) {
                                            let id = response4.Carriers[z].CarrierId;
                                            if (id === CarrierID) {
                                                AirLineName = response4.Carriers[z].Name;
                                            }
                                        }
                                        // Getting rid of the T separator between the date and time
                                        date.toString();

                                        var StringDate = date.substr(0, date.indexOf('T'));
                                        console.log("Airline Price: " + airlinePrice);
                                        console.log("Airline Departure Date: " + StringDate);
                                        console.log("Airline Name: " + AirLineName);

                                        document.getElementById('flightcost').innerHTML = "$" + airlinePrice;
                                        document.getElementById('flightdate').innerHTML = StringDate;
                                        document.getElementById('airline').innerHTML = AirLineName;

                                        var str = "Click here to book!";
                                        document.getElementById('ClickToBook').innerHTML = str;

                                    }
                                }).catch(err => {})
                            }).catch(err => {})

                        } else {

                            const MinPriceForTM = response2.Quotes[0].MinPrice;
                            airlinePrice = MinPriceForTM;

                            if (response2.Quotes.length > 1) {
                                let min = response2.Quotes[0].MinPrice;
                                for (let x = 0; x < response2.Quotes.length; x++) {
                                    let value = response2.Quotes[x].MinPrice;
                                    min = (value < min) ? value : min
                                }
                                airlinePrice = min;
                            }

                            // Getting the Carrier ID associated with min price
                            var CarrierID = response2.Quotes[0].OutboundLeg.CarrierIds;
                            var date = response2.Quotes[0].OutboundLeg.DepartureDate;


                            for (let y = 0; y < response2.Quotes.length; y++) {
                                let value = response2.Quotes[y].MinPrice;
                                if (value === airlinePrice) {
                                    CarrierID = response2.Quotes[y].OutboundLeg.CarrierIds;
                                    date = response2.Quotes[y].OutboundLeg.DepartureDate;
                                }
                            }
                            console.log("Carrier ID: " + CarrierID);

                            // Getting Airline Name associated with min price

                            var AirLineName = response2.Carriers[0].Name;
                            for (let z = 0; z < response2.Carriers.length; z++) {
                                let id = response2.Carriers[z].CarrierId;
                                if (id === CarrierID) {
                                    AirLineName = response2.Carriers[z].Name;
                                }
                            }
                            // Getting rid of the T separator between the date and time

                            date.toString();

                            var StringDate = date.substr(0, date.indexOf('T'));
                            console.log("Airline Price: " + airlinePrice);
                            console.log("Airline Departure Date: " + StringDate);
                            console.log("Airline Name: " + AirLineName);

                            document.getElementById('flightcost').innerHTML = "$" + airlinePrice;
                            document.getElementById('airline').innerHTML = AirLineName;

                            document.getElementById('flightdate').innerHTML = StringDate;
                            var str = "Click here to book!";
                            document.getElementById('ClickToBook').innerHTML = str;
                        }
                    }).catch(err => {})
                }).catch(err => {})

            } else {

                const MinPriceForToday = jresponse.Quotes[0].MinPrice;
                airlinePrice = MinPriceForToday;

                if (jresponse.Quotes.length > 1) {
                    let min = jresponse.Quotes[0].MinPrice;
                    for (let x = 0; x < jresponse.Quotes.length; x++) {
                        let value = jresponse.Quotes[x].MinPrice;
                        min = (value < min) ? value : min
                    }
                    airlinePrice = min;
                }

                // Getting the Carrier ID associated with min price

                var CarrierID = jresponse.Quotes[0].OutboundLeg.CarrierIds;
                var date = jresponse.Quotes[0].OutboundLeg.DepartureDate;


                for (let y = 0; y < jresponse.Quotes.length; y++) {
                    let value = jresponse.Quotes[y].MinPrice;
                    if (value === airlinePrice) {
                        CarrierID = jresponse.Quotes[y].OutboundLeg.CarrierIds;
                        date = jresponse.Quotes[y].OutboundLeg.DepartureDate;
                    }
                }
                console.log("Carrier ID: " + CarrierID);

                // Getting Airline Name associated with min price

                var AirLineName = jresponse.Carriers[0].Name;
                for (let z = 0; z < jresponse.Carriers.length; z++) {
                    let id = jresponse.Carriers[z].CarrierId;
                    if (id === CarrierID) {
                        AirLineName = jresponse.Carriers[z].Name;

                    }
                }
                // Getting rid of the T separator between the date and time
                date.toString();

                var StringDate = date.substr(0, date.indexOf('T'));
                console.log("Airline Price: " + airlinePrice);
                console.log("Airline Departure Date: " + StringDate);
                console.log("Airline Name: " + AirLineName);

                document.getElementById('flightcost').innerHTML = "$" + airlinePrice;
                document.getElementById('airline').innerHTML = AirLineName;

                document.getElementById('flightdate').innerHTML = StringDate;
                var str = "Click here to book!";
                document.getElementById('ClickToBook').innerHTML = str;

            }
        }).catch(err => {

        })
    }).catch(err => {})
}

async function GetLyftCost(lyftStartLat, lyftStartLong, lyftEndLat, lyftEndLong) {

    var travelMiles = await getDistanceGoogle(lyftStartLat, lyftStartLong, lyftEndLat, lyftEndLong);

    console.log(travelMiles + " Travel Miles");
    if (travelMiles < 150 && typeof travelMiles !== 'undefined') {

        RouteTooFar = false;
        const dynamicUrl = "/lyft?startLat=" + lyftStartLat + "&startLong=" + lyftStartLong + "&endLat=" + lyftEndLat + "&endLong=" + lyftEndLong;

        await fetch(dynamicUrl, {
                mode: "no-cors"
            })
            .then(r => r.json())
            .then(async (data) => {
                const routeTime = await getRouteDurationGoogle(lyftStartLat, lyftStartLong, lyftEndLat, lyftEndLong);

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

            }).catch(err => {});
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
            setTimeout(function () {
                document.getElementById('route').innerHTML = boldText + " = This route is not accessible by Uber/Lyft ( > 150 miles)";
            }, 11000);
        }
    }
}

async function fetchCalc() {
    fetch("/luftkey", {
            mode: "no-cors"
        })
        .then(r => r.text()).then(key => {
            lufthansaKey = key;
        })
        .catch(err => {})
}

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

// Fetches the distance from start to end destination

async function getDistanceGoogle(lat1, lon1, lat2, lon2) {
    const dynamicUrl = "/getDistanceGoogle?startLat=" + lat1 + "&startLong=" + lon1 + "&endLat=" + lat2 + "&endLong=" + lon2;
    const request = await fetch(dynamicUrl, {
            method: "GET",
            mode: "no-cors"
        })
        .then(async function (response) {
            const distance = await response.text();
            try {
                const data = JSON.parse(distance);
                return addZeroes(data);
            } catch (err) {
                var distanceNumber = Number(distance);
                return addZeroes(distanceNumber);
            }
        }).catch(err => {});
    return request;
}

// Fetches the route time from start to end destination

async function getRouteDurationGoogle(lat1, lon1, lat2, lon2) {
    const dynamicUrl = "/getRouteDurationGoogle?startLat=" + lat1 + "&startLong=" + lon1 + "&endLat=" + lat2 + "&endLong=" + lon2;

    const request = await fetch(dynamicUrl, {
            method: "GET",
            mode: "no-cors"
        })
        .then(async function (response) {
            const duration = await response.text();
            try {
                const data = JSON.parse(duration);
                return data;
            } catch (err) {
                return duration;
            }
        }).catch(err => {});
    return request;
}

async function GetUberCost(uberStartLat, uberStartLong, uberEndLat, uberEndLong, startID, endID) {
    const travelMiles = await getDistanceGoogle(uberStartLat, uberStartLong, uberEndLat, uberEndLong);
    if (travelMiles < 150) {

        const url = 'https://cors-anywhere.herokuapp.com/https://www.uber.com/api/loadFEEstimates';
        var count = 1;
        const maxTries = 15;
        while (true) {
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

                if (uberFetch.ok) { // Or status == 200
                    // Deserializes json response 
                    const data = await uberFetch.json();
                    console.log("Status of data: " + data.status);
                    const finalData = data;
                    const uberXcost = await addZeroes(finalData.data.prices[1].total);
                    console.log("UberX Price: " + uberXcost);
                    finalUberPrice = uberXcost;
                    document.getElementById('ubercost').innerHTML = "$" + uberXcost;

                    const uberXLcost = await addZeroes(finalData.data.prices[5].total);
                    console.log("UberXL Price: " + uberXLcost);
                    finalUberXLPrice = uberXLcost;
                    document.getElementById('uberXLcost').innerHTML = "$" + uberXLcost;
                } else {
                    // Non 2xx status code 
                    if (uberFetch.status = 429) {
                        document.getElementById('ubercost').innerHTML = "<font size='1'> Unable to compute! </font>";
                        document.getElementById('uberXLcost').innerHTML = "<font size='1'> Unable to compute! </font>";
                    }
                }
                break;

            } catch (err) {
                if (++count == maxTries) {
                    if (isNaN(finalUberPrice)) {
                        document.getElementById('ubercost').innerHTML = "<font size='1'> Unable to compute! </font>";
                    }
                    if (isNaN(finalUberXLPrice)) {
                        document.getElementById('uberXLcost').innerHTML = "<font size='1'> Unable to compute! </font>";
                    }
                    break;
                }
            }
        }

    } else {
        document.getElementById('ubercost').innerHTML = "***";
        document.getElementById('uberXLcost').innerHTML = "***";
    }
}

async function printAirports() {
    document.getElementById('startnearestairport').innerHTML = StartingAirportCode;
    document.getElementById('endnearestairport').innerHTML = EndingAirportCode;
}

// Clears data when reset button is clicked

$(document).ready(function () {
    $('#reset-button').click(function () {
        document.getElementById('startnearestairport').innerHTML = "";
        document.getElementById('endnearestairport').innerHTML = "";
        document.getElementById('startlatitude_view').innerHTML = "";
        document.getElementById('startlongitude_view').innerHTML = "";
        document.getElementById('endlatitude_view').innerHTML = "";
        document.getElementById('endlongitude_view').innerHTML = "";
        document.getElementById('ubercost').innerHTML = "";
        document.getElementById('uberXLcost').innerHTML = "";
        document.getElementById('lyftcost').innerHTML = "";
        document.getElementById('lyftXLcost').innerHTML = "";
        document.getElementById('lyftduration').innerHTML = "";
        document.getElementById('uberduration').innerHTML = "";
        document.getElementById('uberdistance').innerHTML = "";
        document.getElementById('lyftdistance').innerHTML = "";
        document.getElementById('flightcost').innerHTML = "";
        document.getElementById('flightdate').innerHTML = "";
        document.getElementById('airline').innerHTML = "";
        document.getElementById('search_input').value = "";
        document.getElementById('search_input2').value = "";
        document.getElementById('route').innerHTML = "";
        document.getElementById('ClickToBook').innerHTML = "";

        StartLongFinal = null;
        StartLatFinal = null;
        EndLongFinal = null;
        EndLatFinal = null;

    });
});

