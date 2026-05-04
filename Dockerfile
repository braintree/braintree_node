FROM debian:bullseye

RUN apt-get update
RUN apt-get -y install curl gpg xz-utils rake

RUN ARCH='x64' \
  && curl -SLO "https://nodejs.org/dist/v14.21.3/node-v14.21.3-linux-$ARCH.tar.xz" \
  && tar -xJf "node-v14.21.3-linux-$ARCH.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
  && rm "node-v14.21.3-linux-$ARCH.tar.xz" \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

WORKDIR /braintree-node
