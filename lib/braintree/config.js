'use strict';

let CredentialsParser = require('./credentials_parser').CredentialsParser;

class Config {
  constructor(rawConfig) {
    this.timeout = 60000;
    this.apiVersion = '4';
    let parser = new CredentialsParser();

    if (rawConfig.clientId || rawConfig.clientSecret) {
      parser.parseClientCredentials(rawConfig.clientId, rawConfig.clientSecret);
      this.clientId = parser.clientId;
      this.clientSecret = parser.clientSecret;
      this.environment = parser.environment;
    } else if (rawConfig.accessToken) {
      parser.parseAccessToken(rawConfig.accessToken);
      this.accessToken = parser.accessToken;
      this.environment = parser.environment;
      this.merchantId = parser.merchantId;
    } else {
      this.publicKey = rawConfig.publicKey;
      this.privateKey = rawConfig.privateKey;
      this.merchantId = rawConfig.merchantId || rawConfig.partnerId;
      this.environment = rawConfig.environment;
      if (!this.publicKey) { throw new Error('Missing publicKey'); }
      if (!this.privateKey) { throw new Error('Missing privateKey'); }
      if (!this.merchantId) { throw new Error('Missing merchantId'); }
      if (!this.environment) { throw new Error('Missing environment'); }
    }
  }

  baseMerchantPath() { return `/merchants/${this.merchantId}`; }

  baseUrl() { return this.environment.baseUrl(); }

  baseMerchantUrl() { return this.baseUrl() + this.baseMerchantPath(); }
}

module.exports = {Config: Config};
