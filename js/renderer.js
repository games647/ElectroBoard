// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//imports
var fs = require('fs');
var dateFormat = require('dateformat');
var exec = require('child_process').exec;

var imageId = 0;
var isBoardShowing = true;

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

//components
var freifunk = require('./freifunk.js');
setInterval(function () {
    freifunk.updateClientInfo(config['freifunk-nodes'], config['freifunk-stats-server'])
}, 1 * 60 * 1000);

require('./solar.js')
var weather = require('./weather.js')
weather.updateWeather(config['openweathermap-api'], config['weather-city']);

setInterval(updateTime, 1000)
setInterval(updateNetworkActivity, 3 * 1000)

setInterval(function() {
    if (isBoardShowing) {
        imageId++;
        var path = "img/slideshow/" + imageId + ".png";

        if (!fs.existsSync(path)) {
            //reset to the first id
            imageId = 1;
            path = "img/slideshow/" + imageId + ".png";
        }

        $('#slide').attr("src", path);
        $('#status').fadeToggle(1000, "linear", function () {
            $('#slide').fadeToggle(5000, "linear");
        });
    } else {
        $('#slide').fadeToggle(5000, "linear", function () {
            $('#status').fadeToggle(1000, "linear");
        });
    }

    isBoardShowing = !isBoardShowing;
}, 5 * 60 * 1000)

var mapsAPI = config['google-maps-api'];
var origin = config['map-origin'];
var destination = config['map-destination'];
// $("#map iframe").prop('src', "https://www.google.com/maps/embed/v1/directions?key=" + mapsAPI + "&origin=" + origin + "&destination=" + destination);

function updateNetworkActivity() {
    exec('"scripts/network-activity.py"', function (error, stdout, stderr) {
        var components = stdout.split(/[ ,]+/);

        var upload = Math.round(parseInt(components[0], 10) / 1024 * 100) / 100;
        var download = Math.round(parseInt(components[1], 10) / 1024 * 100) / 100;

        $("#upload").text("Current: " + upload + " kB/S");
        $("#download").text("Current: " + download + " kB/s");
    });
}


function updateTime() {
    var now = new Date();
    var header = dateFormat(now, "dddd, mmmm dS, yyyy");
    var time = dateFormat(now, "H:MM:ss")

    $("#date").text(header);
    $("#time").text(time);
}