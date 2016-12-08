var bcrypt = require('bcrypt-nodejs');

var password = 'BACON';
var hash = bcrypt.hashSync(password);
var buffer = new Buffer(hash);
var password64 = buffer.toString('base64');

console.log(password64);