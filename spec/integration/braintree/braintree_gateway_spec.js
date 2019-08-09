'use strict';

let gateway = specHelper.defaultGateway;

describe('Braintree Gateway', () =>
  describe('graphql requests', () => {
    it('can tokenize credit cards', (done) => {
      let definition = `mutation ExampleServerSideSingleUseToken($input: TokenizeCreditCardInput!) {
  tokenizeCreditCard(input: $input) {
    paymentMethod {
      id
      usage
      details {
        ... on CreditCardDetails {
          bin
          brandCode
          last4
          expirationYear
          expirationMonth
        }
      }
    }
  }
}`;
      let variables = {
        input: {
          creditCard: {
            number: '4005519200000004',
            expirationYear: '2024',
            expirationMonth: '05',
            cardholderName: 'Joe Bloggs'
          }
        }
      };

      gateway.graphQLClient.query(definition, variables, (err, response) => {
        let paymentMethod = response.data.tokenizeCreditCard.paymentMethod;
        let details = paymentMethod.details;

        assert.notExists(response.errors);

        assert.exists(paymentMethod.id);
        assert.equal(details.bin, '400551');
        assert.equal(details.last4, '0004');
        assert.equal(details.brandCode, 'VISA');
        assert.equal(details.expirationMonth, '05');
        assert.equal(details.expirationYear, '2024');
        done();
      });
    });

    it('can request without variables', (done) => {
      let ping = 'query { ping }';

      gateway.graphQLClient.query(ping, null, (err, response) => {
        assert.notExists(response.errors);
        assert.equal(response.data.ping, 'pong');
        done();
      });
    });
  })
);
