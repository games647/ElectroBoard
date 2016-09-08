//imports
const {ipcRenderer} = require('electron')

var http = require('http');
var jQuery = require('jquery');

ipcRenderer.on('config-loaded', (event, config) => {
    updateWeather(config['openweathermap-api'], config['weather-city']);
    setInterval(() => {
        updateWeather(config['openweathermap-api'], config['weather-city']);
    }, 30 * 60 * 1000)
});

function updateWeather(apiKey, city) {
    var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey + '&units=metric';
    http.get(url, res => {
        res.on('data', chunk => {
            var data = JSON.parse(chunk);
            console.log(data);

            var temperature = data.main.temp;
            $("#temperature").text(temperature + "°C");
        });
    });
};