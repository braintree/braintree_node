## 1.6.0

* Adds channel field to transactions.

## 1.5.0

* Adds country of issuance and issuing bank

## 1.4.0

* Adds verification search

## 1.3.0

* Additional card information, such as prepaid, debit, commercial, Durbin regulated, healthcare, and payroll, are returned on credit card responses
* Allows transactions to be specified as recurring

## 1.2.0

* Add prepaid field to credit card (possible values include Yes, No, Unknown)

## 1.1.2
* Compatibility with Node 0.8.x

## 1.1.1
* Fix dateFormat bug with months after October in CreditCardGateway
* Fix TransparentRedirecteGateway url method to return full url (thanks to [sberryman](https://github.com/sberryman))

## 1.1.0

* Add webhook gateways for parsing, verifying, and testing incoming notifications
* Use util.log instead of sys.puts for logging
* Add underscore as a dependency
* Allow failing on credit card creation if a duplicate card already exists

## 1.0.0

* Add search functionality

## 0.5.1

* Exposes plan_id on transactions

## 0.5.0

* Update to be compatible with Node 0.6.6 and replace o3-xml with xml2js (special thanks to [thepatrick](https://github.com/thepatrick))
