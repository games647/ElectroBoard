//imports
const {ipcRenderer} = require('electron')

var https = require('https');
var querystring = require('querystring');
var dateFormat = require('dateformat');

//constants
const MAX_ENTRIES = 5;

ipcRenderer.on('config-loaded', (event, config) => {
    var xchangePrefix = config['xchange-secret-prefix'];
    var xchangeSecret = config['xchange-secret'];
    var calendarSession = config['calendar-session'];

    updateCalendar(xchangePrefix, xchangeSecret, calendarSession)
    setInterval(function () {
        updateCalendar(xchangePrefix, xchangeSecret, calendarSession);
    }, 60 * 60 * 1000);
});

function updateCalendar(xchangePrefix, xchangeSecret, session) {
    var now = new Date().getTime();
    var data = querystring.stringify({
        'action': 'all',
        'columns': '200,201,202,400',
        'start': now,
        'end': now + 7 * 24 * 60 * 60 * 1000,
        'timezone': 'UTC',
        'session': session
    });

    var options = {
        host: 'mailxchange.de',
        port: 443,
        path: '/appsuite/api/calendar?' + data,
        method: 'GET',
        headers: {
            'Cookie': "open-xchange-secret-" + xchangePrefix + "=" + xchangeSecret
        }
    };

    https.get(options, res => {
        res.on('data', chunk => {
            var data = JSON.parse(chunk);
            console.log(data);

            if (data.error) {
                return console.log(data.error);
            }

            var events = data.data;

            //hide all entries to remove outdated ones
            for (var row = 0; row < MAX_ENTRIES; ++row) {
                $("#calendar-content .row:nth-child(" + (row + 1) + ")").hide();
            }

            for (var row = 0; row < events.length || row == MAX_ENTRIES; ++row) {
                var event = events[row];
                var name = event[0];
                var eventStart = event[1];
                var end = event[2];

                var time = dateFormat(eventStart, 'd / m HH:MM');
                $("#calendar-content .row:nth-child(" + (row + 1) + ")").show();
                $("#calendar-content .row:nth-child(" + (row + 1) + ") .calendar-time span").text(time);
                $("#calendar-content .row:nth-child(" + (row + 1) + ") .calendar-title span").text(name);
            }
        }).on('error', e => {
            console.log(`Got error: ${e.message}`);
        });;
    });
}