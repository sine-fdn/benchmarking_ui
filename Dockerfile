FROM mhart/alpine-node:14

RUN mkdir /taskrunner

COPY ./ /taskrunner

WORKDIR /taskrunner

RUN yarn install && yarn build

ENTRYPOINT ./startup.sh 
