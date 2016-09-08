//imports
const {ipcRenderer} = require('electron')

var https = require('https');
var querystring = require('querystring');
var util = require('util');

//consts
const CLIENT_FORMAT = "freifunk.%s.clients";
const RX_FORMAT = "aliasByNode(perSecond(scale(freifunk.%s.traffic.rx.bytes, 8)), 1, 3)";
const TX_FORMAT = "aliasByNode(perSecond(scale(freifunk.%s.traffic.tx.bytes, 8)), 1, 3)";

ipcRenderer.on('config-loaded', function(event, config) {
    updateFreifunkInfo(config['freifunk-nodes'], config['freifunk-stats-server'])
    setInterval(function () {
        updateFreifunkInfo(config['freifunk-nodes'], config['freifunk-stats-server'])
    }, 60 * 1000);
})

function updateFreifunkInfo(nodes, server) {
    var targets = [];
    for (i = 0; i < nodes.length; ++i) {
        var node = nodes[i];

        targets.push(util.format(CLIENT_FORMAT, node));
        targets.push(util.format(RX_FORMAT, node));
        targets.push(util.format(TX_FORMAT, node));
    }

    var data = querystring.stringify({
        'target': targets,
        'from': "-5min",
        'until': "now",
        'format': 'json',
        'maxDataPoints': '100'
    });

    var options = {
        host: server,
        port: 443,
        path: '/graphite/render',
        method: 'POST',
        headers: {
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var req = https.request(options, function (res) {
        res.on('data', function (chunk) {
            var data = JSON.parse(chunk);
            console.log(data);

            var clients = 0;
            var rx = 0;
            var tx = 0;
            for (i = 0; i < data.length; ++i) {
                var section = data[i];
                var target = section.target;

                var oldest = section.datapoints[section.datapoints.length - 1];
                if (oldest[0] == null) {
                    continue;
                }

                if (target.endsWith('clients')) {
                    clients += oldest[1];
                } else if (target.endsWith('rx')) {
                    rx += parseInt(oldest[0]);
                } else if (target.endsWith('tx')) {
                    tx += parseInt(oldest[0]);
                }
            }

            tx = Math.round(tx / 1024 * 100) / 100;
            rx = Math.round(rx / 1024 * 100) / 100;
            $("#freifunk-clients").text("Clients: " + clients + " kB/s");
            $("#freifunk-up").text("Upstream: " + tx + " kB/s");
            $("#freifunk-down").text("Downstream: " + rx + " kB/s");
        });
    });

    req.write(data);
    req.end();
};