//imports
const {ipcRenderer} = require('electron')

var https = require('https');
var querystring = require('querystring');

ipcRenderer.on('config-loaded', (event, config) => {

});

function updateCalendar() {
    var data = querystring.stringify({
        '': ''
    });

    var options = {
        host: 'webmailer.1und1.de',
        port: 443,
        path: '/',
        method: 'GET',
        headers: {
            'Cookie': 0,
            '': 0
        }
    };

    https.get(options, res => {
        res.on('data', chunk => {
            var data = JSON.parse(chunk);
            console.log(data);

            $(".calendar .row:nth-child(1) .calendar-time").text("");
            $(".calendar .row:nth-child(1) .calendar-title").text("");
        });
    });
}