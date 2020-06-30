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
(async() => {
UserScheme = {
    keyPath: "id",
    indexes: [
        {name: "id", unique: true},
        {name: "name"}
    ],
}
users = await new OctoDB("users",UserScheme)
users[0] = {name: "John"}
users[1] = {name: "Merry"}
users[2] = {name: "Jane"}
users[3] = {name: "Jack"}
})()
```

# Go!
Just use OctoDB:
```js
// Example of filtering (you can use OctoStore instead of this)

let results = []
for await (let entry of users){
  if(entry.name[0] == 'J') results.push(entry)
}
console.log(results)
```

# DB is just lazy collection
OctoDB wraps terrible and ugly IndexedDB API (sorry, W3C, it's right) to proxified simple and natural API. DB is just lazy collection!
```js
db[key] = entryObject // Set entry
await db[key] // Get entry
delete db[key] // Remove entry
for await (let entry of db) {} // Iterate entries
```

# Custom stores
OctoDB provides minimal methods for working with DB. However, I would like to have many useful methods, such as `filter`,` every`. It's not a problem.
```js
class OctoStore extends OctoDB {
    constructor(name,scheme){
        super(name,scheme)
    }
    /**
     * Filter DB and return new Array of results
     * @param {Function} fn 
     */
    async filter(fn){
        let result = []
        for await (let o of this){
            if(fn(o)) result.push(o)
        }
        return result
    }
    /**
     * Verify that all DB entries satisfy the condition 'fn'
     * @param {Function} fn 
     */
    async every(fn){
        for await (let o of this){
            if(!fn(o)) return false
        }
        return true
    }
}
```
