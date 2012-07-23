#!/usr/bin/env node

/*
 * This module can verify that packages installed during development are
 * identical to those installed during deployment. The standard npm shrinkwrap
 * only ensures that package versions are the same, but does not verify contents.
 * This module checks the shasum of the package tarballs downloaded by npm during
 * development and deployment to ensure they are the same.
 *
 * Usage:
 * 1) Install you packages
 * 2) Generate shrinkwrap
 * 3) Generate a sealed shrinkwrap file (using this module)
 * 4) Deploy code and install packages
 * 5) Check sealed shrinkwrap against installed packages
 * 6) If the check fails, errors will be dumped to stderr in JSON
 * */

const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');
const npm    = require('npm');
const exec   = require('child_process').exec;

function esc (str) {
    return (str+'').replace(/([.?*+^$[\]\\(){}|\-\/])/g, "\\$1");
};


function hashDirectory (cacheDir, dir, cb) {
  return exec("find " + dir + " -type f -print0 | xargs -0 shasum | sed 's/ " + esc(cacheDir) + "//g' | sort | shasum",
    function (err, stdout, stderr) {
      if (err) cb(err);
      cb(null, stdout.split(/\s+/)[0]);
    });
}

// load (sealed) shrinkwrap file
function loadWrap (file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function moduleJson (dir, name) {
  return JSON.parse(fs.readFileSync(path.resolve(path.join(npm.dir, dir, name, 'package.json')), "utf8"));
}

// Generate a sealed shrinkwrap file
// shrinkwrapFile is the shrinkwrap file for your project
// cacheDir is the directory where the dependency packages are cached
function generate (shrinkwrapFile, opts, cb) {
  var wrap = loadWrap(shrinkwrapFile || 'npm-shrinkwrap.json');

  traverseWrap(wrap, opts.cache,
    function (err, name, dep, d) {
      if (err) throw err;
      dep.shasum = d;
    }, cb);
}

// Check that the sealed shrinkwrap corresponds to the currently installed modules
// sealedwrapFile is the sealed npm shrinkwrap file for your project
// cacheDir is the directory where the dependency packages are cached
function check (sealedwrapFile, opts, cb) {
  var sealed = loadWrap(sealedwrapFile || 'sealed-npm-shrinkwrap.json');
  var errors = [];

  traverseWrap(sealed, opts.cache,
    function (err, name, dep, d) {
      if (err) throw err;
      if (dep.shasum !== d) {
        errors.push({dep: name + ' ' + dep.version, expected: dep.shasum, actual: d});
      }
    }, function (err, wrap) {
      cb(errors.length ? errors : null, wrap);
    });
}

// traverse a wrap, executing the hash callback after each
// file is hashed, and end callback when all files have been hashed
function traverseWrap (wrap, cacheDir, hashCB, endCB) {
  var toHash = 0;

  Object.keys(wrap.dependencies).forEach(function (depName) {
    _traverseWrap(path.join(npm.dir, depName), depName, wrap.dependencies[depName]);
  });

  function _traverseWrap (depPath, name, dep) {
    toHash++;
    var data = localJson(path.join(depPath));

    // generate shasum of directory contents
    hashDirectory(path.resolve(cacheDir), path.resolve(path.join(cacheDir, name, dep.version, "package")), function (err, d) {
      hashCB(err, name, dep, d);
      if (--toHash === 0) {
        endCB(err, wrap);
      }
    });
    if (dep.dependencies) {
      Object.keys(dep.dependencies).forEach(function (depName) {
        // skip bundled bependencies, the sha of the parent covers these
        if (data.bundleDependencies && data.bundleDependencies.indexOf(depName) >= 0) return;
        _traverseWrap(path.join(depPath, 'node_modules', depName), depName, dep.dependencies[depName]);
      });
    }
  }
}

function localJson (p) {
  var json = JSON.parse(fs.readFileSync(path.join(p, 'package.json'), 'utf8'));
  return json;
}

exports.generate = generate;
exports.check    = check;

