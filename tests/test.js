#!/usr/bin/env node

const
assert = require('assert'),
vows = require('vows'),
fs = require('fs'),
path = require('path'),
exec = require('child_process').exec;

var suite = vows.describe('cli');
var cliPath = '../lib/cli.js';

var existsSync = fs.existsSync ? fs.existsSync : path.existsSync;

suite.addBatch({
  "run seal generate": {
    topic: function () {
      var cmd = cliPath + ' g --cache-dir ./good-pkgs';
      var child = exec(cmd, {cwd: path.resolve(__dirname)}, this.callback);
    },
    "sealed shrinkwrap file is generated" : function (error, stdout, stderr) {
      assert.equal(existsSync(path.resolve(__dirname + '/sealed-npm-shrinkwrap.json')), true);
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
        assert.ok(stderr !== '');
        var errors = JSON.parse(stderr);
        assert.deepEqual(errors, [
          {
            "dep": "nomnom 1.5.2",
            "expected": "7ed296f20474f9860a77d211c6b2891a0b7f4664",
            "actual": "fb030a9d50db36037ff170739b8a14db51194e99"
          }
        ]);
      }
    }
  }
});

suite.addBatch({
 "run seal generate with input param": {
    topic: function () {
      var cmd = cliPath + ' --cache-dir ./good-pkgs generate ./npm-shrinkwrap2.json';
      var child = exec(cmd, {cwd: path.resolve(__dirname)}, this.callback);
    },
    "sealed shrinkwrap file is generated" : function (error, stdout, stderr) {
      var json = require(path.resolve(__dirname + '/sealed-npm-shrinkwrap.json'));
      assert.equal(json.name, "test-seal-2");
      assert.equal(existsSync(path.resolve(__dirname + '/sealed-npm-shrinkwrap.json')), true);
    }
  },
  "run seal generate with output param": {
    topic: function () {
      var cmd = cliPath + ' --cache-dir ./good-pkgs --output test.json generate';
      var child = exec(cmd, {cwd: path.resolve(__dirname)}, this.callback);
    },
    "test.json file is generated" : function (error, stdout, stderr) {
      assert.equal(existsSync(path.resolve(__dirname + '/test.json')), true);
    }
  }
});

suite.addBatch({
  "cleanup": function () {
    fs.unlink(path.resolve(__dirname+'/sealed-npm-shrinkwrap.json'));
    fs.unlink(path.resolve(__dirname+'/test.json'));
  }
});

// run or export the suite.
if (process.argv[1] === __filename) suite.run();
else suite.export(module);
