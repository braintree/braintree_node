'use strict';

require('../../spec_helper');
let CreditCardGateway = require('../../../lib/braintree/credit_card_gateway').CreditCardGateway;

describe('CreditCardGateway', () =>
  describe('dateFormat', () =>
    it('works with a month boundary', function () {
      let gateway = new CreditCardGateway(specHelper.defaultGateway);
      let date = new Date('2016-10-1');

      assert.equal(gateway.dateFormat(date), '102016');
    })
  )
);
