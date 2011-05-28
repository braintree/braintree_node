var Digest = require('./digest').Digest,
    Util = require('./util').Util,
    querystring = require('../../vendor/querystring.node.js/querystring');
    dateFormat = require('dateformat'),
    CustomerGateway = require('./customer_gateway').CustomerGateway;

var TransparentRedirectGateway = function(gateway) {
  var KIND = {
    CREATE_CUSTOMER: 'create_customer',
    UPDATE_CUSTOMER: 'update_customer',
    // CREATE_PAYMENT_METHOD: 'create_payment_method',
    // UPDATE_PAYMENT_METHOD: 'update_payment_method',
    // CREATE_TRANSACTION: 'create_transaction'
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

  var createCustomerData = function (data) {
    data.kind = KIND.CREATE_CUSTOMER;
    return generateTrData(data);
  };

  var updateCustomerData = function (data) {
    data.kind = KIND.UPDATE_CUSTOMER;
    return generateTrData(data);
  };

  var confirm = function (queryString, callback) {
    var params = querystring.parse(queryString);
    my.gateway.http.post('/transparent_redirect_requests/' + params.id + '/confirm', {}, CustomerGateway(my.gateway).responseHandler(callback));
  };

  var url = gateway.config.baseMerchantPath + '/transparent_redirect_requests';

  return {
    confirm: confirm,
    createCustomerData: createCustomerData,
    updateCustomerData: updateCustomerData,
    url: url
  };
};

exports.TransparentRedirectGateway = TransparentRedirectGateway;
