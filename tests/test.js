#!/usr/bin/env node

const
assert = require('assert'),
vows = require('vows'),
fs = require('fs'),
path = require('path'),
exec = require('child_process').exec;

var suite = vows.describe('cli');
var cliPath = '../lib/cli.js';

suite.addBatch({
  "run seal generate": {
    topic: function () {
      var cmd = cliPath + ' g --cache-dir ./good-pkgs';
      var child = exec(cmd, {cwd: path.resolve(__dirname)}, this.callback);
    },
    "sealed shrinkwrap file is generated" : function (error, stdout, stderr) {
      assert.equal(fs.existsSync(path.resolve(__dirname + '/sealed-npm-shrinkwrap.json')), true);
    },
    "run seal check": {
      topic: function () {
        var cmd = cliPath + ' c --cache-dir ./good-pkgs';
        var child = exec(cmd, {cwd: path.resolve(__dirname)}, this.callback);
      },
      "verification succeeds": function (error, stdout, stderr) {
        assert.equal(error, null);
      }
    },
    "run seal check when tarballs have changed": {
      topic: function () {
        var cmd = cliPath + ' c --cache-dir ./bad-pkgs';
        var child = exec(cmd, {cwd: path.resolve(__dirname)}, this.callback);
      },
      "verification fails": function (error, stdout, stderr) {
        var errors = JSON.parse(stderr);
        assert.equal(errors.length, 2);
      }
    }
  }
});

suite.addBatch({
  "cleanup": function () {
    fs.unlink(path.resolve(__dirname+'/sealed-npm-shrinkwrap.json'));
  }
});

// run or export the suite.
if (process.argv[1] === __filename) suite.run();
else suite.export(module);
