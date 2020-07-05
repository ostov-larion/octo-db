# octo-db
OctoDB - Destributed. Simple. Beautiful.

# Ready!
Connect this library to your project:
```html
<script src="octo-db.js"></script>
<script src="main.js"></script>
```

# Set!
Create DB and fill it:
```js
// main.js
(async() => {
UserScheme = {
    keyPath: "id",
    indexes: [
        {name: "id", unique: true},
        {name: "name"}
    ],
}
users = new OctoDB("users",UserScheme)
await users.open()
users.entries[0] = {name: "John"}
users.entries[1] = {name: "Merry"}
users.entries[2] = {name: "Jane"}
users.entries[3] = {name: "Jack"}
})()
```

# Go!
Just use OctoDB:
```js
// Example of filtering (you can use OctoStore instead of this)

let results = []
for await (let entry of users.entries){
  if(entry.name[0] == 'J') results.push(entry)
}
console.log(results)
```

# DB is just lazy collection
OctoDB wraps terrible and ugly IndexedDB API (sorry, W3C, it's right) to proxified simple and natural API. DB is just lazy collection!
```js
db.entries[key] = entryObject // Set entry
await db.entries[key] // Get entry
delete db.entries[key] // Remove entry
for await (let entry of db.entries) {} // Iterate entries
```

# Custom stores
OctoDB provides minimal methods for working with DB. However, I would like to have many useful methods, such as `filter`,` every`. It's not a problem.
```js
class OctoStore extends OctoDB {
    constructor(name,scheme) {
        super(name,scheme)
    }
    /**
     * Filter DB and return new Array of results
     * @param {Function} fn 
     */
    async filter(fn) {
        let result = []
        for await (let entry of this.entries) {
            if(fn(entry)) result.push(entry)
        }
        return result
    }
    /**
     * Verify that all DB entries satisfy the condition 'fn'
     * @param {Function} fn 
     */
    async every(fn) {
        for await (let entry of this.entries) {
            if(!fn(entry)) return false
        }
        return true
    }
}
```

# Transactions?
You are not required to use transactions. However, this can be very useful, and even necessary. OctoStore provides an adequate and obvious transaction interface.
```js
// Case 1: Error, and discard all changes
await users.transaction(async(db) => {db[3] = {name: 'Jack'}; throw Error('ERROR!')}) // The scary "Uncaught Error: ERROR!" should appear in the console, but nothing bad happened to your DB

// Case 2: No errors, normal flight
await users.transaction(async(db) => {db[3] = {name: 'Jack'}}) // Jack has now arrived at your database
```
# Distribution
OctoDB can be distributed across multiple clients. It uses NetAdapters to transfer DB between clients. This repository provides PeerJS NetAdapter (documentation later).
```js
peer = new Peer()
users = new PeerStore("users", UserScheme, peer)
await users.open()
users.net.channel('db', {
    async get(_, answer) {                 // Someone asks for DB
        answer('post', await users.all()) // Send him
    },
    async post(data) {      // Someone sent a DB
        users.concat(data) // Combine the sent data with our DB
    }
})
```
