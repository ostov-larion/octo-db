## Classes

<dl>
<dt><a href="#OctoDB">OctoDB</a></dt>
<dd></dd>
<dt><a href="#OctoStore">OctoStore</a> ⇐ <code><a href="#OctoDB">OctoDB</a></code></dt>
<dd></dd>
<dt><a href="#PeerStore">PeerStore</a> ⇐ <code><a href="#OctoStore">OctoStore</a></code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#PeerJSNetAdapter">PeerJSNetAdapter(peer)</a> ⇒ <code><a href="#NetAdapterObject">NetAdapterObject</a></code></dt>
<dd><p>PeerJS NetAdapter.
Responsible for connecting to peers and establishing communication channels between databases</p>
</dd>
</dl>

## Interfaces

<dl>
<dt><a href="#NetAdapterObject">NetAdapterObject</a></dt>
<dd></dd>
</dl>

<a name="NetAdapterObject"></a>

## NetAdapterObject
**Kind**: global interface  

* [NetAdapterObject](#NetAdapterObject)
    * [.connect()](#NetAdapterObject.connect)
    * [.broadcast(header, method, [data])](#NetAdapterObject.broadcast)
    * [.channel(header, methods)](#NetAdapterObject.channel)

<a name="NetAdapterObject.connect"></a>

### NetAdapterObject.connect()
Connect to other peers

**Kind**: static method of [<code>NetAdapterObject</code>](#NetAdapterObject)  
<a name="NetAdapterObject.broadcast"></a>

### NetAdapterObject.broadcast(header, method, [data])
Broadcast message to other peers

**Kind**: static method of [<code>NetAdapterObject</code>](#NetAdapterObject)  

| Param | Type | Description |
| --- | --- | --- |
| header | <code>String</code> | Name of channel |
| method | <code>String</code> | Name of method (usually 'get' or 'post') |
| [data] | <code>Object</code> | Any object |

**Example**  
```js
db.broadcast('tags','get')
```
<a name="NetAdapterObject.channel"></a>

### NetAdapterObject.channel(header, methods)
Create channel

**Kind**: static method of [<code>NetAdapterObject</code>](#NetAdapterObject)  

| Param | Type | Description |
| --- | --- | --- |
| header | <code>String</code> | Name of channel |
| methods | <code>Object</code> | Methods of NetAdapter |

**Example**  
```js
db.net.channel('tags',{ async get(_,answer){     answer('post',(await db.all()).map(e => ({hash: e.hash, tags: e.tags}))) }, async post(data){     for(let entry of data) {         db.entries[entry.hash] = entry     } }})
```
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
db.entries[key] = {key: data} // Set entryawait db.entries[key] // Get entrydelete db.entries[key] // Remove entryfor await (let entry of db.entries) {} // Iterate entries
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
db.entries[key] = {key: data} // Set entryawait db.entries[key] // Get entrydelete db.entries[key] // Remove entryfor await (let entry of db.entries) {} // Iterate entries
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
Slice DB.Useful for pagination.

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
! Don't use, if DB is large !Get all entries.

**Kind**: instance method of [<code>OctoStore</code>](#OctoStore)  
<a name="OctoStore+concat"></a>

### octoStore.concat(array)
! This method mutate DB !Concat DB with the array.

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
<a name="PeerStore"></a>

## PeerStore ⇐ [<code>OctoStore</code>](#OctoStore)
**Kind**: global class  
**Extends**: [<code>OctoStore</code>](#OctoStore)  

* [PeerStore](#PeerStore) ⇐ [<code>OctoStore</code>](#OctoStore)
    * [new PeerStore(name, scheme, peer)](#new_PeerStore_new)
    * _instance_
        * [.entries](#OctoDB+entries) : <code>Proxy</code>
        * [.filter(fn)](#OctoStore+filter)
        * [.every(fn)](#OctoStore+every)
        * [.slice(start, end)](#OctoStore+slice)
        * [.all()](#OctoStore+all)
        * [.concat(array)](#OctoStore+concat)
        * [.transaction(fn)](#OctoStore+transaction)
        * [.open()](#OctoDB+open) ⇒ <code>Promise</code>
    * _static_
        * [.this.net](#PeerStore.this.net) : [<code>NetAdapterObject</code>](#NetAdapterObject)

<a name="new_PeerStore_new"></a>

### new PeerStore(name, scheme, peer)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of DB |
| scheme | <code>Object</code> | Scheme Object |
| peer | <code>Peer</code> | PeerJS client |

<a name="OctoDB+entries"></a>

### peerStore.entries : <code>Proxy</code>
Proxy API for manipulating DB.

**Kind**: instance property of [<code>PeerStore</code>](#PeerStore)  
**Example**  
```js
db.entries[key] = {key: data} // Set entryawait db.entries[key] // Get entrydelete db.entries[key] // Remove entryfor await (let entry of db.entries) {} // Iterate entries
```
<a name="OctoStore+filter"></a>

### peerStore.filter(fn)
Filter DB and return new Array of results.

**Kind**: instance method of [<code>PeerStore</code>](#PeerStore)  

| Param | Type |
| --- | --- |
| fn | <code>function</code> | 

**Example**  
```js
users.filter(e => e.name[0] == 'J') // Get records of all users whose name begins with "J"
```
<a name="OctoStore+every"></a>

### peerStore.every(fn)
Verify that all DB entries satisfy the condition 'fn'.

**Kind**: instance method of [<code>PeerStore</code>](#PeerStore)  

| Param | Type |
| --- | --- |
| fn | <code>function</code> | 

**Example**  
```js
users.every(e => e.name[0] == 'J') // Check if all users have a name starting with "J"
```
<a name="OctoStore+slice"></a>

### peerStore.slice(start, end)
Slice DB.Useful for pagination.

**Kind**: instance method of [<code>PeerStore</code>](#PeerStore)  

| Param | Type |
| --- | --- |
| start | <code>Number</code> | 
| end | <code>Number</code> | 

**Example**  
```js
users.slice(0,10) // Get the first 10 entries
```
<a name="OctoStore+all"></a>

### peerStore.all()
! Don't use, if DB is large !Get all entries.

**Kind**: instance method of [<code>PeerStore</code>](#PeerStore)  
<a name="OctoStore+concat"></a>

### peerStore.concat(array)
! This method mutate DB !Concat DB with the array.

**Kind**: instance method of [<code>PeerStore</code>](#PeerStore)  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>Array</code> | Array of entries |

<a name="OctoStore+transaction"></a>

### peerStore.transaction(fn)
OctoStore transaction.

**Kind**: instance method of [<code>PeerStore</code>](#PeerStore)  

| Param | Type |
| --- | --- |
| fn | <code>function</code> | 

**Example**  
```js
db.transaction(db => { db.entries['foo'] = {name: 'foo'}; db.entries['bar'] = {name: 'bar'}})
```
<a name="OctoDB+open"></a>

### peerStore.open() ⇒ <code>Promise</code>
Open DB

**Kind**: instance method of [<code>PeerStore</code>](#PeerStore)  
<a name="PeerStore.this.net"></a>

### PeerStore.this.net : [<code>NetAdapterObject</code>](#NetAdapterObject)
net

**Kind**: static property of [<code>PeerStore</code>](#PeerStore)  
<a name="PeerJSNetAdapter"></a>

## PeerJSNetAdapter(peer) ⇒ [<code>NetAdapterObject</code>](#NetAdapterObject)
PeerJS NetAdapter.Responsible for connecting to peers and establishing communication channels between databases

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| peer | <code>Peer</code> | PeerJS client |

