const fs = require('fs');
const f = 'node_modules/scrypt/index.js';

fs.readFile(f, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    var result = data.replace(/\.\/build\/Release\/scrypt/g, 'scrypt');

    fs.writeFile(f, result, 'utf8', function (err) {
        if (err) return console.log(err);
    });
});
