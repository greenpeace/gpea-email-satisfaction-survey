FROM node:alpine

ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium

WORKDIR /app
ADD . .
RUN cp /app/credentials.json /app/server/credentials.json

RUN rm -fr /app/client/node_modules
RUN rm -fr /app/server/node_modules

# build client
WORKDIR /app/client
RUN yarn install
RUN yarn build; yarn postbuild;

# build server
WORKDIR /app/server
RUN yarn install

CMD yarn start