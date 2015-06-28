var https = require('https');
var _ = require('underscore');
var querystring = require('querystring');
var striptags = require('striptags');

var yahoo = {

    getWeather: function(location, callback) {

        // Create the YQL to send
        var yahooRequestData = querystring.stringify({
            q: 'select * from weather.forecast where u = "c" and woeid in (select woeid from geo.places(1) where text="' + encodeURIComponent(location) + '")',
            format: 'json'
        });

        // Define the GET request
        var yahooRequestOptions = {
            host: 'query.yahooapis.com',
            port: 443,
            path: '/v1/public/yql?' + yahooRequestData,
            method: 'GET'
        };

        // Execute the request
        var yahooRequest = https.request(yahooRequestOptions, function(yahooResponse) {
            yahooResponse.setEncoding('utf8');

            // Read the response
            var output = '';
            yahooResponse.on('data', function (chunk) {
                output += chunk;
            });

            // Return the received data when finished, using the specified callback function
            yahooResponse.on('end', function() {
                var responseData = JSON.parse(output);
                console.log('Yahoo - received response code: ' + yahooResponse.statusCode);
                var weather = yahoo.parseResponse(responseData);
                callback(weather);
            });
        });

        // Log errors and return an error message instead of weather message
        yahooRequest.on('error', function(err) {
            console.error('Yahoo API error: ' + err.message);
            callback('Sorry, could not get the data from Yahoo.');
        });

        yahooRequest.end();
    },

    // Parse the Yahoo weather data and create a string to be used as the weather message
    parseResponse: function(responseData) {
        var weather = 'Sorry, no data found.';
        if (!_.isNull(responseData) &&
            !_.isNull(responseData.query) &&
            !_.isNull(responseData.query.results) &&
            !_.isNull(responseData.query.results.channel) &&
            !_.isNull(responseData.query.results.channel.item) &&
            !_.isNull(responseData.query.results.channel.item.description)) {
            weather = responseData.query.results.channel.item.title;
            weather += striptags(responseData.query.results.channel.item.description);
        }
        return weather;
    }

};

module.exports = yahoo;
