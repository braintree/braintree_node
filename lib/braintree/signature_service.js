"use strict";

class SignatureService {
  constructor(key, hashFunction) {
    this.key = key;
    this.hashFunction = hashFunction;
  }

  sign(data) {
    return `${this.hashFunction(this.key, data)}|${data}`;
  }
}

module.exports = { SignatureService: SignatureService };
