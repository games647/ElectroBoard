// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var fs = require('fs');
var dateFormat = require('dateformat');
var exec = require('child_process').exec;

var imageId = 1;

setInterval(function() {
    exec('"scripts/network-activity.py"', function(error, stdout, stderr) {
        console.log(stdout)

        var components = stdout.split(/[ ,]+/);

        var upload = parseInt(components[0], 10) / 1000;
        var download = parseInt(components[1], 10) / 1000;

        $("#upload").text("Current: " + upload + " kB/S");
        $("#download").text("Current: " + download + " kB/s");
    });
}, 3*  1000);

setInterval(function() {
    nextSlide()
}, 5 * 1000);

function nextSlide() {
    imageId++;
    var path = "img/slideshow/" + imageId + ".png";

    if (!fs.existsSync(path)) {
        imageId = 1;
        path = "img/slideshow/" + imageId + ".png";
    }

    console.log("Update " + path);
    $('#slide').fadeToggle(1000, "linear", function () {
        $('#slide').attr("src", path);
        $('#slide').fadeToggle(1000, "linear");
    });
}


setInterval(function () {
    updateTime()
}, 1000)

function updateTime() {
    var now = new Date();
    var header = dateFormat(now, "dddd, mmmm dS, yyyy");
    var time = dateFormat(now, "H:MM:ss")

    $("#date").text(header);
    $("#time").text(time);
}