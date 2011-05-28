require('../spec_helper');

var _ = require('underscore')._;

vows.describe('TransparentRedirectGateway').addBatch({
  'createCustomerData': {
  //   'the test': {
  //     topic: specHelper.defaultGateway.transparentRedirect.createCustomerData({}),
  //     'inspect': function (result) {
  //       inspect(result);
  //     }
  //   },

    'generating data to create a customer': {
      topic: function () {
        var callback = this.callback;
        specHelper.simulateTrFormPost(
          specHelper.defaultGateway.transparentRedirect.url,
          specHelper.defaultGateway.transparentRedirect.createCustomerData({
            redirectUrl: 'http://www.example.com',
            customer: {
              firstName: 'Dan'
            }
          }),
          {customer: {last_name: 'Smith'}},
          function (err, result) {
            specHelper.defaultGateway.transparentRedirect.confirm(result, callback);
          }
        );
      },
      'is successful': function (err, result) {
        assert.isNull(err);
        assert.equal(result.success, true);
      },
      'uses data submitted in tr_data': function (err, result) {
        assert.equal(result.customer.firstName, 'Dan');
      },
      'uses data submitted in form params': function (err, result) {
        assert.equal(result.customer.lastName, 'Smith');
      }
    }
  },
}).export(module);
