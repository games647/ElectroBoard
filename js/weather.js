//imports
const {ipcRenderer} = require('electron')

var http = require('http');

ipcRenderer.on('config-loaded', (event, config) => {
    var apiKey = config['openweathermap-api'];
    var city = config['weather-city'];

    updateWeather(apiKey, city);
    setInterval(() => {
        updateWeather(apiKey, city);
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
        }).on('error', e => {
            console.log(`Got error: ${e.message}`);
        });;
    });
};