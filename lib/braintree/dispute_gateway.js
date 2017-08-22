'use strict';

let _ = require('underscore');
let Gateway = require('./gateway').Gateway;
let Dispute = require('./dispute').Dispute;
let DisputeSearch = require('./dispute_search').DisputeSearch;
let NotFoundError = require('./exceptions').NotFoundError;
let PaginatedResponse = require('./paginated_response').PaginatedResponse;
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class DisputeGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  accept(id) {
    let notFoundError = new NotFoundError("dispute with id '" + id + "' not found");

    if (id == null || id.trim() === '') {
      return Promise.reject(notFoundError, null);
    }

    return this.gateway.http.put(`${this.config.baseMerchantPath()}/disputes/${id}/accept`)
      .then(this.createResponseHandler('dispute', Dispute))
      .catch((err) => {
        let e = err;

        if (err.type === 'notFoundError') {
          e = notFoundError;
        }

        return Promise.reject(e, null);
      });
  }

  addTextEvidence(id, content) {
    let notFoundError = new NotFoundError("dispute with id '" + id + "' not found");

    if (id == null || id.trim() === '') {
      return Promise.reject(notFoundError, null);
    }

    if (content == null || content.trim() === '') {
      return Promise.reject(new NotFoundError('content cannot be null'), null);
    }

    return this.gateway.http.post(`${this.config.baseMerchantPath()}/disputes/${id}/evidence`, {
      comments: content
    })
      .then(this.createResponseHandler())
      .catch((err) => {
        let e = err;

        if (err.type === 'notFoundError') {
          e = notFoundError;
        }

        return Promise.reject(e, null);
      });
  }

  addFileEvidence(disputeId, documentId) {
    let notFoundError = new NotFoundError("dispute with id '" + disputeId + "' not found");

    if (disputeId == null || disputeId.trim() === '') {
      return Promise.reject(notFoundError, null);
    }

    if (documentId == null || documentId.trim() === '') {
      return Promise.reject(new NotFoundError("document with id '" + documentId + "' not found"), null);
    }

    return this.gateway.http.post(`${this.config.baseMerchantPath()}/disputes/${disputeId}/evidence`, {
      document_upload_id: documentId // eslint-disable-line camelcase
    })
      .then(this.createResponseHandler())
      .catch((err) => {
        let e = err;

        if (err.type === 'notFoundError') {
          e = notFoundError;
        }

        return Promise.reject(e, null);
      });
  }

  finalize(id) {
    let notFoundError = new NotFoundError(`dispute with id '${id}' not found`);

    if (id == null || id.trim() === '') {
      return Promise.reject(notFoundError);
    }

    return this.gateway.http.put(`${this.config.baseMerchantPath()}/disputes/${id}/finalize`)
      .then(this.createResponseHandler())
      .catch((err) => {
        let e = err;

        if (err.type === 'notFoundError') {
          e = notFoundError;
        }

        return Promise.reject(e, null);
      });
  }

  find(id) {
    let notFoundError = new NotFoundError(`dispute with id '${id}' not found`);

    if (id == null || id.trim() === '') {
      return Promise.reject(notFoundError, null);
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/disputes/${id}`)
      .then(this.createResponseHandler('dispute', Dispute))
      .catch((err) => {
        let e = err;

        if (err.type === 'notFoundError') {
          e = notFoundError;
        }

        return Promise.reject(e, null);
      });
  }

  removeEvidence(disputeId, evidenceId) {
    let notFoundError = new NotFoundError("evidence with id '" + evidenceId + "' for dispute with id '" + disputeId + "' not found");

    if (disputeId == null || disputeId.trim() === '' || evidenceId == null || evidenceId.trim() === '') {
      return Promise.reject(notFoundError, null);
    }

    return this.gateway.http.delete(`${this.config.baseMerchantPath()}/disputes/${disputeId}/evidence/${evidenceId}`)
      .then(this.createResponseHandler())
      .catch((err) => {
        let e = err;

        if (err.type === 'notFoundError') {
          e = notFoundError;
        }

        return Promise.reject(e, null);
      });
  }

  search(searchFunction, callback) {
    let search = new DisputeSearch();

    searchFunction(search);

    let response = new PaginatedResponse(this.fetchDisputes.bind(this), {
      search: search.toHash()
    });

    if (callback != null) {
      return response.all(callback);
    }

    response.ready();
    return response.stream;
  }

  fetchDisputes(pageNumber, search, callback) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/disputes/advanced_search?page=${pageNumber}`, {search: search}, (err, response) => {
      if (err) {
        return callback(err);
      }

      let totalItems = response.disputes.totalItems;
      let pageSize = response.disputes.pageSize;
      let disputes = response.disputes.dispute;

      if (response.disputes.dispute) {
        disputes = [null];
      } else if (!_.isArray(disputes)) {
        disputes = [disputes];
      }

      return callback(null, totalItems, pageSize, disputes);
    });
  }
}

module.exports = {DisputeGateway: wrapPrototype(DisputeGateway, {
  ignoreMethods: ['search', 'fetchDisputes']
})};
