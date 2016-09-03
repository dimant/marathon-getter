var http = require('http');
var async = require('async');
var cheerio = require('cheerio');
var json2csv = require('json2csv');

var host_name = 'www.runraceresults.com';
var event_id = 'RCLF2016';

var totalRows = 6334;

var results = [];

function getAll() {
    var paths = [];
    var row = 1;

    for(row = 1; row < totalRows; row += 100) {
        paths.push('/Secure/raceResultsAPI.cfm?do=race%3Aresults%3Aoneclick&EVID='+ event_id +'&RCID=1&SROW='+ row + '&TYPE=overall');
    }

    async.map(paths, getPage, 
    function(err, pages) {
        var p;
        for(p = 0; p < pages.length; p++) {
            var $ = cheerio.load(pages[p]);
            $('table:nth-of-type(2) tr').each(function(i, row){
                if(i > 0) {
                    var $row = $(row);
                    var result = {
                        'place': $row.find('td:nth-child(1)').text(),
                        'name': $row.find('td:nth-child(2)').text(),
                        'location': $row.find('td:nth-child(3)').text(),
                        'bib': $row.find('td:nth-child(4)').text(),
                        'net_time': $row.find('td:nth-child(5)').text(),
                        'pace': $row.find('td:nth-child(6)').text(),
                        'division_place': $row.find('td:nth-child(7)').text(),
                        'sex_age': $row.find('td:nth-child(8)').text(),
                        'sex_place': $row.find('td:nth-child(9)').text(),
                        'gun_time': $row.find('td:nth-child(10)').text(),
                        'age_grade': $row.find('td:nth-child(11)').text()
                    };
                    results.push(result);
                }
            });
        }
        json2csv(
            {
                data: results, 
                fields: Object.keys(results[0])
            }, function(err, csv) {
            console.log(csv);
        });
    });

}

function getPage(path, cb) {
    var options = {
        host: 'www.runraceresults.com',
        path: path
    };

    var request = http.request(options, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            cb(null, data);
        });
    });
    request.on('error', function (err) {
        cb(err);
    });
    request.end();
}

getAll();
