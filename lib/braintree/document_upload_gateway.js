'use strict';

let DocumentUpload = require('./document_upload').DocumentUpload;
let Gateway = require('./gateway').Gateway;
let InvalidKeysError = require('./exceptions').InvalidKeysError;
let Readable = require('stream').Readable;
let Util = require('./util').Util;
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class DocumentUploadGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(options) {
    let invalidKeysError = Util.verifyKeys(this._createSignature(), options);

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError);
    }

    if (!options.file || !(options.file instanceof Readable)) {
      return Promise.reject(new InvalidKeysError('file must be a Readable stream'));
    }

    return this.gateway.http.postMultipart(`${this.config.baseMerchantPath()}/document_uploads`, {
      'document_upload[kind]': options.kind
    }, options.file)
      .then(this.createResponseHandler('documentUpload', DocumentUpload));
  }

  _createSignature() {
    return {
      valid: ['kind'],
      ignore: ['file']
    };
  }
}

module.exports = {DocumentUploadGateway: wrapPrototype(DocumentUploadGateway)};
