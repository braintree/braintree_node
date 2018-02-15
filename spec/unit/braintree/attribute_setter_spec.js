'use strict';

let AttributeSetter = require('../../../lib/braintree/attribute_setter').AttributeSetter;

describe('AttributeSetter', function () {
  describe('getGateway', function () {
    it('it returns gateway object passed into constructor', function () {
      let gw = {foo: 'bar'};
      let obj = new AttributeSetter({
        foo: 'bar'
      }, gw);

      assert.equal(obj.getGateway(), gw);
    });

    it('it does not require a gateway object', function () {
      let obj = new AttributeSetter({
        foo: 'bar'
      });

      assert.notExists(obj.getGateway());
    });
  });
});
