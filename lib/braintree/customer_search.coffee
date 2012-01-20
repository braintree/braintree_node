{AdvancedSearch} = require('./advanced_search')

class CustomerSearch extends AdvancedSearch
  @textFields "email", "lastName", "firstName"

exports.CustomerSearch = CustomerSearch
