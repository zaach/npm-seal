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

const crypto      = require('crypto');
const fs          = require('fs');
const path        = require('path');
const npmRoot     = require('npm-root');

// get the shasum from a dependency's package.json file. The shasum is the
// checksum of the tarball downloaded by npm when `npm install` is run.
// Use the '*' as filler if no shasum exists in the package.json file.
function getShaSum(depPath, name, version) {
  var sha;
  try {
    sha = require(path.resolve(path.join(depPath, 'package.json'))).dist.shasum;
  } catch (e) {
    if ("Cannot read property 'shasum' of undefined" !== e.message) {
      // only log errors that aren't causes by a missing shasum in the dep's package.json
      console.error(e);
    }
  }
  if (!sha) console.log("Warning: no shasum for "+name+"@"+version);

  return sha || "*"; // filler bytes for package with no shasum in it's package.json
}


// load (sealed) shrinkwrap file
function loadWrap (file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

// Generate a sealed shrinkwrap file
// shrinkwrapFile is the shrinkwrap file for your project
function generate (shrinkwrapFile, opts, cb) {
  var wrap = loadWrap(shrinkwrapFile || 'npm-shrinkwrap.json');

  traverseWrap(wrap, function (err, name, dep, d) {
      if (err) throw err;
      dep.shasum = d;
    }, cb);
}

// Check that the sealed shrinkwrap corresponds to the currently installed modules
// sealedwrapFile is the sealed npm shrinkwrap file for your project
function check (sealedwrapFile, opts, cb) {
  var sealed = loadWrap(sealedwrapFile || 'sealed-npm-shrinkwrap.json');
  var errors = [];

  traverseWrap(sealed, function (err, name, dep, d) {
      if (err) throw err;
      if (dep.shasum !== '*' && dep.shasum !== d) {
        errors.push({dep: name + ' ' + dep.version, expected: dep.shasum, actual: d});
      }
    }, function (err, wrap) {
      cb(errors.length ? errors : null, wrap);
    });
}

// traverse a wrap, executing the hash callback after each
// file is hashed, and end callback when all files have been hashed
function traverseWrap (wrap, hashCB, endCB) {
  var toHash = 0;

  function _traverseWrap (depPath, name, dep) {
    toHash++;
    var data = JSON.parse(fs.readFileSync(path.join(path.join(depPath), 'package.json'), 'utf8'));
    var sha = getShaSum(depPath, name, dep.version);
    hashCB(null, name, dep, sha);

    if (dep.dependencies) {
      Object.keys(dep.dependencies).forEach(function (depName) {
        // skip bundled dependencies, the sha of the parent covers these
        if (data.bundleDependencies && data.bundleDependencies.indexOf(depName) >= 0) return;
        _traverseWrap(path.join(depPath, 'node_modules', depName), depName, dep.dependencies[depName]);
      });
    }
    if (--toHash === 0) {
      endCB(null, wrap);
    }
  }

  // get path to local node_modules (or global if the local path does not exist)
  npmRoot(function (err, localNpmPath) {
    if (err) throw new Error('no node_modules path found!');


    // recurse through this package's dependencies, if any exist
    Object.keys(wrap.dependencies).forEach(function (depName) {
      _traverseWrap(path.join(localNpmPath, depName), depName, wrap.dependencies[depName]);
    });
  });
}

exports.generate = generate;
exports.check    = check;

