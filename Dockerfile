FROM debian:stretch

RUN apt-get update
RUN apt-get -y install curl gpg rake
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get -y install nodejs

WORKDIR /braintree-node
