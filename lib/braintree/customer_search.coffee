{AdvancedSearch} = require('./advanced_search')

class CustomerSearch extends AdvancedSearch
  @equalityFields "email"

exports.CustomerSearch = CustomerSearch
