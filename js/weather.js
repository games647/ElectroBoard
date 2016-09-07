//imports
var request = require('request');

var exports = module.exports = {};

exports.updateWeather = function(apiKey, city) {
    request('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey + '&units=metric', function (error, response, body) {
        var data = JSON.parse(body);
        console.log(data)

        if ('cod' in data && data.cod != 200) {
            //error occurred
            console.log(data.message);
            return;
        }

        var temperature = data.main.temp;
        $("#temperature").text(temperature + "°C");
    });
}