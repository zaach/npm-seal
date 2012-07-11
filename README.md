 # seal #

 This module can verify that packages installed during development are
 identical to those installed during deployment. The standard `npm shrinkwrap`
 only ensures that package versions are the same, but does not verify contents.
 This module checks the shasum of the package tarballs downloaded by npm during
 development and deployment to ensure they are the same.

 Usage:
 # Install you packages (`npm install`)
 # Generate shrinkwrap (`npm shrinkwrap`)
 # Generate a sealed shrinkwrap file (`seal g`)
 # Deploy code and install packages (on server, `npm install`)
 # Check sealed shrinkwrap against installed packages (on server, `seal c`)
 # If the check fails, errors will be dumped to stderr in JSON

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

