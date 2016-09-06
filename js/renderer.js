// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//imports
var fs = require('fs');
var dateFormat = require('dateformat');
var exec = require('child_process').exec;
var http = require('http');
var querystring = require('querystring');
var request = require('request');

var imageId = 1;

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

setInterval(updateSolarData, 5 * 1000)
setInterval(updateTime, 1000)
setInterval(nextSlide, 5 * 1000);

updateWeather()

var mapsAPI = config['google-maps-api'];
var origin = config['map-origin'];
var destination = config['map-destination'];
// $("#map iframe").prop('src', "https://www.google.com/maps/embed/v1/directions?key=" + mapsAPI + "&origin=" + origin + "&destination=" + destination);

function updateWeather() {
    var apiKey = config['openweathermap-api'];
    var city = config['weather-city'];
    request('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey + '&units=metric', function (error, response, body) {
        if (error) {
            return console.log('Error:', error);
        }

        if (response.statusCode !== 200) {
            return console.log('Invalid Status Code Returned:', response.statusCode);
        }

        var temperature = JSON.parse(body).main.temp;
        $("#temperature").text(temperature + "°C");
    });
}

function updateSolarData() {
    var data = querystring.stringify({
        'action': 'get.hyb.overview'
    });

    var options = {
        host: '192.168.0.75',
        port: 80,
        path: '/cgi-bin/ipcclient.fcgi?HjB7JutSh1n93DU',
        method: 'POST',
        headers: {
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var req = http.request(options, function (res) {
        res.on('data', function (chunk) {
            var components = chunk.toString().split(/[|]+/);

            $("#powerPct").text(components[1] + ' %');
            $("#powerEnergy").text(components[2]);

            $("#batteryPct").text(components[3] + ' %');

            var sufficient = components[5]
            var consume = components[6]

            //either r for input or g for output
            var transferType = components[7]
            if (transferType == 'g') {
                $("#transferType").prop('class', "glyphicon glyphicon-chevron-up");
            } else {
                $("#transferType").prop('class', "glyphicon glyphicon-chevron-down");
            }

            $("#transfer").text(components[8]);
        });
    });

    req.write(data);
    req.end();
}

setInterval(function () {
    exec('"scripts/network-activity.py"', function (error, stdout, stderr) {
        var components = stdout.split(/[ ,]+/);

        var upload = parseInt(components[0], 10) / 1000;
        var download = parseInt(components[1], 10) / 1000;

        $("#upload").text("Current: " + upload + " kB/S");
        $("#download").text("Current: " + download + " kB/s");
    });
}, 3 * 1000);

function nextSlide() {
    imageId++;
    var path = "img/slideshow/" + imageId + ".png";

    if (!fs.existsSync(path)) {
        //reset to the first id
        imageId = 1;
        path = "img/slideshow/" + imageId + ".png";
    }

    $('#slide').fadeToggle(1000, "linear", function () {
        $('#slide').attr("src", path);
        $('#slide').fadeToggle(1000, "linear");
    });
}

function updateTime() {
    var now = new Date();
    var header = dateFormat(now, "dddd, mmmm dS, yyyy");
    var time = dateFormat(now, "H:MM:ss")

    $("#date").text(header);
    $("#time").text(time);
}