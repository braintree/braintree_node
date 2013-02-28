#!/bin/bash
nvm_version="0.6.19"
nvm_location="/var/lib/jenkins/.nvm/v$nvm_version/bin"

source ~/.nvm/nvm.sh

if [ -d nvm_location ]
  nvm use $nvm_version
  rake --trace
else
  nvm install $nvm_version
  nvm use $nvm_version
  rake --trace
fi
