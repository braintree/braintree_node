'use strict';

let Gateway = require('./gateway').Gateway;
let Dispute = require('./dispute').Dispute;
let DisputeSearch = require('./dispute_search').DisputeSearch;
let InvalidKeysError = require('./exceptions').InvalidKeysError;
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
      return Promise.reject(notFoundError);
    }

    return this.gateway.http.put(`${this.config.baseMerchantPath()}/disputes/${id}/accept`)
      .then(this.createResponseHandler('dispute', Dispute))
      .catch(this.createRejectionHandler(notFoundError));
  }

  addTextEvidence(id, contentOrRequest) {
    const isRequest = contentOrRequest != null && typeof contentOrRequest === 'object';
    const request = isRequest ? contentOrRequest : {content: contentOrRequest};
    let notFoundError = new NotFoundError("dispute with id '" + id + "' not found");

    if (id == null || id.trim() === '') {
      return Promise.reject(notFoundError);
    }

    if (request.content == null || request.content.trim() === '') {
      return Promise.reject(new InvalidKeysError('content cannot be null or empty'));
    }

    const evidence = {
      comments: request.content
    };

    if (request.sequenceNumber != null) {
      if (String(request.sequenceNumber) !== String(parseInt(request.sequenceNumber, 10))) {
        return Promise.reject(new InvalidKeysError('sequenceNumber must be a number'));
      }
      evidence.sequence_number = parseInt(request.sequenceNumber, 10);  // eslint-disable-line camelcase
    }

    if (request.category != null) {
      if (typeof request.category !== 'string') {
        return Promise.reject(new InvalidKeysError('category must be a string'));
      } else if (request.category.trim() === '') {
        return Promise.reject(new InvalidKeysError('category cannot be empty'));
      }
      evidence.category = request.category;
    }

    return this.gateway.http.post(`${this.config.baseMerchantPath()}/disputes/${id}/evidence`, {
      evidence
    })
      .then(this.createResponseHandler())
      .catch(this.createRejectionHandler(notFoundError));
  }

  addFileEvidence(disputeId, documentIdOrRequest) {
    const isRequest = documentIdOrRequest != null && typeof documentIdOrRequest === 'object';
    const request = isRequest ? documentIdOrRequest : {documentId: documentIdOrRequest};
    let notFoundError = new NotFoundError("dispute with id '" + disputeId + "' not found");

    if (disputeId == null || disputeId.trim() === '') {
      return Promise.reject(notFoundError);
    }

    if (request.documentId == null || request.documentId.trim() === '') {
      return Promise.reject(new NotFoundError("document with id '" + request.documentId + "' not found"));
    }

    const evidence = {
      document_upload_id: request.documentId, // eslint-disable-line camelcase
      category: request.category
    };

    return this.gateway.http.post(`${this.config.baseMerchantPath()}/disputes/${disputeId}/evidence`, {
      evidence
    })
      .then(this.createResponseHandler())
      .catch(this.createRejectionHandler(notFoundError));
  }

  finalize(id) {
    let notFoundError = new NotFoundError(`dispute with id '${id}' not found`);

    if (id == null || id.trim() === '') {
      return Promise.reject(notFoundError);
    }

    return this.gateway.http.put(`${this.config.baseMerchantPath()}/disputes/${id}/finalize`)
      .then(this.createResponseHandler())
      .catch(this.createRejectionHandler(notFoundError));
  }

  find(id) {
    let notFoundError = new NotFoundError(`dispute with id '${id}' not found`);

    if (id == null || id.trim() === '') {
      return Promise.reject(notFoundError);
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/disputes/${id}`)
      .then(this.createResponseHandler('dispute', Dispute))
      .catch(this.createRejectionHandler(notFoundError));
  }

  removeEvidence(disputeId, evidenceId) {
    let notFoundError = new NotFoundError("evidence with id '" + evidenceId + "' for dispute with id '" + disputeId + "' not found");

    if (disputeId == null || disputeId.trim() === '' || evidenceId == null || evidenceId.trim() === '') {
      return Promise.reject(notFoundError);
    }

    return this.gateway.http.delete(`${this.config.baseMerchantPath()}/disputes/${disputeId}/evidence/${evidenceId}`)
      .then(this.createResponseHandler())
      .catch(this.createRejectionHandler(notFoundError));
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

      if (!disputes) {
        disputes = [null];
      } else if (!Array.isArray(disputes)) {
        disputes = [disputes];
      }

      return callback(null, totalItems, pageSize, disputes);
    });
  }

  createRejectionHandler(notFoundError) {
    return function (err) {
      if (err.type === 'notFoundError') {
        err = notFoundError;
      }

      return Promise.reject(err);
    };
  }
}

module.exports = {DisputeGateway: wrapPrototype(DisputeGateway, {
  ignoreMethods: ['search', 'fetchDisputes']
})};
