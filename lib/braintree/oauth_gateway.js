'use strict';

let Gateway = require('./gateway').Gateway;
let OAuthCredentials = require('./oauth_credentials').OAuthCredentials;
let AttributeSetter = require('./attribute_setter').AttributeSetter;
let Util = require('./util').Util;
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class OAuthGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  createTokenFromCode(attributes) {
    attributes.grantType = 'authorization_code';

    return this.gateway.http.post('/oauth/access_tokens', attributes).then(this.responseHandler());
  }

  createTokenFromRefreshToken(attributes) {
    attributes.grantType = 'refresh_token';

    return this.gateway.http.post('/oauth/access_tokens', attributes).then(this.responseHandler());
  }

  revokeAccessToken(accessToken) {
    return this.gateway.http.post('/oauth/revoke_access_token', {token: accessToken}).then(this.createResponseHandler('result', AttributeSetter));
  }

  responseHandler() {
    return this.createResponseHandler('credentials', OAuthCredentials);
  }

  connectUrl(rawParams) {
    const params = Object.assign({clientId: this.config.clientId}, rawParams);

    return this.config.baseUrl() + '/oauth/connect?' + this.buildQuery(params);
  }

  buildQuery(params) {
    params = Util.convertObjectKeysToUnderscores(params);

    let paramsArray = this.buildSubQuery('user', params.user);

    paramsArray.push.apply(paramsArray, this.buildSubQuery('business', params.business));
    paramsArray.push.apply(paramsArray, this.buildSubArrayQuery('payment_methods', params.payment_methods));
    delete params.user;
    delete params.business;
    delete params.payment_methods;

    paramsArray.push.apply(paramsArray, (() => {
      let result = [];

      for (let key in params) {
        if (!params.hasOwnProperty(key)) {
          continue;
        }
        let val = params[key];

        result.push([key, val]);
      }

      return result;
    })());

    let queryStringParts = paramsArray.map((paramParts) => {
      let key = paramParts[0];
      let value = paramParts[1];

      return `${this._encodeValue(key)}=${this._encodeValue(value)}`;
    });

    return queryStringParts.join('&');
  }

  buildSubQuery(key, subParams) {
    let arr = [];

    for (let subKey in subParams) {
      if (!subParams.hasOwnProperty(subKey)) {
        continue;
      }
      let value = subParams[subKey];

      arr.push([`${key}[${subKey}]`, value]);
    }

    return arr;
  }

  _encodeValue(value) {
    return encodeURIComponent(value)
      .replace(/[!'()]/g, escape)
      .replace(/\*/g, '%2A');
  }

  buildSubArrayQuery(key, values) {
    return (values || []).map(value => [`${key}[]`, value]);
  }
}

module.exports = {OAuthGateway: wrapPrototype(OAuthGateway)};
