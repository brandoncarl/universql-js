
_ = require("../lib/lodash.custom");

module.exports = {
  name: "json",
  compile: compile,
  run: run
};



function compile(universalQuery, templater) {

  var query = {};

  // Process sorts: sorts are given in {key, val} but need to be in arrays for lodash
  if (universalQuery.filters && universalQuery.filters.length)
    query.filters = templater(universalQuery.filters, filtersToLodash);

  if (universalQuery.sort && universalQuery.sort.length)
    query.sort = templater(universalQuery.sort, sortsToLodash);

  if (universalQuery.fields && universalQuery.fields.length)
    query.fields = templater(universalQuery.fields, fieldsToLodash);

  if (universalQuery.limit)
    query.limit = templater(universalQuery.limit, limitToLodash);

  return function(context) {
    return {
      filters : (query.filters) ? query.filters(context) : null,
      sort    : (query.sort) ? query.sort(context) : null,
      fields  : (query.fields) ? query.fields(context) : null,
      limit   : (query.limit) ? query.limit(context) : null
    };
  };

}


function run(query, data, next) {

  var chain = _(data),
      tmp;

  // Ensure we have an array of data
  if (!Array.isArray(data)) throw new Error("Data must be an array")

  // Surprisingly, sorting first offers speed improvement
  if (query.sort)
    chain = chain.orderBy(query.sort.keys, query.sort.orders);

  if (query.filters)
    chain = chain.filter(query.filters);

  if (query.limit)
    chain = (query.limit >= 0) ? chain.take(query.limit) : chain.takeRight(-query.limit);

  // Map last! (most processor intensive)
  if (query.fields)
    chain = chain.map(query.fields);

  next(null, chain.value());

};


function sortsToLodash(sorts) {

  var hasVars = false,
      keys    = new Array(sorts.length),
      vals    = new Array(sorts.length);

  for (var i = 0, n = sorts.length; i < n; i++) {
    keys[i] = sorts[i].key;
    vals[i] = sorts[i].order;
  }

  return { keys : keys, orders : vals }

}


function limitToLodash(limit) {
  return parseInt(limit);
}


function fieldsToLodash(fields) {
  var n = fields.length;
  return function(x) {
    var obj = {};
    for (var i = 0; i < n; i++)
      _.set(obj, fields[i], _.get(x, fields[i]));
    return obj;
  }
}


function filtersToLodash(filters) {

  // Create a string representing the function and then assemble into new function
  var fn = "",
      filter,
      keys  = [],
      vars  = [],
      stack = [];

  // Create filter logic (we use a stack to evaluate the RPN)
  for (var i = 0, n = filters.length; i < n; i++) {
    filter = filters[i];

    // Statement
    if ("object" == typeof filter) {

      // We store mapping between in-function variables ($Vx) and data values
      // in order to create a function
      keys.push(filter.key);
      vars.push("$V" + i);

      if ("~" === filter.comparator)
        fn += "var $" + i + "=" + filter.value + ".test($V" + i + ");"
      else
        fn += "var $" + i + "=($V" + i + (("=" === filter.comparator) ? "==" : filter.comparator) + filter.value + ");";

    // Operator
    } else {

      // We allow "&" or "&&" for AND. Similar for OR. Must convert first.
      if (1 === filter.length) filter = filter + filter;

      if (1 === stack.length)
        fn += "var $" + i + "=" + stack.pop() + ";"
      else
        fn += "var $" + i + "=(" + stack.pop() + filter + stack.pop() + ");"

    }

    stack.push("$" + i);
  }

  fn += "return $" + (i-1) + ";"

  // Overload the function
  fn = Function.apply(null, vars.concat(fn));

  return function(x) {
    var args = _.map(keys, function(key) { return _.get(x, key); });
    return fn.apply(null, args);
  };

}
