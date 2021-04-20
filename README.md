# Benchmarking 

## Node Configuration

Nodes can be configured with .env files:
The environment variables have the following meaning:

- `PROCESSOR_HOSTNAMES`: list of benchmarking API endpoints accepting benchmarking data
- `UPSTREAM_HOSTNAMES`: list of hosts the current host will contact to retrieve session information from
- `COORDINATOR`: hostname of the MPC coordinator (acts like a messaging hub) node
- `MPC_NODE_ID`: unique ID (`1...n`) of the `n` nodes performing MPC. Please not that numbering starts with `1`. **Each MPC-participating node must have its unique id!**
- `DELEGATED_UPSTREAM_HOST`: URL of the host to use for delegated MPC benchmarking sessions
- `CURRENCY`: number of parallel function calls processed by a taskrunner
- `DATA_CURRENCY`: number of parallel dataset comparisons run by a taskrunner

## Example set up

We will run 2 nodes (hence 2 entries for `PROCESSOR_HOSTNAMES`) which we will boostrap locally in a minimal fashion now. For this we only need to create the necessary tables @ Postgres and then start the nodes.

### Yarn install 

First of all: install dependencies. 
run `yarn install`

This will also make prisma available. 

### DB Setup

Here we assume the following PG connection details:

- Database name: `benchmarking_demo`
- Username: `benchmarking_demo`
- Password: `test123`

The DB set up can then proceed as follows:

```sh
DATABASE_URL="postgresql://benchmarking_demo:test123@localhost:5432/ \
benchmarking_demo?schema=node1" yarn prisma migrate deploy  --preview-feature

# note the difference in the schema parameter
DATABASE_URL="postgresql://benchmarking_demo:test123@localhost:5432/ \
benchmarking_demo?schema=node2" yarn prisma migrate deploy  --preview-feature
```

### Node setup

Now we only need to set up the .env files for Nextjs.

Write into `.env.production.local` the following contents

```
DATABASE_URL="postgresql://benchmarking_demo:test123@localhost:5432/benchmarking_demo?schema=node1"
PROCESSOR_HOSTNAMES="http://localhost:3000,http://localhost:3001"
UPSTREAM_HOSTNAMES="http://localhost:3000,http://localhost:3001"
COORDINATOR="http://localhost:3000"
MPC_NODE_ID=1
PORT=3000
DELEGATED_UPSTREAM_HOST="http://localhost:3001"
CONCURRENCY=5
DATASET_CONCURRENCY=1
```

as well as into `.env.production.node-2` the following contents

```
DATABASE_URL="postgresql://benchmarking_demo:test123@localhost:5432/benchmarking_demo?schema=node2"
PROCESSOR_HOSTNAMES="http://localhost:3000,http://localhost:3001"
UPSTREAM_HOSTNAMES="http://localhost:3000,http://localhost:3001"
COORDINATOR="http://localhost:3000"
MPC_NODE_ID=2
PORT=3001
DELEGATED_UPSTREAM_HOST="http://localhost:3000"
CONCURRENCY=5
DATASET_CONCURRENCY=1
```

### Starting a local demo system

To start the system:

```sh
yarn local-demo
```

### add test data

connect to 
 
```sql 
begin; insert into node1.datasets (id, input_dimensions) values('felix', ARRAY['co2']); insert into node1.dataset_dimensions (dataset_id, name, integer_values) values('felix', 'co2', array[100,1000,10000,100000]); commit;
```

### try it out

navigate to `localhost:3000`

## docker setup
In the root of the repository, run `docker-compose up`. 
This will build a docker container according to the `./Dockerfile` and start it along with postgresql. 
