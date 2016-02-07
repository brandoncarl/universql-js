# UniversQL

A JavaScript implementation of the [UniversQL spec](https://github.com/brandoncarl/universql).


## Installation
```
$ npm install universql
```


## Example
```js
var UniversQL = require("universql");
UniversQL.addAdapter(require("universql-json"));


```


## API

[UniversQL](#UniversQL)  
[.adapters](#UniversQL+adapters)  
[.addAdapter](#UniversQL+addAdapter) ⇒ <code>[UniversQL](#UniversQL)</code>  
[.removeAdapter](#UniversQL+removeAdapter) ⇒ <code>[UniversQL](#UniversQL)</code>  
[.getDefaultAdapter](#UniversQL+getDefaultAdapter) ⇒ <code>Adapter</code>  
[.setDefaultAdapter](#UniversQL+setDefaultAdapter) ⇒ <code>[UniversQL](#UniversQL)</code>  
[.templateRE](#UniversQL+templateRE)  
[.getAdapter([name])](#UniversQL+getAdapter) ⇒ <code>Adapter</code>  
[.setAdapter(The)](#UniversQL+setAdapter) ⇒ <code>[UniversQL](#UniversQL)</code>  
[.compile([name], [recompile])](#UniversQL+compile) ⇒ <code>\*</code>  
[.translate([name], [context])](#UniversQL+translate) ⇒ <code>\*</code>  
[.run([name], data, [context])](#UniversQL+run) ⇒ <code>\*</code>


<a name="UniversQL"></a>
### UniversQL
The UniversQL class: parses a query string and attaches to this.query.

| Param | Type | Description |
| --- | --- | --- |
| queryString | <code>String</code> | The query string to parse. |


<a name="UniversQL+adapters"></a>
### UniversQL.adapters
Adapters allow conversion between a UniversQL JSON-object, and their
  specific language. An Adapter should contain `name`, `translate` and
  optionally `run`.

  The prototypes share a common adapter list. Furthermore, we make #addAdapter
  both an Instance and Static method (to facilitate additions).

<a name="UniversQL+addAdapter"></a>
### UniversQL.addAdapter ⇒ <code>[UniversQL](#UniversQL)</code>
Adds an adapter: sets as default if no current default.

**Returns**: <code>[UniversQL](#UniversQL)</code> - The instance (for chaining).  

| Param | Type | Description |
| --- | --- | --- |
| adapter | <code>Adapter</code> | The adapter to be added. |

<a name="UniversQL+removeAdapter"></a>
### UniversQL.removeAdapter ⇒ <code>[UniversQL](#UniversQL)</code>
Removes an adapter.

**Returns**: <code>[UniversQL](#UniversQL)</code> - The adapter that was removed.  

| Param | Type | Description |
| --- | --- | --- |
| adapter | <code>Adapter</code> | The adapter to be removed. |

<a name="UniversQL+getDefaultAdapter"></a>
### UniversQL.getDefaultAdapter ⇒ <code>Adapter</code>
Gets the default adapter.

**Returns**: <code>Adapter</code> - The default adapter.  
<a name="UniversQL+setDefaultAdapter"></a>
### UniversQL.setDefaultAdapter ⇒ <code>[UniversQL](#UniversQL)</code>
Sets the default adapter.

**Returns**: <code>[UniversQL](#UniversQL)</code> - The instance (for chaining).  

| Param | Type | Description |
| --- | --- | --- |
| The | <code>Adapter</code> &#124; <code>String</code> | default adapter (or name of installed adapter). |

<a name="UniversQL+templateRE"></a>
### UniversQL.templateRE
Basic templating, inspired by doT.js. Only includes basic interpolation.

<a name="UniversQL+getAdapter"></a>
### UniversQL.getAdapter([name]) ⇒ <code>Adapter</code>
Gets the adapter.

**Returns**: <code>Adapter</code> - The adapter.  

| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>String</code> | Optional name of adapter to get. |

<a name="UniversQL+setAdapter"></a>
### UniversQL.setAdapter(The) ⇒ <code>[UniversQL](#UniversQL)</code>
Sets the adapter.

**Returns**: <code>[UniversQL](#UniversQL)</code> - The instance (for chaining).  

| Param | Type | Description |
| --- | --- | --- |
| The | <code>Adapter</code> &#124; <code>String</code> | adapter (or name of installed adapter). |

<a name="UniversQL+compile"></a>
### UniversQL.compile([name], [recompile]) ⇒ <code>\*</code>
Compiles the query into another query language. Stores into compiled.

**Returns**: <code>\*</code> - Translated form of query.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [name] | <code>String</code> |  | Name of the adapter to use (falls back to default). |
| [recompile] | <code>Boolean</code> | <code>false</code> | If true, forces re-translation. |

<a name="UniversQL+translate"></a>
### UniversQL.translate([name], [context]) ⇒ <code>\*</code>
Translate query using context (and compiles if necessary).

**Returns**: <code>\*</code> - Query with templates compiled.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [name] | <code>String</code> |  | Name of the adapter to use (falls back to default). |
| [context] | <code>Object</code> | <code>{}</code> | Context for templating. |

<a name="UniversQL+run"></a>
### UniversQL.run([name], data, [context]) ⇒ <code>\*</code>
Runs query (translates, templatizes and compiles if necessary).

**Returns**: <code>\*</code> - Query with templates compiled.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [name] | <code>String</code> |  | Name of the adapter to use (falls back to default). |
| data | <code>Array</code> |  | The data on which to run the query. |
| [context] | <code>Object</code> | <code>{}</code> | Context for templating. |

<a name="createTemplate"></a>
## createTemplate(str, pattern) ⇒ <code>function</code>
Creates a template function (that renders when called with context).

**Returns**: <code>function</code> - Template function: fn(context)  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>String</code> | The template to precompile. |
| pattern | <code>RegExp</code> | The template pattern to replace. |

<a name="templater"></a>
## templater(data, fn)
Runs data through template engine, then calls fn with results.


| Param | Type | Description |
| --- | --- | --- |
| data | <code>\*</code> | The data to preprocess. |
| fn | <code>function</code> | The subsequent function to call. |


## License
MIT Licensed
