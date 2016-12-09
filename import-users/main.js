

var bcrypt = require('bcrypt-nodejs');

var password = process.argv[2];
if (password) {

    var hash = bcrypt.hashSync(password);
    var buffer = new Buffer(hash);
    var password64 = buffer.toString('base64');

    console.log(password64);
}else{
    console.error('Password not supplied');
}