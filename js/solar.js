//imports
const {ipcRenderer} = require('electron')

var http = require('http');
var querystring = require('querystring');

ipcRenderer.on('config-loaded', (event, config) => {
    let solarPanelSession = config['solar-panel-session'];

    updateSolarData(solarPanelSession);
    setInterval(() => {
        updateSolarData(solarPanelSession);
    }, 5 * 1000);
});

function updateSolarData(session) {
    let data = querystring.stringify({
        'action': 'get.hyb.overview'
    });

    let options = {
        host: '192.168.0.75',
        port: 80,
        path: '/cgi-bin/ipcclient.fcgi?0' + session,
        method: 'POST',
        headers: {
            'Content-Length': Buffer.byteLength(data)
        }
    };

    let req = http.request(options, res => {
        res.on('data', chunk => {
            let components = chunk.toString().split(/[|]+/);

            let powerPct = parseFloat(components[1]);
            $("#powerPct").text(powerPct + ' %');
            $("#powerEnergy").text(components[2]);
            updateSolarImage("panel", powerPct);

            let batteryPct = parseFloat(components[3]);
            $("#batteryPct").text(batteryPct + ' %');
            updateSolarImage("battery", batteryPct);

            // var sufficient = components[5];
            // var consume = components[6];

            let transferType = components[7];
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
        }).on('error', e => {
            console.log(`Got error: ${e.message}`);
        });
    });

    req.write(data);
    req.end();
}

function updateSolarImage(id, pct) {
    let imageHeight = 150 - 150 / 100 * pct;
    if (pct == 100) {
        imageHeight = 0;
    }

    $("#" + id + " .solar-icon div:first-child").css('height', imageHeight + "px");
    $("#" + id + " .solar-icon div:nth-child(2)").css('height', 150 - imageHeight + "px");
    $("#" + id + " .solar-icon div:nth-child(2)").css('background-position', '0px -' + imageHeight + "px");
}