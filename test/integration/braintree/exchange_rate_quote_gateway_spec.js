'use strict';

describe('Exchange Rate Quote Gateway', () =>
  describe('GraphQL Mutation', () => {
    it('successfully generates exchange rate quote with markup', (done) => {
      let exchangeRateQuoteRequest = {
        quotes: [
          {
            baseCurrency: 'USD',
            quoteCurrency: 'EUR',
            baseAmount: '12.19',
            markup: '12.14'
          },
          {
            baseCurrency: 'EUR',
            quoteCurrency: 'CAD',
            baseAmount: '15.16',
            markup: '2.64'
          }
        ]
      };

      specHelper.defaultGateway.exchangeRateQuote.generate(exchangeRateQuoteRequest,
        (err, response) => {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.isNotNull(response && response.exchangeRateQuotePayload);
          let quotes = response.exchangeRateQuotePayload.quotes;

          assert.isNotNull(quotes);
          assert.equal(quotes.length, 2);
          let firstQuote = quotes[0];

          assert.equal(firstQuote.id, 'ZXhjaGFuZ2VyYXRlcXVvdGVfMDEyM0FCQw');
          assert.equal(firstQuote.baseAmount.value, '12.19');
          assert.equal(firstQuote.baseAmount.currencyCode, 'USD');
          assert.equal(firstQuote.quoteAmount.value, '12.16');
          assert.equal(firstQuote.quoteAmount.currencyCode, 'EUR');
          assert.equal(firstQuote.exchangeRate, '0.997316360864');
          assert.equal(firstQuote.tradeRate, '0.01');
          let secondQuote = quotes[1];

          assert.equal(secondQuote.id, 'ZXhjaGFuZ2VyYXRlcXVvdGVfQUJDMDEyMw');
          assert.equal(secondQuote.baseAmount.value, '15.16');
          assert.equal(secondQuote.baseAmount.currencyCode, 'EUR');
          assert.equal(secondQuote.quoteAmount.value, '23.30');
          assert.equal(secondQuote.quoteAmount.currencyCode, 'CAD');
          assert.equal(secondQuote.exchangeRate, '1.536744692129366');
          assert.equal(secondQuote.tradeRate, null);
          done();
        }
      );
    });

    it('successfully generates exchange rate quote', (done) => {
      let exchangeRateQuoteRequest = {
        quotes: [
          {
            baseCurrency: 'USD',
            quoteCurrency: 'EUR'
          },
          {
            baseCurrency: 'EUR',
            quoteCurrency: 'CAD'
          }
        ]
      };

      specHelper.defaultGateway.exchangeRateQuote.generate(exchangeRateQuoteRequest,
        (err, response) => {
          assert.isNull(err);
          assert.isNotNull(response && response.exchangeRateQuotePayload);
          done();
        }
      );
    });

    it('handles request key validation error', (done) => {
      let exchangeRateQuoteRequest = {
        quotes: [
          {
            baseCurrency: 'USD',
            quoteCurrency: 'EUR',
            baseAmount: '',
            markup: '12.14'
          },
          {
            baseCurrency: 'EUR',
            quoteCurrency: 'CAD',
            baseAmount: '15.16',
            markup: '2.64'
          }
        ]
      };

      specHelper.defaultGateway.exchangeRateQuote.generate(exchangeRateQuoteRequest,
        (err, response) => {
          assert.isNull(err);
          assert.isNotNull(response && response.errors && response.errors[0]);
          assert.equal(response.errors[0].message, 'Variable \'baseAmount\' has an invalid value : Values of type Amount must be either a whole number or a number with up to 3 decimal places.');
          done();
        }
      );
    });

    it('handles request missing quoteCurrency error', (done) => {
      let exchangeRateQuoteRequest = {
        quotes: [
          {
            baseCurrency: 'USD',
            baseAmount: '12.19',
            markup: '12.14'
          },
          {
            baseCurrency: 'EUR',
            quoteCurrency: 'CAD',
            baseAmount: '15.16',
            markup: '2.64'
          }
        ]
      };

      specHelper.defaultGateway.exchangeRateQuote.generate(exchangeRateQuoteRequest,
        (err, response) => {
          assert.isNotNull(err);
          assert.isUndefined(response);
          assert.equal(err.message, 'Unexpected HTTP response: Field \'quoteCurrency\' of variable \'exchangeRateQuoteRequest\' has coerced Null value for NonNull type \'CurrencyCodeAlpha!\'');
          done();
        }
      );
    });

    it('handles request baseAmount value error', (done) => {
      let exchangeRateQuoteRequest = {
        quotes: [
          {
            baseCurrency: 'USD',
            quoteCurrency: 'EUR',
            baseAmount: '10.5433'
          },
          {
            baseCurrency: 'EUR',
            quoteCurrency: 'CAD',
            baseAmount: '10'
          }
        ]
      };

      specHelper.defaultGateway.exchangeRateQuote.generate(exchangeRateQuoteRequest,
        (err, response) => {
          assert.isNull(err);
          assert.isNotNull(response && response.errors && response.errors[0]);
          assert.equal(response.errors[0].message, 'Variable \'baseAmount\' has an invalid value : Values of type Amount must be either a whole number or a number with up to 3 decimal places.');
          done();
        }
      );
    });
  })
);
