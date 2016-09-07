//imports
var http = require('http');
var querystring = require('querystring');

setInterval(updateSolarData, 5 * 1000)

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

            var powerPct = parseFloat(components[1]);
            $("#powerPct").text(powerPct + ' %');
            $("#powerEnergy").text(components[2]);
            updateSolarImage("panel", powerPct);

            var batteryPct = parseFloat(components[3]);
            $("#batteryPct").text(batteryPct + ' %');
            updateSolarImage("battery", batteryPct);

            var sufficient = components[5];
            var consume = components[6];

            var transferType = components[7];
            if (transferType == 'g') {
                //output
                $("#transferType").prop('class', "glyphicon glyphicon-chevron-up");

                $("#transfer .solar-icon div:first-child").css('background-image', "url('img/transfer-output.png')");
                $("#transfer .solar-icon div:first-child").css('height', "150px");
            } else if (transferType == 'r') {
                //input
                $("#transferType").prop('class', "glyphicon glyphicon-chevron-down");

                $("#transfer .solar-icon div:first-child").css('background-image', "url('img/transfer-input.png')");
                $("#transfer .solar-icon div:first-child").css('height', "150px");
            } else {
                //e for neutral
                $("#transferType").prop('class', "glyphicon glyphicon-minus");

                $("#transfer .solar-icon div:first-child").css('background-image', "url('img/transfer-empty.png')");
                $("#transfer .solar-icon div:first-child").css('height', "150px");
            }

            $("#transferEnergy").text(components[8]);
        });
    });

    req.write(data);
    req.end();
}

function updateSolarImage(id, pct) {
    var imageHeight = 150 - 150 / 100 * pct;
    if (pct == 100) {
        imageHeight = 0;
    }

    $("#" + id + " .solar-icon div:first-child").css('height', imageHeight + "px");
    $("#" + id + " .solar-icon div:nth-child(2)").css('height', 150 - imageHeight + "px");
    $("#" + id + " .solar-icon div:nth-child(2)").css('background-position', '0px -' + imageHeight + "px");
}