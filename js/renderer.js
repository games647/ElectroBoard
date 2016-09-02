// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var fs = require('fs');
var imageId = 1;

setInterval(function() {
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
}, 5 * 1000);

fs.readdir(__dirname + "/../img/slideshow/", function(err, files) {
    if (err) {
        return;
    }

    files.forEach(function(file) {
        console.log('Files: ' + file);
    });
});