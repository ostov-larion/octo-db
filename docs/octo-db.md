## Classes

<dl>
<dt><a href="#OctoDB">OctoDB</a></dt>
<dd></dd>
<dt><a href="#OctoStore">OctoStore</a> ⇐ <code><a href="#OctoDB">OctoDB</a></code></dt>
<dd></dd>
</dl>

<a name="OctoDB"></a>

## OctoDB
**Kind**: global class  

* [OctoDB](#OctoDB)
    * [new OctoDB(name, scheme)](#new_OctoDB_new)
    * [.entries](#OctoDB+entries) : <code>Proxy</code>
    * [.open()](#OctoDB+open) ⇒ <code>Promise</code>

<a name="new_OctoDB_new"></a>

### new OctoDB(name, scheme)
OctoDB - Proxy wrapper for IndexedDB


| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of database |
| scheme | <code>Object</code> | SchemeObject |

<a name="OctoDB+entries"></a>

### octoDB.entries : <code>Proxy</code>
Proxy API for manipulating DB.

**Kind**: instance property of [<code>OctoDB</code>](#OctoDB)  
**Example**  
```js
db.entries[key] = {key: data} // Set entry
```
<a name="OctoDB+open"></a>

### octoDB.open() ⇒ <code>Promise</code>
Open DB

**Kind**: instance method of [<code>OctoDB</code>](#OctoDB)  
<a name="OctoStore"></a>

## OctoStore ⇐ [<code>OctoDB</code>](#OctoDB)
**Kind**: global class  
**Extends**: [<code>OctoDB</code>](#OctoDB)  

* [OctoStore](#OctoStore) ⇐ [<code>OctoDB</code>](#OctoDB)
    * [new OctoStore(name, scheme)](#new_OctoStore_new)
    * [.entries](#OctoDB+entries) : <code>Proxy</code>
    * [.filter(fn)](#OctoStore+filter)
    * [.every(fn)](#OctoStore+every)
    * [.slice(start, end)](#OctoStore+slice)
    * [.all()](#OctoStore+all)
    * [.concat(array)](#OctoStore+concat)
    * [.transaction(fn)](#OctoStore+transaction)
    * [.open()](#OctoDB+open) ⇒ <code>Promise</code>

<a name="new_OctoStore_new"></a>

### new OctoStore(name, scheme)
Useful add-on for OctoDB.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of database |
| scheme | <code>Object</code> | SchemeObject |

<a name="OctoDB+entries"></a>

### octoStore.entries : <code>Proxy</code>
Proxy API for manipulating DB.

**Kind**: instance property of [<code>OctoStore</code>](#OctoStore)  
**Example**  
```js
db.entries[key] = {key: data} // Set entry
```
<a name="OctoStore+filter"></a>

### octoStore.filter(fn)
Filter DB and return new Array of results.

**Kind**: instance method of [<code>OctoStore</code>](#OctoStore)  

| Param | Type |
| --- | --- |
| fn | <code>function</code> | 

**Example**  
```js
users.filter(e => e.name[0] == 'J') // Get records of all users whose name begins with "J"
```
<a name="OctoStore+every"></a>

### octoStore.every(fn)
Verify that all DB entries satisfy the condition 'fn'.

**Kind**: instance method of [<code>OctoStore</code>](#OctoStore)  

| Param | Type |
| --- | --- |
| fn | <code>function</code> | 

**Example**  
```js
users.every(e => e.name[0] == 'J') // Check if all users have a name starting with "J"
```
<a name="OctoStore+slice"></a>

### octoStore.slice(start, end)
Slice DB.

**Kind**: instance method of [<code>OctoStore</code>](#OctoStore)  

| Param | Type |
| --- | --- |
| start | <code>Number</code> | 
| end | <code>Number</code> | 

**Example**  
```js
users.slice(0,10) // Get the first 10 entries
```
<a name="OctoStore+all"></a>

### octoStore.all()
! Don't use, if DB is large !

**Kind**: instance method of [<code>OctoStore</code>](#OctoStore)  
<a name="OctoStore+concat"></a>

### octoStore.concat(array)
! This method mutate DB !

**Kind**: instance method of [<code>OctoStore</code>](#OctoStore)  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>Array</code> | Array of entries |

<a name="OctoStore+transaction"></a>

### octoStore.transaction(fn)
OctoStore transaction.

**Kind**: instance method of [<code>OctoStore</code>](#OctoStore)  

| Param | Type |
| --- | --- |
| fn | <code>function</code> | 

**Example**  
```js
db.transaction(db => { db.entries['foo'] = {name: 'foo'}; db.entries['bar'] = {name: 'bar'}})
```
<a name="OctoDB+open"></a>

### octoStore.open() ⇒ <code>Promise</code>
Open DB

**Kind**: instance method of [<code>OctoStore</code>](#OctoStore)  