# cmdtool

Simple utility to import datasets and functions into
a benchmarking backend DB.

## Building

```sh
yarn install && yarn build
```

## Running

Prerequisite: set DATABASE_URL to an appropriate value; e.g. by picking the value used for the benchmarking backend.

### Importing a "data import"

An import consists of zero or more datasets and zero or more functions.

The data import is just a big JSON file. An example can be found in `examples/`

Example import:

```sh
./cmdtool import examples/import-example.json
```
