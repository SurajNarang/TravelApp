const axios = require('axios');

const fetchUberSubEstimates = (start_latitude, start_longitude, end_latitude, end_longitude) => {
    return new Promise((resolve, reject) => {
        const token = 'ZSTiVSODCEeq3FF4zb_bHFvIux-r2hJN5YRElfBU';
        const estimateUrl = "https://api.uber.com/v1.2/estimates/price?start_latitude=" + start_latitude + "&start_longitude=" + start_longitude + "&end_latitude=" + end_latitude + "&end_longitude=" + end_longitude;

        axios({
                method: 'GET',
                url: estimateUrl,
                headers: {
                    'Authorization': `Token ${token}`,
                    'Accept-Language': 'en_US',
                    'Content-Type': 'application/json'
                },
                params: {
                    start_latitude,
                    start_longitude,
                    end_latitude,
                    end_longitude
                }
            })
            .then((response) => {
                // returns array of subestimate objects
                resolve(response.data.prices);
            })
            .catch((err) => {
                console.log("Unable to fetch Uber price");
            });
    })
};
fetchUberSubEstimates(37.7752315, -122.418075, 37.7752415, -122.518075)
    //   .then((prices) => console.log(prices));