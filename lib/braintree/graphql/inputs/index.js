"use strict";
const BillingAddressInput = require("./billing_address_input");
const CreateCustomerSessionInput = require("./create_customer_session_input");
const CreateLocalPaymentContextInput = require("./create_local_payment_context_input");
const CustomerRecommendationsInput = require("./customer_recommendations_input");
const CustomerSessionInput = require("./customer_session_input");
const MonetaryAmountInput = require("./monetary_amount_input");
const PayerInfoInput = require("./payer_info_input");
const PayPalPayeeInput = require("./paypal_payee_input");
const PayPalPurchaseUnitInput = require("./paypal_purchase_unit_input");
const PhoneInput = require("./phone_input");
const ShippingAddressInput = require("./shipping_address_input");
const UpdateCustomerSessionInput = require("./update_customer_session_input");

module.exports = {
  BillingAddressInput,
  CreateCustomerSessionInput,
  CreateLocalPaymentContextInput,
  UpdateCustomerSessionInput,
  CustomerRecommendationsInput,
  CustomerSessionInput,
  MonetaryAmountInput,
  PayerInfoInput,
  PayPalPayeeInput,
  PayPalPurchaseUnitInput,
  PhoneInput,
  ShippingAddressInput,
};
