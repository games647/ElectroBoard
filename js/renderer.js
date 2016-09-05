// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//imports
var fs = require('fs');
var dateFormat = require('dateformat');
var exec = require('child_process').exec;
var http = require('http');
var querystring = require('querystring');

var imageId = 1;

setInterval(updateSolarData, 5 * 1000)
setInterval(updateTime, 1000)
setInterval(nextSlide, 5 * 1000);

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

    var req = http.request(options, function(res) {
        res.on('data', function (chunk) {
            var components = chunk.toString().split(/[|]+/);

            $("#powerPct").text(components[1] + ' %');
            $("#powerEnergy").text(components[2]);

            $("#batteryPct").text(components[3] + ' %');

            var sufficient = components[5]
            var consume = components[6]

            var type = components[7]
            $("#transfer").text(components[8]);
        });
    });

    req.write(data);
    req.end();
}

setInterval(function() {
    exec('"scripts/network-activity.py"', function(error, stdout, stderr) {
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