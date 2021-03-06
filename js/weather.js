//imports
const {ipcRenderer} = require('electron');

const http = require('http');

ipcRenderer.on('config-loaded', (event, config) => {
    let apiKey = config['openweathermap-api'];
    let city = config['weather-city'];

    updateWeather(apiKey, city);
    setInterval(() => {
        updateWeather(apiKey, city);
    }, 30 * 60 * 1000)
});

function updateWeather(apiKey, city) {
    let url = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey + '&units=metric';
    http.get(url, res => {
        res.on('data', chunk => {
            let data = JSON.parse(chunk);
            console.log(data);
            if (data.cod !== 200) {
                return console.log(data.message);
            }

            let temperature = data.main.temp;
            $("#temperature").text(temperature + "°C");
        });
    }).on('error', event => {
        console.log(`problem with request: ${event.message}`);
    });
}
