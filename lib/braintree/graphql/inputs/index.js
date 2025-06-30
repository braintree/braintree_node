"use strict";
const CreateCustomerSessionInput = require("./create_customer_session_input");
const CustomerRecommendationsInput = require("./customer_recommendations_input");
const CustomerSessionInput = require("./customer_session_input");
const MonetaryAmountInput = require("./monetary_amount_input");
const PayPalPayeeInput = require("./paypal_payee_input");
const PayPalPurchaseUnitInput = require("./paypal_purchase_unit_input");
const PhoneInput = require("./phone_input");
const UpdateCustomerSessionInput = require("./update_customer_session_input");

module.exports = {
  CreateCustomerSessionInput,
  UpdateCustomerSessionInput,
  CustomerRecommendationsInput,
  CustomerSessionInput,
  MonetaryAmountInput,
  PayPalPayeeInput,
  PayPalPurchaseUnitInput,
  PhoneInput,
};
