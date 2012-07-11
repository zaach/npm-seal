# seal

This module can verify that packages installed during development are
identical to those installed during deployment. The standard `npm shrinkwrap`
only ensures that package versions are the same, but does not verify contents.
This module checks the shasum of the package tarballs downloaded by npm during
development and deployment to ensure they are the same.

![seal](https://github.com/zaach/npm-seal/raw/master/npm-seal.png)

Usage:

1. Install you packages (`npm install`)
2. Generate shrinkwrap (`npm shrinkwrap`)
3. Generate a sealed shrinkwrap file (`seal g`)
4. Deploy code and install packages (on server, `npm install`)
5. Check sealed shrinkwrap against installed packages (on server, `seal c`)
6. If the check fails, errors will be dumped to stderr in JSON

## Install

    npm install seal -g

## CLI
    $ seal -h
     Usage: seal [command] [input] [options]

    command     generate from a shrinkwrap or check a sealed shrinkwrap [g|generate|c|check]
    input       the shrinkwrap or sealed shrinkwrap file

    Options:
       -o FILE, --output FILE    write output to specified file
       -c DIR, --cache-dir DIR   directory where npm package downloads are cached
       -v, --version             print version and exit

