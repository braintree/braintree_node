'use strict';

let Gateway = require('./gateway').Gateway;
let NotFoundError = require('./exceptions').NotFoundError;
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class DisputeGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  accept(id) {
    if (id == null || id.trim() === "") {
      throw new NotFoundError("dispute with id '" + id + "' not found");
    }
  }

  addTextEvidence(id, content) {
    if (id == null || id.trim() === "") {
      throw new NotFoundError("dispute with id '" + id + "' not found");
    }

    if (content == null || content.trim() === "") {
      throw new NotFoundError("content cannot be null");
    }
  }

  addFileEvidence(disputeId, documentId) {
    if (disputeId == null || disputeId.trim() === "") {
      throw new NotFoundError("dispute with id '" + disputeId + "' not found");
    }

    if (documentId == null || documentId.trim() === "") {
      throw new NotFoundError("document with id '" + documentId + "' not found");
    }
  }

  finalize(id) {
    if (id == null || id.trim() === "") {
      throw new NotFoundError("dispute with id '" + id + "' not found");
    }
  }

  find(id) {
    if (id == null || id.trim() === "") {
      throw new NotFoundError("dispute with id '" + id + "' not found");
    }
  }

  removeEvidence(disputeId, evidenceId) {
    if (disputeId == null || disputeId.trim() === "" || evidenceId == null || evidenceId.trim() === "") {
      throw new NotFoundError("evidence with id '" + evidenceId + "' for dispute with id '" + disputeId + "' not found");
    }
  }
}

module.exports = {DisputeGateway: wrapPrototype(DisputeGateway)};
