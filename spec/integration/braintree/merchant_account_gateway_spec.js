'use strict';

require('../../spec_helper');

let braintree = specHelper.braintree;
let MerchantAccount = require('../../../lib/braintree/merchant_account').MerchantAccount;
let ValidationErrorCodes = require('../../../lib/braintree/validation_error_codes').ValidationErrorCodes;

let legacyMerchantAccountParams = {
  applicantDetails: {
    firstName: "Joe",
    lastName: "Bloggs",
    email: "joe@bloggs.com",
    phone: "555-555-5555",
    address: {
      streetAddress: "123 Credibility St.",
      postalCode: "60606",
      locality: "Chicago",
      region: "IL"
    },
    dateOfBirth: "10/9/1980",
    ssn: "123-00-1234",
    routingNumber: "122100024",
    accountNumber: "43759348798",
    taxId: "123456789",
    companyName: "Waterfalls, inc"
  },
  tosAccepted: true,
  masterMerchantAccountId: "sandbox_master_merchant_account"
};

let validMerchantAccountParams = {
  individual: {
    firstName: "Joe",
    lastName: "Bloggs",
    email: "joe@bloggs.com",
    phone: "3125551234",
    address: {
      streetAddress: "123 Credibility St.",
      postalCode: "60606",
      locality: "Chicago",
      region: "IL"
    },
    dateOfBirth: "10/9/1980",
    ssn: "123-00-1234"
  },
  business: {
    legalName: "Joe's Bloggs",
    dbaName: "Joe's Junkyard",
    taxId: "123456789",
    address: {
      streetAddress: "456 Fake St",
      postalCode: "48104",
      locality: "Ann Arbor",
      region: "MI"
    }
  },
  funding: {
    destination: MerchantAccount.FundingDestination.Bank,
    routingNumber: "011103093",
    accountNumber: "43759348798",
    descriptor: "Joe Bloggs MI"
  },
  tosAccepted: true,
  masterMerchantAccountId: "sandbox_master_merchant_account"
};

describe("MerchantAccountGateway", function() {
  describe("create", function() {
    it("accepts the legacy parameters", done =>
      specHelper.defaultGateway.merchantAccount.create(legacyMerchantAccountParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.merchantAccount.status, MerchantAccount.Status.Pending);
        assert.equal(response.merchantAccount.masterMerchantAccount.id, "sandbox_master_merchant_account");

        return done();
      })
    );

    it("accepts the new paramaters and doesn't require an id", done =>
      specHelper.defaultGateway.merchantAccount.create(validMerchantAccountParams, function(err, response) {
        assert.isTrue(response.success);
        assert.equal(response.merchantAccount.status, MerchantAccount.Status.Pending);
        assert.equal(response.merchantAccount.masterMerchantAccount.id, "sandbox_master_merchant_account");

        return done();
      })
    );

    it("allows an id to be passed", function(done) {
      let paramsWithId = new validMerchantAccountParams.constructor();
      for (let key in validMerchantAccountParams) {
        paramsWithId[key] = validMerchantAccountParams[key];
      }
      let rand = Math.floor(Math.random() * 1000);
      paramsWithId["id"] = `sub_merchant_account_id${rand}`;
      return specHelper.defaultGateway.merchantAccount.create(paramsWithId, function(err, response) {
        assert.isTrue(response.success);
        assert.equal(response.merchantAccount.status, MerchantAccount.Status.Pending);
        assert.equal(response.merchantAccount.masterMerchantAccount.id, "sandbox_master_merchant_account");
        assert.equal(response.merchantAccount.id, `sub_merchant_account_id${rand}`);

        return done();
      });
    });

    it("requires a master merchant account id", done =>
      specHelper.defaultGateway.merchantAccount.create({}, function(err, response) {
        assert.isFalse(response.success);
        assert.equal(
          response.errors.for('merchantAccount').on('masterMerchantAccountId')[0].code,
          ValidationErrorCodes.MerchantAccount.MasterMerchantAccountIdIsRequired
        );

        return done();
      })
    );

    it("requires the terms of service to be accepted", function(done) {
      let params = {master_merchant_account_id: "sandbox_master_merchant_account"};
      return specHelper.defaultGateway.merchantAccount.create(params, function(err, response) {
        assert.isFalse(response.success);
        assert.equal(
          response.errors.for('merchantAccount').on('tosAccepted')[0].code,
          ValidationErrorCodes.MerchantAccount.TosAcceptedIsRequired
        );

        return done();
      });
    });

    return describe("funding destination", function() {
      it("accepts a bank", function(done) {
        let params = new validMerchantAccountParams.constructor();
        for (let key in validMerchantAccountParams) {
          params[key] = validMerchantAccountParams[key];
        }
        params["funding"]["destination"] = MerchantAccount.FundingDestination.Bank;

        return specHelper.defaultGateway.merchantAccount.create(params, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.merchantAccount.status, MerchantAccount.Status.Pending);
          assert.equal(response.merchantAccount.masterMerchantAccount.id, "sandbox_master_merchant_account");

          return done();
        });
      });

      it("accepts an email", function(done) {
        let params = new validMerchantAccountParams.constructor();
        for (let key in validMerchantAccountParams) {
          params[key] = validMerchantAccountParams[key];
        }
        params["funding"]["destination"] = MerchantAccount.FundingDestination.Email;
        params["funding"]["email"] = "joejosey@compuserve.com";

        return specHelper.defaultGateway.merchantAccount.create(params, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.merchantAccount.status, MerchantAccount.Status.Pending);
          assert.equal(response.merchantAccount.masterMerchantAccount.id, "sandbox_master_merchant_account");

          return done();
        });
      });

      return it("accepts a mobile phone", function(done) {
        let params = new validMerchantAccountParams.constructor();
        for (let key in validMerchantAccountParams) {
          params[key] = validMerchantAccountParams[key];
        }
        params["funding"]["destination"] = MerchantAccount.FundingDestination.MobilePhone;
        params["funding"]["mobile_phone"] = "1112223333";

        return specHelper.defaultGateway.merchantAccount.create(params, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.merchantAccount.status, MerchantAccount.Status.Pending);
          assert.equal(response.merchantAccount.masterMerchantAccount.id, "sandbox_master_merchant_account");

          return done();
        });
      });
    });
  });

  describe("update", function() {
    it("updates the Merchant Account info", function(done) {
      let params = new validMerchantAccountParams.constructor();
      for (let key in validMerchantAccountParams) {
        params[key] = validMerchantAccountParams[key];
      }
      delete params["tos_accepted"];
      delete params["master_merchant_account_id"];

      params["individual"]["first_name"] = "John";
      params["individual"]["last_name"] = "Doe";
      params["individual"]["email"] = "john.doe@example.com";
      params["individual"]["date_of_birth"] = "1970-01-01";
      params["individual"]["ssn"] = "555123456";
      params["individual"]["phone"] = "3125551234";
      params["individual"]["address"]["street_address"] = "123 Fake St";
      params["individual"]["address"]["locality"] = "Chicago";
      params["individual"]["address"]["region"] = "IL";
      params["individual"]["address"]["postal_code"] = "60622";
      params["business"]["dba_name"] = "James's Bloggs";
      params["business"]["legal_name"] = "James's Bloggs Inc";
      params["business"]["tax_id"] = "123456789";
      params["business"]["address"]["street_address"] = "999 Fake St";
      params["business"]["address"]["locality"] = "Miami";
      params["business"]["address"]["region"] = "FL";
      params["business"]["address"]["postal_code"] = "99999";
      params["funding"]["account_number"] = "43759348798";
      params["funding"]["routing_number"] = "071000013";
      params["funding"]["email"] = "check@this.com";
      params["funding"]["mobile_phone"] = "1234567890";
      params["funding"]["destination"] = MerchantAccount.FundingDestination.MobilePhone;
      params["funding"]["descriptor"] = "James Bloggs FL";

      return specHelper.defaultGateway.merchantAccount.update("sandbox_sub_merchant_account", params, function(err, response) {
        assert.isTrue(response.success);
        assert.equal(response.merchantAccount.status, MerchantAccount.Status.Active);
        assert.equal(response.merchantAccount.id, "sandbox_sub_merchant_account");
        assert.equal(response.merchantAccount.masterMerchantAccount.id, "sandbox_master_merchant_account");
        assert.equal(response.merchantAccount.individual.firstName, "John");
        assert.equal(response.merchantAccount.individual.lastName, "Doe");
        assert.equal(response.merchantAccount.individual.email, "john.doe@example.com");
        assert.equal(response.merchantAccount.individual.dateOfBirth, "1970-01-01");
        assert.equal(response.merchantAccount.individual.ssnLast4, "3456");
        assert.equal(response.merchantAccount.individual.phone, "3125551234");
        assert.equal(response.merchantAccount.individual.address.streetAddress, "123 Fake St");
        assert.equal(response.merchantAccount.individual.address.locality, "Chicago");
        assert.equal(response.merchantAccount.individual.address.region, "IL");
        assert.equal(response.merchantAccount.individual.address.postalCode, "60622");
        assert.equal(response.merchantAccount.business.dbaName, "James's Bloggs");
        assert.equal(response.merchantAccount.business.legalName, "James's Bloggs Inc");
        assert.equal(response.merchantAccount.business.taxId, "123456789");
        assert.equal(response.merchantAccount.business.address.streetAddress, "999 Fake St");
        assert.equal(response.merchantAccount.business.address.locality, "Miami");
        assert.equal(response.merchantAccount.business.address.region, "FL");
        assert.equal(response.merchantAccount.business.address.postalCode, "99999");
        assert.equal(response.merchantAccount.funding.accountNumberLast4, "8798");
        assert.equal(response.merchantAccount.funding.routingNumber, "071000013");
        assert.equal(response.merchantAccount.funding.email, "check@this.com");
        assert.equal(response.merchantAccount.funding.mobilePhone, "1234567890");
        assert.equal(response.merchantAccount.funding.destination, MerchantAccount.FundingDestination.MobilePhone);
        assert.equal(response.merchantAccount.funding.descriptor, "James Bloggs FL");

        return done();
      });
    });

    it("does not require all fields", done =>
      specHelper.defaultGateway.merchantAccount.update("sandbox_sub_merchant_account", {"individual": {"first_name": "Joe"}} , function(err, response) {
        assert.isTrue(response.success);

        return done();
      })
    );

    it("handles validation errors for blank fields", function(done) {
      let params = {
        individual: {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: {
            streetAddress: "",
            postalCode: "",
            locality: "",
            region: ""
          },
          dateOfBirth: "",
          ssn: ""
        },
        business: {
          legalName: "",
          dbaName: "",
          taxId: "",
          address: {
            streetAddress: "",
            postalCode: "",
            locality: "",
            region: ""
          }
        },
        funding: {
          destination: "",
          routingNumber: "",
          accountNumber: ""
        }
      };

      return specHelper.defaultGateway.merchantAccount.update("sandbox_sub_merchant_account", params, function(err, response) {
        assert.isFalse(response.success);

        assert.equal(
          response.errors.for("merchantAccount").for("individual").on("firstName")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.FirstNameIsRequired
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").on("lastName")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.LastNameIsRequired
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").on("dateOfBirth")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.DateOfBirthIsRequired
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").on("email")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.EmailIsRequired
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").for("address").on("streetAddress")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.Address.StreetAddressIsRequired
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").for("address").on("postalCode")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.Address.PostalCodeIsRequired
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").for("address").on("locality")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.Address.LocalityIsRequired
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").for("address").on("region")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.Address.RegionIsRequired
        );
        assert.equal(
          response.errors.for("merchantAccount").for("funding").on("destination")[0].code,
          ValidationErrorCodes.MerchantAccount.Funding.DestinationIsRequired
        );

        return done();
      });
    });

    return it("handles validation errors for invalid fields", function(done) {
      let params = {
        "individual": {
          "first_name": "<>",
          "last_name": "<>",
          "email": "bad",
          "phone": "999",
          "address": {
            "street_address": "nope",
            "postal_code": "1",
            "region": "QQ",
          },
          "date_of_birth": "hah",
          "ssn": "12345",
        },
        "business": {
          "legal_name": "``{}",
          "dba_name": "{}``",
          "tax_id": "bad",
          "address": {
            "street_address": "nope",
            "postal_code": "1",
            "region": "QQ",
          },
        },
        "funding": {
          "destination": "MY WALLET",
          "routing_number": "LEATHER",
          "account_number": "BACK POCKET",
          "email": "BILLFOLD",
          "mobile_phone": "TRIFOLD"
        },
      };

      return specHelper.defaultGateway.merchantAccount.update("sandbox_sub_merchant_account", params, function(err, response) {
        assert.isFalse(response.success);

        assert.equal(
          response.errors.for("merchantAccount").for("individual").on("firstName")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.FirstNameIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").on("lastName")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.LastNameIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").on("email")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.EmailIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").on("phone")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.PhoneIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").for("address").on("streetAddress")[0].code,
           ValidationErrorCodes.MerchantAccount.Individual.Address.StreetAddressIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").for("address").on("postalCode")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.Address.PostalCodeIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").for("address").on("region")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.Address.RegionIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("individual").on("ssn")[0].code,
          ValidationErrorCodes.MerchantAccount.Individual.SsnIsInvalid
        );

        assert.equal(
          response.errors.for("merchantAccount").for("business").on("legalName")[0].code,
          ValidationErrorCodes.MerchantAccount.Business.LegalNameIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("business").on("dbaName")[0].code,
          ValidationErrorCodes.MerchantAccount.Business.DbaNameIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("business").on("taxId")[0].code,
          ValidationErrorCodes.MerchantAccount.Business.TaxIdIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("business").for("address").on("streetAddress")[0].code,
           ValidationErrorCodes.MerchantAccount.Business.Address.StreetAddressIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("business").for("address").on("postalCode")[0].code,
          ValidationErrorCodes.MerchantAccount.Business.Address.PostalCodeIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("business").for("address").on("region")[0].code,
          ValidationErrorCodes.MerchantAccount.Business.Address.RegionIsInvalid
        );

        assert.equal(
          response.errors.for("merchantAccount").for("funding").on("destination")[0].code,
          ValidationErrorCodes.MerchantAccount.Funding.DestinationIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("funding").on("routingNumber")[0].code,
          ValidationErrorCodes.MerchantAccount.Funding.RoutingNumberIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("funding").on("accountNumber")[0].code,
          ValidationErrorCodes.MerchantAccount.Funding.AccountNumberIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("funding").on("email")[0].code,
          ValidationErrorCodes.MerchantAccount.Funding.EmailIsInvalid
        );
        assert.equal(
          response.errors.for("merchantAccount").for("funding").on("mobilePhone")[0].code,
          ValidationErrorCodes.MerchantAccount.Funding.MobilePhoneIsInvalid
        );

        return done();
      });
    });
  });

  describe("validation errors for business fields", function() {
    it("requires legal name with tax id", function(done) {
      let params = {
        "business": {
          "legal_name": "",
          "tax_id": "111223333"
        }
      };

      return specHelper.defaultGateway.merchantAccount.update("sandbox_sub_merchant_account", params, function(err, response) {
        assert.isFalse(response.success);

        assert.equal(
          response.errors.for("merchantAccount").for("business").on("taxId")[0].code,
          ValidationErrorCodes.MerchantAccount.Business.TaxIdMustBeBlank
        );

        assert.equal(
          response.errors.for("merchantAccount").for("business").on("legalName")[0].code,
          ValidationErrorCodes.MerchantAccount.Business.LegalNameIsRequiredWithTaxId
        );

        return done();
      });
    });

    return it("requires tax id with legal name", function(done) {
      let params = {
        "business": {
          "legal_name": "legal name",
          "tax_id": ""
        }
      };

      return specHelper.defaultGateway.merchantAccount.update("sandbox_sub_merchant_account", params, function(err, response) {
        assert.isFalse(response.success);

        assert.equal(
          response.errors.for("merchantAccount").for("business").on("taxId")[0].code,
          ValidationErrorCodes.MerchantAccount.Business.TaxIdIsRequiredWithLegalName
        );

        return done();
      });
    });
  });

  describe("validation errors for funding fields", function() {
    it("requires routing and account numbers when a bank destination is specified", function(done) {
      let params = {
        "funding": {
          "destination": MerchantAccount.FundingDestination.Bank,
          "routing_number": "",
          "account_number": ""
        }
      };

      return specHelper.defaultGateway.merchantAccount.update("sandbox_sub_merchant_account", params, function(err, response) {
        assert.isFalse(response.success);

        assert.equal(
          response.errors.for("merchantAccount").for("funding").on("accountNumber")[0].code,
          ValidationErrorCodes.MerchantAccount.Funding.AccountNumberIsRequired
        );

        assert.equal(
          response.errors.for("merchantAccount").for("funding").on("routingNumber")[0].code,
          ValidationErrorCodes.MerchantAccount.Funding.RoutingNumberIsRequired
        );

        return done();
      });
    });

    it("requires email when a email destination is specified", function(done) {
      let params = {
        "funding": {
          "destination": MerchantAccount.FundingDestination.Email,
          "email": ""
        }
      };

      return specHelper.defaultGateway.merchantAccount.update("sandbox_sub_merchant_account", params, function(err, response) {
        assert.isFalse(response.success);

        assert.equal(
          response.errors.for("merchantAccount").for("funding").on("email")[0].code,
          ValidationErrorCodes.MerchantAccount.Funding.EmailIsRequired
        );

        return done();
      });
    });

    return it("requires mobile_phone when a mobile_phone destination is specified", function(done) {
      let params = {
        "funding": {
          "destination": MerchantAccount.FundingDestination.MobilePhone,
          "mobile_phone": ""
        }
      };

      return specHelper.defaultGateway.merchantAccount.update("sandbox_sub_merchant_account", params, function(err, response) {
        assert.isFalse(response.success);

        assert.equal(
          response.errors.for("merchantAccount").for("funding").on("mobilePhone")[0].code,
          ValidationErrorCodes.MerchantAccount.Funding.MobilePhoneIsRequired
        );

        return done();
      });
    });
  });

  describe("find", function() {
    it("can find a merchant account by id", done =>
      specHelper.defaultGateway.merchantAccount.create(validMerchantAccountParams, function(err, response) {
        assert.isTrue(response.success);
        let merchantAccountId = response.merchantAccount.id;

        return specHelper.defaultGateway.merchantAccount.find(merchantAccountId, function(err, merchantAccount) {
          assert.equal(null, err);
          assert.equal(merchantAccount.id, merchantAccountId);

          return done();
        });
      })
    );

    it("retrieves a master merchant accounts currency iso code", done =>
      specHelper.defaultGateway.merchantAccount.find("sandbox_master_merchant_account", function(err, merchantAccount) {
        assert.equal(merchantAccount.currencyIsoCode, "USD");

        return done();
      })
    );

    return it("returns a not found error if given a bad id", done =>
      specHelper.defaultGateway.merchantAccount.find(" ", function(err, merchantAccount) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        return done();
      })
    );
  });

  describe("all", function() {
    context("using a callback", function() {
      it("returns all merchant accounts", function(done) {
        let gateway = braintree.connect({
          clientId: "client_id$development$integration_client_id",
          clientSecret: "client_secret$development$integration_client_secret"
        });

        return specHelper.createToken(gateway, {merchantPublicId: "integration_merchant_id", scope: "read_write"}, function(err, response) {
          gateway = braintree.connect({
            accessToken: response.credentials.accessToken
          });

          return gateway.merchantAccount.all(function(err, merchantAccounts) {
            assert.equal(true, merchantAccounts.length > 20);
            return done();
          });
        });
      });

      it("handles a response containing a single merchant account", function(done) {
        let gateway = braintree.connect({
          clientId: "client_id$development$integration_client_id",
          clientSecret: "client_secret$development$integration_client_secret"
        });

        return gateway.merchant.create({email: 'name@email.com', countryCodeAlpha3: 'USA', paymentMethods: ['credit_card', 'paypal']}, function(err, response) {
          gateway = braintree.connect({
            accessToken: response.credentials.accessToken
          });
          let merchantAccounts = [];
          return gateway.merchantAccount.all(function(err, merchantAccounts) {
            assert.equal(merchantAccounts.length, 1);

            let merchantAccount = merchantAccounts[0];
            assert.equal(merchantAccount.currencyIsoCode, "USD");
            return done();
          });
        });
      });

      it("returns a merchant account with correct attributes", function(done) {
        let gateway = braintree.connect({
          clientId: "client_id$development$integration_client_id",
          clientSecret: "client_secret$development$integration_client_secret"
        });

        return gateway.merchant.create({email: 'name@email.com', countryCodeAlpha3: 'USA', paymentMethods: ['credit_card', 'paypal']}, function(err, response) {
          gateway = braintree.connect({
            accessToken: response.credentials.accessToken
          });
          let merchantAccounts = [];
          return gateway.merchantAccount.all(function(err, merchantAccounts) {
            assert.equal(merchantAccounts.length, 1);

            let merchantAccount = merchantAccounts[0];
            assert.equal(merchantAccount.currencyIsoCode, "USD");
            assert.equal(merchantAccount.status, "active");
            assert.equal(merchantAccount.default, true);
            return done();
          });
        });
      });

      return it("gracefully handles errors", function(done) {
        let gateway = braintree.connect({
          clientId: "client_id$development$integration_client_id",
          clientSecret: "client_secret$development$integration_client_secret"
        });

        return specHelper.createToken(gateway, {merchantPublicId: "integration_merchant_id", scope: "read_write"}, function(err, response) {
          gateway = braintree.connect({
            accessToken: response.credentials.accessToken
          });

          gateway.config.merchantId = "nonexistantmerchant";

          return gateway.merchantAccount.all(function(err) {
            assert(err);
            assert.equal(err.type, braintree.errorTypes.authenticationError);
            return done();
          });
        });
      });
    });

    return context("using a stream", function() {
      it("returns a stream if no callback is provided", function(done) {
        let gateway = braintree.connect({
          clientId: "client_id$development$integration_client_id",
          clientSecret: "client_secret$development$integration_client_secret"
        });

        return specHelper.createToken(gateway, {merchantPublicId: "integration_merchant_id", scope: "read_write"}, function(err, response) {
          gateway = braintree.connect({
            accessToken: response.credentials.accessToken
          });

          let merchantAccounts = [];
          let merchantAccountStream = gateway.merchantAccount.all();
          merchantAccountStream.on("data", data => merchantAccounts.push(data));

          return merchantAccountStream.on("end", function() {
            assert.equal(true, merchantAccounts.length > 20);
            return done();
          });
        });
      });

      it("returns a merchant account with correct attributes", function(done) {
        let gateway = braintree.connect({
          clientId: "client_id$development$integration_client_id",
          clientSecret: "client_secret$development$integration_client_secret"
        });

        return gateway.merchant.create({email: 'name@email.com', countryCodeAlpha3: 'USA', paymentMethods: ['credit_card', 'paypal']}, function(err, response) {
          gateway = braintree.connect({
            accessToken: response.credentials.accessToken
          });
          let merchantAccounts = [];
          let merchantAccountStream = gateway.merchantAccount.all();
          merchantAccountStream.on("data", data => merchantAccounts.push(data));

          return merchantAccountStream.on("end", function() {
            assert.equal(merchantAccounts.length, 1);
            let merchantAccount = merchantAccounts[0];
            assert.equal(merchantAccount.currencyIsoCode, "USD");
            assert.equal(merchantAccount.status, "active");
            assert.equal(merchantAccount.default, true);
            return done();
          });
        });
      });

      return it("gracefully handles errors", function(done) {
        let gateway = braintree.connect({
          clientId: "client_id$development$integration_client_id",
          clientSecret: "client_secret$development$integration_client_secret"
        });

        return specHelper.createToken(gateway, {merchantPublicId: "integration_merchant_id", scope: "read_write"}, function(err, response) {
          gateway = braintree.connect({
            accessToken: response.credentials.accessToken
          });

          gateway.config.merchantId = "nonexistantmerchant";

          let merchantAccountStream = gateway.merchantAccount.all();
          merchantAccountStream.on("error", function(error) {
            assert.equal(error.type, braintree.errorTypes.authenticationError);
            return done();
          });

          merchantAccountStream.on("data", function() {
            throw new Error("Should not have data");
          });

          return merchantAccountStream.on("end", function() {
            throw new Error("Should not have ended");
          });
        });
      });
    });
  });

  return describe("createForCurrency", function() {
    it("creates a new merchant account for currency", function(done) {
      let gateway = braintree.connect({
        clientId: 'client_id$development$signup_client_id',
        clientSecret: 'client_secret$development$signup_client_secret'
      });

      return gateway.merchant.create({
        email: 'name@email.com',
        countryCodeAlpha3: 'USA',
        paymentMethods: ['credit_card', 'paypal']
      }, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        gateway = braintree.connect({
          accessToken: response.credentials.accessToken
        });

        return gateway.merchantAccount.createForCurrency({
          currency: 'JPY'
        }, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          assert.equal(response.merchantAccount.currencyIsoCode, "JPY");
          return done();
        });
      });
    });

    it("returns error if merchant account exists for currency", function(done) {
      let gateway = braintree.connect({
        clientId: 'client_id$development$signup_client_id',
        clientSecret: 'client_secret$development$signup_client_secret'
      });

      return gateway.merchant.create({
        email: 'name@email.com',
        countryCodeAlpha3: 'USA',
        paymentMethods: ['credit_card', 'paypal']
      }, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        gateway = braintree.connect({
          accessToken: response.credentials.accessToken
        });

        return gateway.merchantAccount.createForCurrency({
          currency: 'USD'
        }, function(err, response) {
          assert.isNotNull(response.error);
          assert.isFalse(response.success);

          assert.equal(
            response.errors.for('merchant').on('currency')[0].code,
            ValidationErrorCodes.Merchant.MerchantAccountExistsForCurrency
          );
          return done();
        });
      });
    });

    it("returns error if currency is not provided", function(done) {
      let gateway = braintree.connect({
        clientId: 'client_id$development$signup_client_id',
        clientSecret: 'client_secret$development$signup_client_secret'
      });

      return gateway.merchant.create({
        email: 'name@email.com',
        countryCodeAlpha3: 'USA',
        paymentMethods: ['credit_card', 'paypal']
      }, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        gateway = braintree.connect({
          accessToken: response.credentials.accessToken
        });

        return gateway.merchantAccount.createForCurrency({
        }, function(err, response) {
          assert.isNotNull(response.errors);
          assert.isFalse(response.success);

          assert.equal(
            response.errors.for('merchant').on('currency')[0].code,
            ValidationErrorCodes.Merchant.CurrencyIsRequired
          );

          return done();
        });
      });
    });

    it("returns error if currency is invalid", function(done) {
      let gateway = braintree.connect({
        clientId: 'client_id$development$signup_client_id',
        clientSecret: 'client_secret$development$signup_client_secret'
      });

      return gateway.merchant.create({
        email: 'name@email.com',
        countryCodeAlpha3: 'USA',
        paymentMethods: ['credit_card', 'paypal']
      }, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        gateway = braintree.connect({
          accessToken: response.credentials.accessToken
        });

        return gateway.merchantAccount.createForCurrency({
          currency: 'fake_currency'
        }, function(err, response) {
          assert.isNotNull(response.errors);
          assert.isFalse(response.success);

          assert.equal(
            response.errors.for('merchant').on('currency')[0].code,
            ValidationErrorCodes.Merchant.CurrencyIsInvalid
          );

          return done();
        });
      });
    });

    return it("returns error if merchant account exists for id", function(done) {
      let gateway = braintree.connect({
        clientId: 'client_id$development$signup_client_id',
        clientSecret: 'client_secret$development$signup_client_secret'
      });

      return gateway.merchant.create({
        email: 'name@email.com',
        countryCodeAlpha3: 'USA',
        paymentMethods: ['credit_card', 'paypal']
      }, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        gateway = braintree.connect({
          accessToken: response.credentials.accessToken
        });

        gateway.merchantAccount.createForCurrency({
          currency: 'GBP',
          id: response.merchant.merchantAccounts[0].id
        }, function(err, response) {
          assert.isNotNull(response.errors);
          assert.isFalse(response.success);

          return assert.equal(
            response.errors.for('merchant').on('id')[0].code,
            ValidationErrorCodes.Merchant.MerchantAccountExistsForId
          );
        });

        return done();
      });
    });
  });
});
