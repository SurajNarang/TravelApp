 var StartLongFinal;
 var StartLatFinal;
 var EndLongFinal;
 var EndLatFinal;
 var StartingAiportCode;
 var EndingAirportCode;
 
 

 async function Overall() {
     await determiningLatLong();
     //GetFlightCost("PHL", "LAX");
 }
 Overall();

 function printResult() {
     if ((StartLongFinal != null) && (StartLatFinal != null) && (EndLongFinal != null) && (EndLatFinal != null)) {
         console.log("all numbers found");
         console.log(StartLongFinal + " ," + StartLatFinal + " ," + EndLongFinal + " ," + EndLatFinal);
         GetFlightCost(StartingAiportCode,EndingAirportCode);
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

             // Updates Latitude and Longitude
             document.getElementById('startlatitude_view').innerHTML = near_place.geometry.location.lat();
             document.getElementById('startlongitude_view').innerHTML = near_place.geometry.location.lng();
             console.log(near_place.geometry.location.lat());
             console.log(near_place.geometry.location.lng());
             StartLongFinal = near_place.geometry.location.lng();
             StartLatFinal = near_place.geometry.location.lat();
             GetNearestStartingAiport(StartLatFinal, StartLongFinal);
             //printResult();

         });
     });

     $(document).on('change', '#' + searchInput, function () {
         document.getElementById('startlatitude_view').innerHTML = '';
         document.getElementById('startlongitude_view').innerHTML = '';
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

             // Updates Latitude and Longitude
             document.getElementById('endlatitude_view').innerHTML = near_place.geometry.location.lat();
             document.getElementById('endlongitude_view').innerHTML = near_place.geometry.location.lng();
             console.log(near_place.geometry.location.lat());
             console.log(near_place.geometry.location.lng());
             EndLatFinal = near_place.geometry.location.lat();
             EndLongFinal = near_place.geometry.location.lng();
             GetNearestEndingAiport(EndLatFinal, EndLongFinal);
             printResult();
             
         });
     });

     $(document).on('change', '#' + searchInput, function () {
         document.getElementById('endlatitude_view').innerHTML = '';
         document.getElementById('endlongitude_view').innerHTML = '';
     });

 }


 function GetNearestStartingAiport(LatFinal, LongFinal) {

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
                     StartingAiportCode= CurrentAirport;
                 })
                 .catch(err => {
                     console.log(err);
                 });
         })
         .catch(err => {
             console.log(err);
         });
 }

 function GetNearestEndingAiport(LatFinal1, LongFinal1) {

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
                 sleep(4000);
                     console.log(EndingAirportCode + " -Destination airport");
                    //  var CurrentAirport = test1;
                    //  EndingAirportCode = CurrentAirport;
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
    if (StartingAiportCode == undefined || EndingAirportCode == undefined){
        
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
     var checkedNextDay = new Boolean(false);
     var airlinePrice;
     todayDate = yyyy + '-' + mm + '-' + dd;
     todayDate = todayDate.toString();

     fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" + StartingAiportCode + "-sky/" + EndingAirportCode + "-sky/" + "2020-06-14", {
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
                     console.log(airlinePrice);
                     if (jresponce.Quotes.length === 0) {
                        console.log("Attention Attention, we must check the mext day")
                        var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
                        var day = String(currentDate.getDate()).padStart(2, '0');
                        var month = String(currentDate.getMonth() + 1).padStart(2, '0');
                        var year = currentDate.getFullYear();
                        const tommorowDate = year + '-' + month + '-' + day;
                        console.log(tommorowDate);
                        checkedNextDay = true;
   
                        fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" + startCode + "-sky/" + endCode + "-sky/" + tommorowDate, {
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
                                    console.log(airlinePrice);
   
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
                     console.log(tommorowDate);
                     checkedNextDay = true;

                     fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" + startCode + "-sky/" + endCode + "-sky/" + tommorowDate, {
                             "method": "GET",
                             "headers": {
                                 "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
                                 "x-rapidapi-key": skyScannerKey
                             }
                         })
                         .then(responce2 => {
                             const data2 = responce2.json();
                             data2.then(jresponce3 => {
                                 const MinPriceForTm = jresponce3.Quotes[0].MinPrice;
                                 airlinePrice = MinPriceForTm;
                                 console.log(airlinePrice);
                                 checkedNextDay = true;

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

 function LyftCost(tempStartLong, tempStartLat, tempEndLong, tempEndLat){
    const url = "https://www.lyft.com/api/costs?start_lat="+tempStartLat+"&start_lng="+tempStartLong+"&end_lat="+tempEndLat+"&end_lng="+tempEndLong;
 }