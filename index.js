/**

  UniversQL
  Copyright 2016 Brandon Carl
  MIT Licensed

  Static methods:
  • addAdapter
  • getDefaultAdapter
  • removeAdapter
  • setDefaultAdapter

  Instance methods:
  • addAdapter
  • compile
  • getAdapter
  • getDefaultAdapter
  • removeAdapter
  • run
  • setAdapter
  • setDefaultAdapter
  • translate

**/

"use strict";


//
//  Dependencies
//

var Query = require("./lib/query");


/**

  The UniversQL class: parses a query string and attaches to this.query.

  @param {String} queryString The query string to parse.

**/

var UniversQL = module.exports = function(queryString) {
  this.queryString = queryString;
  this.query = new Query(queryString);
  this.compiled = {};

  // this.translation

};



/**

  Adapters allow conversion between a UniversQL JSON-object, and their
  specific language. An Adapter should contain `name`, `translate` and
  optionally `run`.

  The prototypes share a common adapter list. Furthermore, we make #addAdapter
  both an Instance and Static method (to facilitate additions).

**/

UniversQL.prototype.adapters = {};


/**

  Adds an adapter: sets as default if no current default.

  @param {Adapter} adapter The adapter to be added.
  @returns {UniversQL} The instance (for chaining).

**/

UniversQL.prototype.addAdapter = UniversQL.addAdapter = function(adapter) {

  if (!adapter || !adapter.compile || !adapter.name)
    throw new Error("Your adapter is malformed (missing name or translate function)");

  UniversQL.prototype.adapters[adapter.name] = adapter;

  // Set as default if no default is in place
  if (!this.getDefaultAdapter()) this.setDefaultAdapter(adapter.name);

  return this;

};



/**

  Removes an adapter.

  @param {Adapter} adapter The adapter to be removed.
  @returns {UniversQL} The adapter that was removed.

**/

UniversQL.prototype.removeAdapter = UniversQL.removeAdapter = function(adapter) {

  // Throw error if currently default
  if (adapter === UniversQL.prototype.defaultAdapter)
    throw new Error(adapter + " is set as the default adapter. Please unset it first.");

  adapter = UniversQL.prototype.adapters[adapter];
  delete UniversQL.prototype.adapters[adapter];

  return adapter;

};



/**

  Gets the default adapter.

  @returns {Adapter} The default adapter.

**/

UniversQL.prototype.getDefaultAdapter = UniversQL.getDefaultAdapter = function() {

  return UniversQL.prototype.defaultAdapter;

};



/**

  Sets the default adapter.

  @param {Adapter|String} The default adapter (or name of installed adapter).
  @returns {UniversQL} The instance (for chaining).

**/

UniversQL.prototype.setDefaultAdapter = UniversQL.setDefaultAdapter = function(adapter) {

  if ("string" === typeof adapter) {
    adapter = UniversQL.prototype.adapters[adapter];
    if (!adapter) throw new Error("Adapter " + adapter + " hasn't been installed");
  }

  UniversQL.prototype.defaultAdapter = adapter;

  return this;

};



/**

  Gets the adapter.

  @param {String} [name] Optional name of adapter to get.
  @returns {Adapter} The adapter.

**/

UniversQL.prototype.getAdapter = function(name) {

  if (name) return this.adapters[name];
  return this.adapter || this.defaultAdapter;

};



/**

  Sets the adapter.

  @param {Adapter|String} The adapter (or name of installed adapter).
  @returns {UniversQL} The instance (for chaining).

**/

UniversQL.prototype.setAdapter = function(adapter) {

  if ("string" === typeof adapter) {
    adapter = this.adapters[adapter];
    if (!adapter) throw new Error("Adapter " + adapter + " hasn't been installed");
  }

  this.adapter = adapter;

  return this;

};



/**

  Compiles the query into another query language. Stores into compiled.

  @param {String} [name] Name of the adapter to use (falls back to default).
  @param {Boolean} [recompile=false] If true, forces re-translation.
  @returns {*} Translated form of query.

**/

UniversQL.prototype.compile = function(name, recompile) {

  var adapter = this.adapters[name] || this.getAdapter();

  // Return if already translated
  if (this.compiled[adapter.name] && !recompile)
    return this.compiled[adapter.name];

  if (!adapter) throw new Error("No working adapter has been specified");

  this.compiled[adapter.name] = adapter.compile(this.query, templater(this.templateRE));

  return this.compiled[adapter.name];

};




/**

  Translate query using context (and compiles if necessary).

  @param {String} [name] Name of the adapter to use (falls back to default).
  @param {Object} [context={}] Context for templating.
  @returns {*} Query with templates compiled.

**/

UniversQL.prototype.translate = function(name, context) {

  // Allow polymorphism
  if ("object" === typeof name) {
    context = name;
    name = null;
  }

  return this.compile(name)(context || {});

};



/**

  Runs query (translates, templatizes and compiles if necessary).

  @param {String} [name] Name of the adapter to use (falls back to default).
  @param {Array} data The data on which to run the query.
  @param {Object} [context={}] Context for templating.
  @returns {*} Query with templates compiled.

**/

UniversQL.prototype.run = function(name, data, context, next) {

  var adapter;

  // Allow polymorphism
  if ("string" !== typeof name) {
    next = context;
    context = data;
    data = name;
  }

  if ("function" === typeof context) {
    next = context;
    context = {};
  }

  // Defaults
  context = context || {};

  this.getAdapter(name).run(this.translate(name, context), data, next);

};



/**

  Basic templating, inspired by doT.js. Only includes basic interpolation.

**/

UniversQL.prototype.templateRE = /\{\{([\s\S]+?)\}\}/g;

/**

  Creates a template function (that renders when called with context).

  @param {String} str The template to precompile.
  @param {RegExp} pattern The template pattern to replace.
  @returns {Function} Template function: fn(context)

**/

function createTemplate(template, pattern) {
  var str = "context = context || {}; var out ='" + template.replace(pattern, function(match, code) {
        return "'+(context[\"" + code.trim() + "\"])+'";
      });
  return new Function("context", str + "';return out;");
}


/**

  Runs data through template engine, then calls fn with results.

  @param {*} data The data to preprocess.
  @param {Function} fn The subsequent function to call.

**/

function templater(regex) {
  return function(data, fn) {
    var str = JSON.stringify(data),
        tpl,
        out;

    // Set function default
    fn = fn || function(x) { return x; };

    if (regex.test(str)) {
      tpl = createTemplate(str, regex);
      return function(context) {
        return fn(JSON.parse(tpl(context || {})));
      };
    } else {
      out = fn(data);
      return function() { return out; };
    }
  };
}
