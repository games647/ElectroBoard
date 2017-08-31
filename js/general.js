//imports
const {ipcRenderer} = require('electron');

const fs = require('fs');
const dateFormat = require('dateformat');
const exec = require('child_process').exec;

let imageId = 1;
let isBoardShowing = true;

ipcRenderer.on('config-loaded', (event, config) => {
    let mapsAPI = config['google-maps-api'];
    let origin = config['map-origin'];
    let destination = config['map-destination'];

    setMapsImage(mapsAPI, origin, destination);

    let switchInterval = config['background-switch-seconds'];
    setInterval(switchBackground, switchInterval * 1000);
});

setInterval(updateTime, 1000);
setInterval(updateNetworkActivity, 3 * 1000);

function switchBackground() {
    if (isBoardShowing) {
        imageId++;
        let path = "img/slideshow/" + imageId + ".jpg";

        try {
            fs.statSync(path);
        } catch (ex) {
            //reset to the first id - file doesn't exist
            imageId = 1;
            path = "img/slideshow/" + imageId + ".jpg";
            console.log("reset to the first slideshow id");
        }

        $('#status').fadeToggle(1000, "linear", () => {
            $("#background").animate({
                opacity: 0.0
            }, 3000, () => {
                let background = $("#background");
                background.css('background-image', 'url(' + path + ')');
                background.animate({
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

        if (stderr) {
            console.log(`stderr: ${stderr}`);
        }

        if (!stdout) {
            return;
        }

        console.log(`stdout: ${stdout}`);

        let components = stdout.split(/[ ,]+/);

        let upload = Math.round(parseInt(components[0], 10) / 1024 * 100) / 100;
        let download = Math.round(parseInt(components[1], 10) / 1024 * 100) / 100;

        $("#upload").text("Current: " + upload + " kB/S");
        $("#download").text("Current: " + download + " kB/s");
    });
}

function updateTime() {
    let now = new Date();
    let header = dateFormat(now, "dddd, mmmm dS");
    let time = dateFormat(now, "H:MM:ss");

    $("#date").text(header);
    $("#time").text(time);
}

function setMapsImage(mapsApiKey, origin, destination) {
    let url = "https://www.google.com/maps/embed/v1/directions?" +
        "key=" + mapsApiKey + "&origin=" + origin + "&destination=" + destination;
    $("#map").find("iframe").prop('src', url);
}
