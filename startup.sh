#!/bin/sh

yarn prisma migrate deploy --preview-feature

export NODE_ENV=production
yarn run concurrently "node .next/production-server/index.js" ".next/production-server/taskrunner.js"