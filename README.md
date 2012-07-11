# seal

seal can verify that packages installed during development are identical
to those installed during deployment. The standard `npm shrinkwrap`
only ensures that package versions are the same, but does not verify contents.
seal checks the shasum of the package tarballs downloaded by npm during
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

    Usage: seal <command> [input] [options]

    command     [generate|g|check|c] generate from a shrinkwrap or check a sealed shrinkwrap 
    input       the shrinkwrap or sealed shrinkwrap file

    Options:
       -o FILE, --output FILE    write output to specified file
       -c DIR, --cache-dir DIR   directory where npm package downloads are cached
       -v, --version             print version and exit

    Examples:
    seal generate ./npm-shrinkwrap.json
    seal check ./sealed-npm-shrinkwrap.json

    If the check fails, JSON will be dumped to stderr. E.g.:
    [
      {
        "dep": "nomnom 1.5.2",
        "expected": "0ca9b018aedeeee38838a3c573d3caafa510522878adc4d26a51eea69fc7cf52",
        "actual": "b6cfb2d504d702a8cebca2b66d28efcf6a0f752dceeb234d1a9b291e9f62249d"
      },
      {
        "dep": "seal 0.0.1",
        "expected": "cb6454e280f5ab0218a756902cd0709b5c573f636fc3fa7ba1439a29da8b9824",
        "actual": "14a7e03047fd3eef6590382d0456d410965f35b685a63c15620e3b2fb0dedd92"
      }
    ]

## License

MIT
