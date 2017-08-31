//imports
const {ipcRenderer} = require('electron');

const https = require('https');
const querystring = require('querystring');
const util = require('util');

//consts
const CLIENT_FORMAT = "freifunk.%s.clients";
const RX_FORMAT = "aliasByNode(perSecond(scale(freifunk.%s.traffic.rx.bytes, 8)), 1, 3)";
const TX_FORMAT = "aliasByNode(perSecond(scale(freifunk.%s.traffic.tx.bytes, 8)), 1, 3)";

ipcRenderer.on('config-loaded', (event, config) => {
    let freifunkNodes = config['freifunk-nodes'];
    let statsServer = config['freifunk-stats-server'];

    updateFreifunkInfo(freifunkNodes, statsServer);
    setInterval(() => {
        updateFreifunkInfo(freifunkNodes, statsServer)
    }, 60 * 1000);
});

function updateFreifunkInfo(nodes, server) {
    let targets = [];
    for (let i = 0; i < nodes.length; ++i) {
        let node = nodes[i];

        targets.push(util.format(CLIENT_FORMAT, node));
        targets.push(util.format(RX_FORMAT, node));
        targets.push(util.format(TX_FORMAT, node));
    }

    let data = querystring.stringify({
        'target': targets,
        'from': "-5min",
        'until': "now",
        'format': 'json',
        'maxDataPoints': '100'
    });

    let options = {
        host: server,
        port: 443,
        path: '/graphite/render',
        method: 'POST',
        headers: {
            'Content-Length': Buffer.byteLength(data)
        }
    };

    let req = https.request(options, res => {
        res.on('data', chunk => {
            let data = JSON.parse(chunk);
            console.log(data);

            let clients = 0;
            let rx = 0;
            let tx = 0;
            for (let i = 0; i < data.length; ++i) {
                let section = data[i];
                let target = section.target;

                //begin from the newest
                let position = section.datapoints.length - 1;
                let newest = section.datapoints[position];
                while (newest !== null && newest[0] === null) {
                    newest = section.datapoints[--position];
                }

                if (newest === null) {
                    continue;
                }

                if (target.endsWith('clients')) {
                    clients += newest[0];
                } else if (target.endsWith('rx')) {
                    rx += parseInt(newest[0]);
                } else if (target.endsWith('tx')) {
                    tx += parseInt(newest[0]);
                }
            }

            tx = Math.round(tx / 1024 * 100) / 100;
            rx = Math.round(rx / 1024 * 100) / 100;
            $("#freifunk-clients").text("Clients: " + clients + "");
            $("#freifunk-up").text("Up: " + tx + " kB/s");
            $("#freifunk-down").text("Down: " + rx + " kB/s");
        });
    }).on('error', event => {
        console.log(`problem with request: ${event.message}`);
    });

    req.write(data);
    req.end();
}
