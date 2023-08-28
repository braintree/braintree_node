"use strict";
/* eslint-disable func-style, no-console */

let http = require("http");
let https = require("https");
let uri = require("url");
let TransactionAmounts =
  require("../lib/braintree/test_values/transaction_amounts").TransactionAmounts;
let Util = require("../lib/braintree/util").Util;
let Config = require("../lib/braintree/config").Config;
let chai = require("chai");

chai.config.includeStack = true;

global.assert = chai.assert;

global.assert.isEmptyArray = function (array) {
  assert.isArray(array);
  assert.equal(array.length, 0);
};

global.inspect = (object) => console.dir(object);

let braintree = require("./../lib/braintree.js");

let defaultConfig = {
  environment: braintree.Environment.Development,
  merchantId: "integration_merchant_id",
  publicKey: "integration_public_key",
  privateKey: "integration_private_key",
};
let defaultGateway = new braintree.BraintreeGateway(defaultConfig);

let merchant2Config = {
  environment: braintree.Environment.Development,
  merchantId: "integration2_merchant_id",
  publicKey: "integration2_public_key",
  privateKey: "integration2_private_key",
};
let merchant2Gateway = new braintree.BraintreeGateway(merchant2Config);

let fraudProtectionEnterpriseConfig = {
  environment: braintree.Environment.Development,
  merchantId: "fraud_protection_enterprise_integration_merchant_id",
  publicKey: "fraud_protection_enterprise_integration_public_key",
  privateKey: "fraud_protection_enterprise_integration_private_key",
};
let fraudProtectionEnterpriseGateway = new braintree.BraintreeGateway(
  fraudProtectionEnterpriseConfig
);

let effortlessChargebackProtectionConfig = {
  environment: braintree.Environment.Development,
  merchantId: "fraud_protection_effortless_chargeback_protection_merchant_id",
  publicKey: "effortless_chargeback_protection_public_key",
  privateKey: "effortless_chargeback_protection_private_key",
};
let effortlessChargebackProtectionGateway = new braintree.BraintreeGateway(
  effortlessChargebackProtectionConfig
);

let multiplyString = (string, times) => new Array(times + 1).join(string);

let plans = {
  trialless: { id: "integration_trialless_plan", price: "12.34" },
  addonDiscountPlan: {
    id: "integration_plan_with_add_ons_and_discounts",
    price: "9.99",
  },
};

let addOns = {
  increase10: "increase_10",
  increase20: "increase_20",
};

let escrowTransaction = (transactionId, callback) =>
  defaultGateway.http.put(
    `${defaultGateway.config.baseMerchantPath()}/transactions/${transactionId}/escrow`,
    null,
    callback
  );

let makePastDue = (subscription, callback) =>
  defaultGateway.http.put(
    `${defaultGateway.config.baseMerchantPath()}/subscriptions/${
      subscription.id
    }/make_past_due?days_past_due=1`,
    null,
    callback
  );

let settlePayPalTransaction = (transactionId, callback) =>
  defaultGateway.http.put(
    `${defaultGateway.config.baseMerchantPath()}/transactions/${transactionId}/settle`,
    null,
    callback
  );

let create3DSVerification = function (merchantAccountId, params, callback) {
  let responseCallback = function (err, response) {
    let threeDSecureAuthenticationId =
      response.threeDSecureVerification.threeDSecureAuthenticationId;

    callback(threeDSecureAuthenticationId);
  };

  defaultGateway.http.post(
    `${defaultGateway.config.baseMerchantPath()}/three_d_secure/create_verification/${merchantAccountId}`,
    { three_d_secure_verification: params }, // eslint-disable-line camelcase
    responseCallback
  );
};

let generate3DSNonce = function (params, callback) {
  let responseCallback = function (err, response) {
    let threeDSecureNonce = response.paymentMethodNonce.nonce;

    callback(threeDSecureNonce);
  };

  defaultGateway.http.post(
    `${defaultGateway.config.baseMerchantPath()}/three_d_secure/create_nonce/${
      specHelper.threeDSecureMerchantAccountId
    }`,
    params,
    responseCallback
  );
};

let dateToMdy = function (date) {
  let year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();

  if (month.length === 1) {
    month = `0${month}`;
  }
  if (day.length === 1) {
    day = `0${day}`;
  }
  let formattedDate = year + "-" + month + "-" + day;

  return formattedDate;
};

let daylightSavings = function () {
  let today = new Date();
  let jan = new Date(today.getFullYear(), 0, 1);
  let jul = new Date(today.getFullYear(), 6, 1);
  let stdTimezoneOffset = Math.max(
    jan.getTimezoneOffset(),
    jul.getTimezoneOffset()
  );

  return today.getTimezoneOffset() < stdTimezoneOffset;
};

let settlementDate = function (date) {
  if (daylightSavings()) {
    const fourhours = 4 * 60 * 60 * 1000;

    return new Date(date.getTime() - fourhours);
  }

  const fivehours = 5 * 60 * 60 * 1000;

  return new Date(date.getTime() - fivehours);
};

let randomId = () => Math.floor(Math.random() * Math.pow(36, 8)).toString(36);

let doesNotInclude = (array, value) =>
  assert.isTrue(array.indexOf(value) === -1);

let generateNonceForNewPaymentMethod = function (
  paymentMethodParams,
  customerId,
  callback
) {
  let myHttp = new ClientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line no-use-before-define
  let clientTokenOptions = {};

  if (customerId) {
    clientTokenOptions.customerId = customerId;
  }
  specHelper.defaultGateway.clientToken.generate(
    clientTokenOptions,
    function (err, result) {
      let clientToken = JSON.parse(
        specHelper.decodeClientToken(result.clientToken)
      );
      let params = {
        authorizationFingerprint: clientToken.authorizationFingerprint,
      };

      if (paymentMethodParams.paypalAccount != null) {
        params.paypalAccount = paymentMethodParams.paypalAccount;
        myHttp.post(
          "/client_api/v1/payment_methods/paypal_accounts.json",
          params,
          function (statusCode, body) {
            let nonce = JSON.parse(body).paypalAccounts[0].nonce;

            callback(nonce);
          }
        );
      } else {
        params.creditCard = paymentMethodParams.creditCard;
        myHttp.post(
          "/client_api/v1/payment_methods/credit_cards.json",
          params,
          function (statusCode, body) {
            let nonce = JSON.parse(body).creditCards[0].nonce;

            callback(nonce);
          }
        );
      }
    }
  );
};

let generateValidUsBankAccountNonce = function (accountNumber, gw, callback) {
  if (typeof gw === "function") {
    callback = gw;
    gw = null;
  }
  gw = gw || specHelper.defaultGateway;
  gw.clientToken.generate({}, function (err, result) {
    let clientToken = JSON.parse(
      specHelper.decodeClientToken(result.clientToken)
    );
    let req;

    let url = uri.parse(clientToken.braintree_api.url);
    let token = clientToken.braintree_api.access_token;
    let options = {
      host: url.hostname,
      port: url.port,
      method: "POST",
      path: "/graphql",
      headers: {
        "Content-Type": "application/json",
        "Braintree-Version": "2016-10-07",
        Authorization: `Bearer ${token}`,
      },
    };

    let query = `
      mutation TokenizeUsBankAccount($input: TokenizeUsBankAccountInput!) {
        tokenizeUsBankAccount(input: $input) {
          paymentMethod {
            id
          }
        }
      }`;

    let variables = {
      input: {
        usBankAccount: {
          accountNumber: accountNumber,
          routingNumber: "021000021",
          accountType: "CHECKING",
          billingAddress: {
            streetAddress: "123 Ave",
            state: "CA",
            city: "San Francisco",
            zipCode: "94112",
          },
          individualOwner: {
            firstName: "Dan",
            lastName: "Schulman",
          },
          achMandate: "cl mandate text",
        },
      },
    };

    let graphQLRequest = {
      query: query,
      variables: variables,
    };

    let requestBody = JSON.stringify(graphQLRequest);

    options.headers["Content-Length"] =
      Buffer.byteLength(requestBody).toString();

    if (url.protocol === "http:") {
      req = http.request(options);
    } else {
      req = https.request(options);
    }

    req.on("response", (response) => {
      let body = "";

      response.on("data", (responseBody) => {
        body += responseBody;
      });
      response.on("end", () => {
        let json = JSON.parse(body);

        callback(json.data.tokenizeUsBankAccount.paymentMethod.id);
      });

      return response.on("error", (err) =>
        console.log(`Unexpected response error: ${err}`)
      );
    });

    req.on("error", (err) => console.log(`Unexpected request error: ${err}`));

    req.write(requestBody);

    return req.end();
  });
};

let generatePlaidUsBankAccountNonce = function (gw, callback) {
  if (typeof gw === "function") {
    callback = gw;
    gw = null;
  }
  gw = gw || specHelper.defaultGateway;
  gw.clientToken.generate({}, function (err, result) {
    let clientToken = JSON.parse(
      specHelper.decodeClientToken(result.clientToken)
    );
    let req;

    let url = uri.parse(clientToken.braintree_api.url);
    let token = clientToken.braintree_api.access_token;
    let options = {
      host: url.hostname,
      port: url.port,
      method: "POST",
      path: "/graphql",
      headers: {
        "Content-Type": "application/json",
        "Braintree-Version": "2016-10-07",
        Authorization: `Bearer ${token}`,
      },
    };

    let query = `
      mutation TokenizeUsBankLogin($input: TokenizeUsBankLoginInput!) {
        tokenizeUsBankLogin(input: $input) {
          paymentMethod {
            id
          }
        }
      }`;

    let variables = {
      input: {
        usBankLogin: {
          publicToken: "good",
          accountId: "plaid_account_id",
          accountType: "CHECKING",
          billingAddress: {
            streetAddress: "123 Ave",
            state: "CA",
            city: "San Francisco",
            zipCode: "94112",
          },
          individualOwner: {
            firstName: "Dan",
            lastName: "Schulman",
          },
          achMandate: "cl mandate text",
        },
      },
    };

    let graphQLRequest = {
      query: query,
      variables: variables,
    };

    let requestBody = JSON.stringify(graphQLRequest);

    options.headers["Content-Length"] =
      Buffer.byteLength(requestBody).toString();

    if (url.protocol === "http:") {
      req = http.request(options);
    } else {
      req = https.request(options);
    }

    req.on("response", (response) => {
      let body = "";

      response.on("data", (responseBody) => {
        body += responseBody;
      });
      response.on("end", () => {
        let json = JSON.parse(body);

        callback(json.data.tokenizeUsBankLogin.paymentMethod.id);
      });

      return response.on("error", (err) =>
        console.log(`Unexpected response error: ${err}`)
      );
    });

    req.on("error", (err) => console.log(`Unexpected request error: ${err}`));

    req.write(requestBody);

    return req.end();
  });
};

let generateInvalidUsBankAccountNonce = function () {
  let nonceCharacters = "bcdfghjkmnpqrstvwxyz23456789".split("");
  let nonce = "tokenusbankacct";

  for (let i = 0; i <= 3; i++) {
    let n = [0, 1, 2, 3, 4, 5].map(
      () => nonceCharacters[Math.floor(Math.random() * nonceCharacters.length)]
    );

    nonce += `_${n.join("")}`;
  }
  nonce += "_xxx";

  return nonce;
};

let createTransactionToRefund = function (callback) {
  let transactionParams = {
    amount: "5.00",
    creditCard: {
      number: "5105105105105100",
      expirationDate: "05/2012",
    },
    options: {
      submitForSettlement: true,
    },
  };

  specHelper.defaultGateway.transaction.sale(transactionParams, (err, result) =>
    specHelper.defaultGateway.testing.settle(result.transaction.id, () =>
      specHelper.defaultGateway.transaction.find(
        result.transaction.id,
        (err, transaction) => callback(transaction)
      )
    )
  );
};

let createPayPalTransactionToRefund = function (callback) {
  let nonceParams = {
    paypalAccount: {
      consentCode: "PAYPAL_CONSENT_CODE",
      token: `PAYPAL_ACCOUNT_${randomId()}`,
    },
  };

  generateNonceForNewPaymentMethod(nonceParams, null, function (nonce) {
    let transactionParams = {
      amount: TransactionAmounts.Authorize,
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      },
    };

    defaultGateway.transaction.sale(
      transactionParams,
      function (err, response) {
        let transactionId = response.transaction.id;

        specHelper.settlePayPalTransaction(transactionId, () =>
          defaultGateway.transaction.find(transactionId, (err, transaction) =>
            callback(transaction)
          )
        );
      }
    );
  });
};

let createEscrowedTransaction = function (callback) {
  let transactionParams = {
    merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
    amount: "5.00",
    serviceFeeAmount: "1.00",
    creditCard: {
      number: "5105105105105100",
      expirationDate: "05/2012",
    },
    options: {
      holdInEscrow: true,
    },
  };

  specHelper.defaultGateway.transaction.sale(transactionParams, (err, result) =>
    specHelper.escrowTransaction(result.transaction.id, () =>
      specHelper.defaultGateway.transaction.find(
        result.transaction.id,
        (err, transaction) => callback(transaction)
      )
    )
  );
};

let decodeClientToken = function (encodedClientToken) {
  let decodedClientToken = Buffer.from(encodedClientToken, "base64").toString(
    "utf8"
  );
  let unescapedClientToken = decodedClientToken.replace("\\u0026", "&");

  return unescapedClientToken;
};

let createPlanForTests = (attributes, callback) =>
  specHelper.defaultGateway.http.post(
    `${defaultGateway.config.baseMerchantPath()}/plans/create_plan_for_tests`,
    { plan: attributes },
    () => callback()
  );

let createModificationForTests = (attributes, callback) =>
  specHelper.defaultGateway.http.post(
    `${defaultGateway.config.baseMerchantPath()}/modifications/create_modification_for_tests`,
    { modification: attributes },
    () => callback()
  );

let createToken = (gateway, attributes, callback) =>
  specHelper.createGrant(gateway, attributes, (err, code) =>
    gateway.oauth.createTokenFromCode({ code }, callback)
  );

let createGrant = (gateway, attributes, callback) =>
  gateway.http.post(
    "/oauth_testing/grants",
    attributes,
    function (err, response) {
      if (err) {
        callback(err, null);

        return;
      }
      callback(null, response.grant.code);
    }
  );

class ClientApiHttp {
  static initClass() {
    this.prototype.timeout = 60000;
  }

  constructor(config) {
    this.config = config;
  }

  get(url, params, callback) {
    if (params) {
      url += "?";
      for (let key in params) {
        if (!params.hasOwnProperty(key)) {
          continue;
        }

        let value = params[key];

        url += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
      }
      url = url.slice(0, -1);
    }

    return this.request("GET", url, null, callback);
  }

  post(url, body, callback) {
    return this.request("POST", url, body, callback);
  }

  checkHttpStatus(status) {
    switch (status.toString()) {
      case "200":
      case "201":
      case "422":
        return null;
      default:
        return status.toString();
    }
  }

  request(method, url, body, callback) {
    let requestBody;
    let client = http;

    let options = {
      host: this.config.environment.server,
      port: this.config.environment.port,
      method,
      path: `/merchants/${this.config.merchantId}${url}`,
      headers: {
        "X-ApiVersion": this.config.apiVersion,
        Accept: "application/xml",
        "Content-Type": "application/json",
        "User-Agent": `Braintree Node ${braintree.version}`,
      },
    };

    if (body) {
      requestBody = JSON.stringify(Util.convertObjectKeysToUnderscores(body));
      options.headers["Content-Length"] =
        Buffer.byteLength(requestBody).toString();
    }

    let theRequest = client.request(options, (response) => {
      body = "";
      response.on("data", (responseBody) => {
        body += responseBody;
      });
      response.on("end", () => callback(response.statusCode, body));

      return response.on("error", (err) =>
        callback(`Unexpected response error: ${err}`)
      );
    });

    theRequest.setTimeout(this.timeout, () => callback("timeout"));
    theRequest.on("error", (err) =>
      callback(`Unexpected request error: ${err}`)
    );

    if (body) {
      theRequest.write(requestBody);
    }

    return theRequest.end();
  }
}
ClientApiHttp.initClass();

global.specHelper = {
  addOns,
  braintree,
  create3DSVerification,
  generate3DSNonce,
  dateToMdy,
  settlementDate,
  defaultConfig,
  defaultGateway,
  merchant2Gateway,
  doesNotInclude,
  escrowTransaction,
  makePastDue,
  multiplyString,
  plans,
  randomId,
  settlePayPalTransaction,
  defaultMerchantAccountId: "sandbox_credit_card",
  nonDefaultMerchantAccountId: "sandbox_credit_card_non_default",
  nonDefaultSubMerchantAccountId: "sandbox_sub_merchant_account",
  threeDSecureMerchantAccountId: "three_d_secure_merchant_account",
  adyenMerchantAccountId: "adyen_ma",
  fakeAmexDirectMerchantAccountId: "fake_amex_direct_usd",
  fakeVenmoAccountMerchantAccountId: "fake_first_data_venmo_account",
  fakeFirstDataMerchantAccountId: "fake_first_data_merchant_account",
  clientApiHttp: ClientApiHttp,
  decodeClientToken,
  createTransactionToRefund,
  createPayPalTransactionToRefund,
  createEscrowedTransaction,
  generateNonceForNewPaymentMethod,
  generateValidUsBankAccountNonce,
  generateInvalidUsBankAccountNonce,
  generatePlaidUsBankAccountNonce,
  createPlanForTests,
  createModificationForTests,
  createGrant,
  createToken,
  fraudProtectionEnterpriseGateway,
  fraudProtectionEnterpriseConfig,
  effortlessChargebackProtectionGateway,
};
