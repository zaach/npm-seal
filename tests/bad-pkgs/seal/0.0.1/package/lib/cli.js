#!/usr/bin/env node
const fs   = require('fs');
const path = require('path');
const seal = require('./seal');

var opts = require("nomnom")
   .script('seal')
   .option('output', {
      abbr: 'o',
      metavar: 'FILE',
      default: 'sealed-npm-shrinkwrap.json',
      help: 'write output to specified file'
   })
   .option('cache-dir', {
      abbr: 'c',
      metavar: 'DIR',
      default: process.env['HOME'] + '/.npm',
      help: 'directory where npm package downloads are cached'
   })
   .option('version', {
      abbr: 'v',
      flag: true,
      help: 'print version and exit',
      callback: function() {
         return require('../package.json').version;
      }
   })
   .option('command', {
      position: 0,
      help: 'generate from a shrinkwrap or check a sealed shrinkwrap [g|generate|c|check]'
   })
   .option('input', {
      position: 1,
      metavar: 'FILE',
      help: 'the shrinkwrap or sealed shrinkwrap file'
   })
   .parse();

function main (opts) {
  var cmd = opts.command;
  var file = opts.input;
  var sources = {};

  if (cmd === 'g' || cmd === 'generate') {
    var parentDir = file && file.slice(0, file.lastIndexOf('/')) || '.';
    seal.generate(file, {cache: opts['cache-dir'], output: opts.output},
      function (err, wrap) {
        if (err) throw err;
        fs.writeFile(path.resolve(parentDir + '/sealed-npm-shrinkwrap.json'), JSON.stringify(wrap, null, '  '));
      });
  } else {
    seal.check(file, {cache: opts['cache-dir']},
      function (err, wrap) {
        if (err) {
          console.error(JSON.stringify(err, null, '  '));
          process.exit(1);
        }
      });
  }
}

exports.main = main;

if (require.main === module)
  main(opts);
