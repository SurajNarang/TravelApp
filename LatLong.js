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
        //var temp = near_place.geometry.location.lat();
        //console.log(temp);
        localStorage.setItem('FinalDestinationLat',near_place.geometry.location.lat());
    });
});

$(document).on('change', '#' + searchInput, function() {
    document.getElementById('endlatitude_view').innerHTML = '';
    document.getElementById('endlongitude_view').innerHTML = '';
});
