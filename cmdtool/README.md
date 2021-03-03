# cmdtool

Simple utility to import datasets and functions into
a benchmarking backend DB.

## Building

```sh
yarn install && yarn build
```

## Running

Prerequisite: set DATABASE_URL to an appropriate value; e.g. by picking the value used for the benchmarking backend.

## Synopsis

```sh
$ ./cmdtool
Usage: cmdtool [options] [command]

Options:
  -h, --help                 display help for command

Commands:
  set-function <json-file>   Creates or updates a MPC function
  set-dataset <json-file>    Creates or updates a dataset
  import <json-file>         Perform batch import of functions and datasets
  create-function-prototype  Outputs a function definition JSON
  create-dataset-prototype   Outputs a dataset definition JSON
  create-import-prototype    Outputs a bulk import JSON definition
  help [command]             display help for command
```

## Function Definition Syntax and Semantics

The benchmarking service performs a matrix vector multiplication as part of
the function interface, wherein the matrix is secret input from a
benchmarking backend instance and the vector being secret input from a
3rd party.

### Example

Let's assume we want to compute a "secret" function to compute
CO2 emissions from kilometers travelled by 3 car types: a luxury gasoline car, an electrified car, and a truck.

Let's further assume the function works like this

```
co2(milesLuxuryCar, milesElectric, milesTruck) =
     50 * milesLuxuryCar
   +  3 * milesElectric
   + 75 * milesTruck
```

then the equivalent function definition would be, wherein the inputs would be kilo miles (i.e. 1k miles):

```json
{
  "id": "co2-emissions-example",
  "inputs": ["kilomiles-luxury-car", "kilomiles-electric", "kilomiles-truck"],
  "outputs": ["fleet-co2-emissions"],
  "inputMatrix": [[50, 3, 75]]
}
```

You could even define a function that, in addition, outputs the total number of miles travelled:

```json
{
  "id": "co2-emissions-example",
  "inputs": ["kilomiles-luxury-car", "kilomiles-electric", "kilomiles-truck"],
  "outputs": ["fleet-co2-emissions", "fleet-kilometers-total"],
  "inputMatrix": [
    [50, 3, 75],
    [1000, 1000, 1000]
  ]
}
```

(i.e. take the inputs, which are in kilo miles and mulitply them by 1000 plus finally summing them up)

To import this function, execute

```sh
./cmdtool set-function <json filename>
```

## Dataset definition syntax

The benchmarking service allows for comparisons of a private integer value with a reference dataset.

A dataset in turn is though of as a set of attribute names and a set of integer values.

### Dataset example

As an example, let's assume the reference data set is information on wages
from 5 of the largest software companies in the world. The data set could be something along the following lines:

```
Average Wage: 220000, 240000, 180000, 310000, 270000
SDE Average Wage: 320000, 340000, 280000, 410000, 370000
Manager Average Wage: 370000, 380000, 380000, 520000, 390000
```

Then the resulting dataset definition would be:

```json
{
  "id": "software-corporations-income",
  "dimensions": [
    {
      "id": "Average Wage",
      "integerValues": [220000, 240000, 180000, 310000, 270000]
    },
    {
      "id": "SDE Average Wage",
      "integerValues": [320000, 340000, 280000, 410000, 370000]
    },
    {
      "id": "Manager Average Wage",
      "integerValues": [370000, 380000, 380000, 520000, 390000]
    }
  ]
}
```

To import this dataset, create a json file and run:

```sh
./cmdtool set-dataset <json filename>
```

## Batchwise Import of Datasets and Functions

The benchmarking service features functions and datasets which can be
imported and updated in a batch fashion through the `import` command.

A data import file ultimately is just a big JSON file. An example can be found in `examples/`

Please note the format re-uses the previous microformats for a function and
dataset definitions. This command is thought of as a utility function to enable
batch data imports to a benchmarking service instance from a 3rd party database.

### Example import command

```sh
./cmdtool import examples/import-example.json
```
