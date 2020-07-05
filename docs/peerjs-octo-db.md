## Classes

<dl>
<dt><a href="#PeerStore">PeerStore</a></dt>
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
db.net.channel('tags',{
 async get(_,answer){
     answer('post',(await db.all()).map(e => ({hash: e.hash, tags: e.tags})))
 },
 async post(data){
     for(let entry of data) {
         db.entries[entry.hash] = entry
     }
 }
})
```
<a name="PeerStore"></a>

## PeerStore
**Kind**: global class  

* [PeerStore](#PeerStore)
    * [new PeerStore(name, scheme, peer)](#new_PeerStore_new)
    * [net](#PeerStore.this.net) : [<code>NetAdapterObject</code>](#NetAdapterObject)

<a name="new_PeerStore_new"></a>

### new PeerStore(name, scheme, peer)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of DB |
| scheme | <code>Object</code> | Scheme Object |
| peer | <code>Peer</code> | PeerJS client |

<a name="PeerStore.this.net"></a>

### PeerStore.net : [<code>NetAdapterObject</code>](#NetAdapterObject)
net

**Kind**: static property of [<code>PeerStore</code>](#PeerStore)  
<a name="PeerJSNetAdapter"></a>

## PeerJSNetAdapter(peer) ⇒ [<code>NetAdapterObject</code>](#NetAdapterObject)
PeerJS NetAdapter.
Responsible for connecting to peers and establishing communication channels between databases

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| peer | <code>Peer</code> | PeerJS client |

