# Basic Configuration

Create a .env file like this:

```
DATABASE_URL="postgresql://$dbuser$:$dbpass$@$dbhost$:$dbport$/$db_name$?schema=public"
PROCESSOR_HOSTNAMES="http://localhost:3000,http://localhost:3001"
UPSTREAM_HOSTNAMES="http://localhost:3000,http://localhost:3001"
COORDINATOR="http://localhost:8000"
MPC_NODE_ID=1
DELEGATED_UPSTREAM_HOST="http://localhost:3001"
```

The fields have the following meaning:

- `PROCESSOR_HOSTNAMES`: list of benchmarking API endpoints accepting benchmarking data
- `UPSTREAM_HOSTNAMES`: list of hosts the current host will contact to retrieve session information from
- `COORDINATOR`: hostname of the MPC coordinator (acts like a messaging hub) node
- `MPC_NODE_ID`: unique ID (`1...n`) of the `n` nodes performing MPC. Please not that numbering starts with `1`. **Each MPC-participating node must have its unique id!**
- `DELEGATED_UPSTREAM_HOST`: URL of the host to use for delegated MPC benchmarking sessions

## Example set up

We will run 2 nodes (hence 2 entries for `PROCESSOR_HOSTNAMES`) which we will boostrap locally in a minimal fashion now. For this we only need to create the necessary tables @ Postgres and then start the nodes.

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

## Node setup

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
```

## Starting a local demo system

To start the system:

```sh
yarn local-demo
```
