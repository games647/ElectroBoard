//imports
var request = require('request');

var exports = module.exports = {};

exports.updateWeather = function(apiKey, city) {
    request('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey + '&units=metric', function (error, response, body) {
        if (error) {
            return console.log('Error:', error);
        }

        if (response.statusCode !== 200) {
            return console.log('Invalid Status Code Returned:', response.statusCode);
        }

        var data = JSON.parse(body);
        console.log(data)

        var temperature = data.main.temp;
        $("#temperature").text(temperature + "°C");
    });
}