const argv = require('yargs').argv;

exports.getEnvName = () => argv.env || 'development';

exports.beepSound = () => process.std.write('\u0007');
