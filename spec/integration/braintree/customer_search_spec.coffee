require("../../spec_helper")

describe "CustomerSearch", ->
  describe "search", ->
    lastName = null

    before (done) ->
      lastName = specHelper.randomId()
      specHelper.defaultGateway.customer.create {firstName: 'Bob', lastName: lastName}, (err, response) ->
        specHelper.defaultGateway.customer.create {firstName: 'Ryan', lastName: lastName}, (err, response) ->
          done()

    it "can return no results", (done) ->
      specHelper.defaultGateway.customer.search ((search) -> search.email().is(specHelper.randomId() + "@example.com")), (err, response) ->
        assert.isNull(err)
        assert.equal(response.length(), 0)

        done()

    it "can return a single result", (done) ->
      search = (search) ->
        search.firstName().is("Bob")
        search.lastName().is(lastName)

      specHelper.defaultGateway.customer.search search, (err, response) ->
        response.first (err, customer) ->
          assert.equal(customer.firstName, 'Bob')
          assert.equal(customer.lastName, lastName)

          done()

    it "allows stream style interation of results", (done) ->
      search = specHelper.defaultGateway.customer.search (search) ->
        search.lastName().is(lastName)

      customers = []

      search.on 'data', (customer) ->
        customers.push customer

      search.on 'end', ->
        assert.equal(customers.length, 2)
        assert.equal(customers[0].lastName, lastName)
        assert.equal(customers[1].lastName, lastName)

        done()

      search.resume()

    it "can return multiple results", (done) ->
      specHelper.defaultGateway.customer.search ((search) -> search.lastName().is(lastName)), (err, response) ->
        customers = []
        response.each (err, customer) ->
          customers.push customer

          if customers.length == 2
            assert.equal(customers.length, 2)
            assert.equal(customers[0].lastName, lastName)
            assert.equal(customers[1].lastName, lastName)

            done()

    it "handles complex searches", (done) ->
      id = specHelper.randomId()
      email = "#{specHelper.randomId()}@example.com"
      firstName = "John_#{specHelper.randomId()}"
      lastName = "Smith_#{specHelper.randomId()}"
      cardToken = "card_#{specHelper.randomId()}"

      customerParams =
        company: "Braintree"
        email: email
        fax: "(123)456-7890"
        firstName: firstName
        id: id
        lastName: lastName
        phone: "(456)123-7890"
        website: "http://www.example.com/"
        creditCard:
          number: "5105105105105100"
          expirationDate: "05/2012"
          cardholderName: "#{firstName} #{lastName}"
          token: cardToken
          billingAddress:
            firstName: firstName
            lastName: lastName
            streetAddress: "123 Fake St"
            extendedAddress: "Suite 403"
            locality: "Chicago"
            region: "IL"
            postalCode: "60607"
            countryName: "United States of America"

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        textCriteria =
          addressCountryName: "United States of America"
          addressExtendedAddress: "Suite 403"
          addressFirstName: firstName
          addressLastName: lastName
          addressLocality: "Chicago"
          addressPostalCode: "60607"
          addressStreetAddress: "123 Fake St"
          cardholderName: "#{firstName} #{lastName}"
          company: "Braintree"
          email: email
          fax: "(123)456-7890"
          firstName: firstName
          id: id
          lastName: lastName
          paymentMethodToken: cardToken
          phone: "(456)123-7890"
          website: "http://www.example.com/"

        equalityCriteria =
          creditCardExpirationDate: "05/2012"

        partialCriteria =
          creditCardNumber:
            startsWith: "5105"
            endsWith: "100"

        multipleValueCriteria =
          ids: customerParams.id

        today = new Date()
        yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
        tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1)

        rangeCriteria =
          createdAt:
            min: yesterday
            max: tomorrow

        search = (search) ->
          for criteria, value of textCriteria
            search[criteria]().is(value)

          for criteria, value of equalityCriteria
            search[criteria]().is(value)

          for criteria, partial of partialCriteria
            for operator, value of partial
              search[criteria]()[operator](value)

          for criteria, value of multipleValueCriteria
            search[criteria]().is(value)

          for criteria, range of rangeCriteria
            for operator, value of range
              search[criteria]()[operator](value)

        specHelper.defaultGateway.customer.search search, (err, response) ->
          assert.isTrue(response.success)
          assert.equal(response.length(), 1)

          response.first (err, customer) ->
            assert.isObject(customer)
            assert.equal(customer.id, customerParams.id)
            assert.isNull(err)

            done()
