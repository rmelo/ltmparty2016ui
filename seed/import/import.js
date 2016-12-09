var fs = require('fs');
var csv = require('fast-csv');
var rewards = require("./original-files/rewards.json");

var _data = { finished: false, entrants: {}, rewards: rewards };
var _id = 1;

var csvStream = csv
    .format({ headers: true })
    .transform(function (row) {
        return {
            Id: row.id,
            Email: row.email,
            FieldA: true,
            Pwd: 'JDJhJDEwJFZBc0hYTzl1RFcueW0vWDhleE51d3VtaFdOYVBid2w3ajBzWnJSamZzbWNVb2syYlRKejFD',
            FieldB: '',
            Name: row.name,
            Field1: '',
            Field2: '',
            Field3: '',
            Field4: '',
            Field5: '',
            Field6: '',
            Field7: '',
            Field8: '',
            Field9: '',
            Field10: '',
            Field11: '',
            Field12: '',
            Field13: '',
            Field14: '',
            Field15: '',
            Field16: '',
            Field17: ''
        };
    }),
    writableStream = fs.createWriteStream("./firebase-files/users-import.csv");

writableStream.on("finish", function () {
    console.log("CSV ok!");
});

csvStream.pipe(writableStream);

csv
    .fromPath("./original-files/entrants.csv", { delimiter: ';', headers: ['name', 'email'] })
    .transform(function (data) {
        return { id: _id++, name: data.name.trim(), email: data.email };

    })
    .on("data", function (data) {
        var key = data.email.split('.').join('_');
        _data.entrants[key] = { name: data.name, email: data.email };
        csvStream.write({ id: data.id, name: data.name, email: data.email });
    })
    .on("end", function () {
        csvStream.end();
        saveDataJson();
    });


function saveDataJson() {
    var data = JSON.stringify(_data);
    fs.writeFile('firebase-files/data.json', data, function (err) {
        if (err) return console.log(err);
        console.log('JSON ok!');
    });
}

function saveUsersCsv() {

}