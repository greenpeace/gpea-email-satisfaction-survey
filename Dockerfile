FROM node:alpine

# speed up the deploy process
WORKDIR /app/client
COPY ./client/package.json ./package.json
RUN yarn install

WORKDIR /app/server
COPY ./server/package.json ./package.json
RUN yarn install

RUN mv /app/client/node_modules /app/client/_node_modules
RUN mv /app/server/node_modules /app/server/_node_modules

# copy all the source codes
WORKDIR /app
COPY . .
RUN cp /app/credentials.json /app/server/credentials.json

RUN rm -fr /app/client/node_modules
RUN rm -fr /app/server/node_modules

RUN mv /app/client/_node_modules /app/client/node_modules
RUN mv /app/server/_node_modules /app/server/node_modules

# build client
WORKDIR /app/client
RUN yarn build

# build server
WORKDIR /app/server
CMD yarn start