//imports
const {ipcRenderer} = require('electron')

var https = require('https');

ipcRenderer.on('config-loaded', (event, config) => {

});

function updateCalendar() {
    var options = {
        host: 'webmailer.1und1.de',
        port: 443,
        path: '/',
        method: 'GET',
        headers: {
            '': 0
        }
    };

    https.get(options, res => {
        res.on('data', chunk => {
            var data = JSON.parse(chunk);
            console.log(data);

        });
    });
}