var Digest = require('./digest').Digest,
    Util = require('./util').Util,
    querystring = require('../../vendor/querystring.node.js/querystring'),
    dateFormat = require('dateformat'),
    CreditCardGateway = require('./credit_card_gateway').CreditCardGateway,
    CustomerGateway = require('./customer_gateway').CustomerGateway,
    TransactionGateway = require('./transaction_gateway').TransactionGateway,
    exceptions = require('./exceptions');

var TransparentRedirectGateway = function (gateway) {
  var KIND = {
    CREATE_CUSTOMER: 'create_customer',
    UPDATE_CUSTOMER: 'update_customer',
    CREATE_CREDIT_CARD: 'create_payment_method',
    UPDATE_CREDIT_CARD: 'update_payment_method',
    CREATE_TRANSACTION: 'create_transaction'
  };

  var my = {
    gateway: gateway
  };

  var generateTrData = function (inputData) {
    var data = Util.convertObjectKeysToUnderscores(inputData);
    data.api_version = my.gateway.config.apiVersion;
    data.time = dateFormat(new Date(), 'yyyymmddHHMMss', true);
    data.public_key = my.gateway.config.publicKey;
    var dataSegment = querystring.stringify(data);
    var trDataHash = Digest.hexdigest(gateway.config.privateKey, dataSegment);
    return trDataHash + "|" + dataSegment;
  };

  var createCreditCardData = function (data) {
    data.kind = KIND.CREATE_CREDIT_CARD;
    return generateTrData(data);
  };

  var updateCreditCardData = function (data) {
    data.kind = KIND.UPDATE_CREDIT_CARD;
    return generateTrData(data);
  };

  var createCustomerData = function (data) {
    data.kind = KIND.CREATE_CUSTOMER;
    return generateTrData(data);
  };

  var updateCustomerData = function (data) {
    data.kind = KIND.UPDATE_CUSTOMER;
    return generateTrData(data);
  };

  var transactionData = function (data) {
    data.kind = KIND.CREATE_TRANSACTION;
    return generateTrData(data);
  };

  var validateQueryString = function (queryString) {
    var matches = queryString.match(/^(.+)&hash=(.+?)$/);
    return (Digest.hexdigest(gateway.config.privateKey, matches[1]) == matches[2]);
  };

  var confirm = function (queryString, callback) {
    var statusMatch = queryString.match(/http_status=(\d+)/);
    if (statusMatch && statusMatch[1]) {
      var error = my.gateway.http.checkHttpStatus(statusMatch[1]);
      if (error) {
        return callback(error, null);
      }
    }
    if (!validateQueryString(queryString)) {
      callback(exceptions.InvalidTransparentRedirectHashError(), null);
      return;
    };
    var params = querystring.parse(queryString);
    var confirmCallback = null;
    switch(params.kind) {
      case KIND.CREATE_CUSTOMER:
      case KIND.UPDATE_CUSTOMER:
        confirmCallback = CustomerGateway(my.gateway).responseHandler(callback);
        break;
      case KIND.CREATE_CREDIT_CARD:
      case KIND.UPDATE_CREDIT_CARD:
        confirmCallback = CreditCardGateway(my.gateway).responseHandler(callback);
        break;
      case KIND.CREATE_TRANSACTION:
        confirmCallback = TransactionGateway(my.gateway).responseHandler(callback);
        break;
    }
    my.gateway.http.post('/transparent_redirect_requests/' + params.id + '/confirm', null, confirmCallback);
  };

  var url = gateway.config.baseMerchantPath + '/transparent_redirect_requests';

  return {
    confirm: confirm,
    createCreditCardData: createCreditCardData,
    createCustomerData: createCustomerData,
    transactionData: transactionData,
    updateCreditCardData: updateCreditCardData,
    updateCustomerData: updateCustomerData,
    url: url
  };
};

exports.TransparentRedirectGateway = TransparentRedirectGateway;
