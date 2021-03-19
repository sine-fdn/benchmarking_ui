FROM mhart/alpine-node:14

RUN mkdir /benchmarking

COPY . /benchmarking

WORKDIR /benchmarking

RUN yarn install && yarn build

CMD ["node",".next/production-server/index.js"]