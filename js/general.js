//imports
const {ipcRenderer} = require('electron')

var fs = require('fs');
var dateFormat = require('dateformat');
var exec = require('child_process').exec;

var imageId = 1;
var isBoardShowing = true;

ipcRenderer.on('config-loaded', (event, config) => {
    var mapsAPI = config['google-maps-api'];
    var origin = config['map-origin'];
    var destination = config['map-destination'];

    setMapsImage(mapsAPI, origin, destination);

    var switchInterval = config['background-switch-seconds'];
    setInterval(switchInterval, switchInterval * 1000);
});

setInterval(updateTime, 1000);
setInterval(updateNetworkActivity, 3 * 1000);

function switchBackground() {
    if (isBoardShowing) {
        imageId++;
        var path = "img/slideshow/" + imageId + ".jpg";

        if (!fs.existsSync(path)) {
            //reset to the first id
            imageId = 1;
            path = "img/slideshow/" + imageId + ".jpg";
            console.log("reset to the first slideshow id");
        }

        $('#status').fadeToggle(1000, "linear", () => {
            $("#background").animate({
                opacity: 0.0
            }, 3000, () => {
                $("#background").css('background-image', 'url(' + path + ')');
                $("#background").animate({
                    opacity: 1
                }, 3000);
            });
        });
    } else {
        $('#status').fadeToggle(1000, "linear");
        $("#background").animate({
            opacity: 0.8
        }, 3000);
    }

    isBoardShowing = !isBoardShowing;
}

function updateNetworkActivity() {
    exec('"scripts/network-activity.py"', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }

        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        var components = stdout.split(/[ ,]+/);

        var upload = Math.round(parseInt(components[0], 10) / 1024 * 100) / 100;
        var download = Math.round(parseInt(components[1], 10) / 1024 * 100) / 100;

        $("#upload").text("Current: " + upload + " kB/S");
        $("#download").text("Current: " + download + " kB/s");
    });
}

function updateTime() {
    var now = new Date();
    var header = dateFormat(now, "dddd, mmmm dS");
    var time = dateFormat(now, "H:MM:ss");

    $("#date").text(header);
    $("#time").text(time);
}

function setMapsImage(mapsApiKey, origin, destination) {
    var url = "https://www.google.com/maps/embed/v1/directions?" +
        "key=" + mapsApiKey + "&origin=" + origin + "&destination=" + destination;
    $("#map iframe").prop('src', url);
}