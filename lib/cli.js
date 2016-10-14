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
      required: true,
      help: '[generate|g|check|c] generate from a shrinkwrap or check a sealed shrinkwrap '
   })
   .option('input', {
      position: 1,
      metavar: 'FILE',
      help: 'the shrinkwrap or sealed shrinkwrap file'
   })
   .help("Examples:\nseal generate ./npm-shrinkwrap.json\nseal check ./sealed-npm-shrinkwrap.json\n\n" +
   'If the check fails, JSON will be dumped to stderr. E.g.:\n[\n\
  {\n\
    "dep": "nomnom 1.5.2",\n\
    "expected": "0ca9b018aedeeee38838a3c573d3caafa510522878adc4d26a51eea69fc7cf52",\n\
    "actual": "b6cfb2d504d702a8cebca2b66d28efcf6a0f752dceeb234d1a9b291e9f62249d"\n\
  },\n\
  {\n\
    "dep": "seal 0.0.1",\n\
    "expected": "cb6454e280f5ab0218a756902cd0709b5c573f636fc3fa7ba1439a29da8b9824",\n\
    "actual": "14a7e03047fd3eef6590382d0456d410965f35b685a63c15620e3b2fb0dedd92"\n\
  }\n\
]')
   .parse();

function main (opts) {
  var cmd = opts.command;
  var file = opts.input;
  var sources = {};

  if (cmd === 'g' || cmd === 'generate') {
    var parentDir = file && path.dirname(file) || '.';
    seal.generate(file, {cache: opts['cache-dir']},
      function (err, wrap) {
        if (err) throw err;
        fs.writeFile(path.resolve(path.join(parentDir, opts.output)), JSON.stringify(wrap, null, '  '));
      });
  } else if (cmd === 'c' || cmd === 'check') {
    seal.check(file, {cache: opts['cache-dir']},
      function (err, wrap) {
        if (err) {
          console.error(JSON.stringify(err, null, '  '));
          process.exit(1);
        }
      });
  } else {
    console.log('Invalid command. Valid commands are: generate, g, check, c');
  }
}

exports.main = main;

if (require.main === module)
  main(opts);
