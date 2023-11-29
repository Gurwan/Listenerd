const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const folder = path.join(__dirname, '../../logs');
if(!fs.existsSync(folder)){
    fs.mkdirSync(folder);
}

const file = fs.createWriteStream(path.join(folder, 'log-api.log'),{flags:'a'}); //flag a to append in the file

const loggerMiddleware = morgan('combined',{stream:file});

module.exports = loggerMiddleware;