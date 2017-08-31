//imports
const {ipcRenderer} = require('electron')

const http = require('http');
const querystring = require('querystring');

ipcRenderer.on('config-loaded', (event, config) => {
    let solarPanelPassword = config['solar-panel-password'];
    let host = config['solar-panel-ip'];

    startNewSession(host, session => {
        authenticate(host, session, solarPanelPassword);

        updateSolarData(host, session);
        setInterval(() => {
            updateSolarData(host, session);
        }, 5 * 1000);
    });
});

function startNewSession(host, callback) {
    http.get('http://' + host, res => {
        console.log(`STATUS: ${res.statusCode}`);
        let newLocation = res.headers.location;

        //remove the beginning and separate the key from the rest
        let session = newLocation.substring(0, newLocation.indexOf('&')).replace('/cgi-bin/webgui.cgi?', '');

        callback(session);
    }).on('error', event => {
        console.log(`problem with request: ${event.message}`);
    });
}

function authenticate(host, session, password) {
    let data = querystring.stringify({
        'Tpassversion': 'entrypw',
        'Tpass': password
    });

    let options = {
        host: host,
        path: 'cgi-bin/security.cgi?' + session,
        method: 'POST',
        headers: {
            'Content-Length': Buffer.byteLength(data)
        }
    };

    let req = http.request(options, res => {
        console.log(`STATUS: ${res.statusCode}`);

        res.on('data', chunk => {
            console.log(chunk.toString())
        });
    }).on('error', event => {
        console.log(`problem with request: ${event.message}`);
    });

    req.write(data);
    req.end();
}

function updateSolarData(host, session) {
    let data = querystring.stringify({
        'action': 'get.hyb.overview'
    });

    let options = {
        host: host,
        path: '/cgi-bin/ipcclient.fcgi?' + session,
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
            let firstChild = $("#transfer .solar-icon div:first-child");
            if (transferType == 'g') {
                //output
                $("#transferType").prop('class', "glyphicon glyphicon-chevron-up");

                firstChild.css('background-image', "url('img/transfer-output.png')");
                firstChild.css('height', "150px");
            } else if (transferType == 'r') {
                //input
                $("#transferType").prop('class', "glyphicon glyphicon-chevron-down");

                firstChild.css('background-image', "url('img/transfer-input.png')");
                firstChild.css('height', "150px");
            } else {
                //e for neutral
                $("#transferType").prop('class', "glyphicon glyphicon-minus");

                firstChild.css('background-image', "url('img/transfer-empty.png')");
                firstChild.css('height', "150px");
            }

            $("#transferEnergy").text(components[8]);
        });
    }).on('error', event => {
        console.log(`problem with request: ${event.message}`);
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
    let secondChild = $("#" + id + " .solar-icon div:nth-child(2)");
    secondChild.css('height', 150 - imageHeight + "px");
    secondChild.css('background-position', '0px -' + imageHeight + "px");
}
