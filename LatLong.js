 var StartLongFinal;
 var StartLatFinal;
 var EndLongFinal;
 var EndLatFinal;
 var StartingAiportCode;
 var EndingAirportCode;

 async function Overall(){
    await determiningLatLong();
}
Overall();
function printResult(){
   if ((StartLongFinal != null) && (StartLatFinal != null) && (EndLongFinal != null) && (EndLatFinal != null)){
       console.log("all numbers found");
       console.log(StartLongFinal +" ,"+ StartLatFinal+" ,"+ EndLongFinal + " ,"+ EndLatFinal);
    }
    
}
async function determiningLatLong (){
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
       
        // Updates Latitude and Longitude
        document.getElementById('startlatitude_view').innerHTML = near_place.geometry.location.lat();
        document.getElementById('startlongitude_view').innerHTML = near_place.geometry.location.lng();
        console.log(near_place.geometry.location.lat());
        console.log(near_place.geometry.location.lng());
        StartLongFinal = near_place.geometry.location.lat();
        StartLatFinal = near_place.geometry.location.lng();
        StartingAiportCode = GetNearestStartingAiport(StartLatFinal,StartLongFinal);
        printResult();
       
    });
});

$(document).on('change', '#' + searchInput, function() {
    document.getElementById('startlatitude_view').innerHTML = '';
    document.getElementById('startlongitude_view').innerHTML = '';
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

        // Updates Latitude and Longitude
        document.getElementById('endlatitude_view').innerHTML = near_place.geometry.location.lat();
        document.getElementById('endlongitude_view').innerHTML = near_place.geometry.location.lng();
        console.log(near_place.geometry.location.lat());
        console.log(near_place.geometry.location.lng());
        EndLatFinal = near_place.geometry.location.lat();
        EndLongFinal = near_place.geometry.location.lng();
        EndingAirportCode = GetNearestEndingAiport(EndLatFinal,EndLongFinal);
        printResult();
    });
});

$(document).on('change', '#' + searchInput, function() {
    document.getElementById('endlatitude_view').innerHTML = '';
    document.getElementById('endlongitude_view').innerHTML = '';
});

}


function GetNearestStartingAiport(LatFinal , LongFinal){
            
    fetch("https://api.lufthansa.com/v1/references/airports/nearest/"+LongFinal+","+LatFinal, {
            "method": "GET",
            "headers": {
                Accept: 'application/json',
                Authorization: 'Bearer '
            }
        })
         .then(response =>  {
            const test = response.json().then(response2 =>{
                const test1 = response2.NearestAirportResource.Airports.Airport[0].AirportCode;
                console.log(test1+" airport");
                var CurrentAirport = test1;
                return CurrentAirport;
            })
            .catch(err =>{
                console.log(err);
            });        
        })
        .catch(err => {
            console.log(err);
        });
    }

    function GetNearestEndingAiport(LatFinal1 , LongFinal1){
            
        fetch("https://api.lufthansa.com/v1/references/airports/nearest/"+LongFinal1+","+LatFinal1, {
                "method": "GET",
                "headers": {
                    Accept: 'application/json',
                    Authorization: 'Bearer fhbdzp89tpmsw4n3t7kp9uez'
                }
            })
             .then(response =>  {
                const test = response.json().then(response2 =>{
                    const test1 = response2.NearestAirportResource.Airports.Airport[0].AirportCode;
                    console.log(test1+" airport");
                    var CurrentAirport = test1;
                    return CurrentAirport;
                })
                .catch(err =>{
                    console.log(err);
                });        
            })
            .catch(err => {
                console.log(err);
            });
        }