FROM mhart/alpine-node:14

RUN mkdir /benchmarking

RUN apk add git

RUN git clone https://github.com/sine-fdn/benchmarking_ui /benchmarking

WORKDIR /benchmarking

RUN yarn install && yarn build

CMD ["node",".next/production-server/index.js"]