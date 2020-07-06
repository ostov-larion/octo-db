/*!
 * OctoDB v1.0.0 - github.com/ostov-larion/octo-db
 * MIT License
 * @preserve
 */
class OctoDB extends EventTarget {
    /**
     * OctoDB - Proxy wrapper for IndexedDB
     * @param {String} name Name of database
     * @param {Object} scheme SchemeObject
     * @extends EventTarget
     */
    constructor(name, scheme){
        super()
        name && (this.name = name)
        scheme && (this.scheme = scheme)
        let ctx = this
        /**
         * Proxy API for manipulating DB.
         * @type {Proxy}
         * @fires change
         * @example
         * db.entries[key] = {key: data} // Set entry
         * await db.entries[key] // Get entry
         * delete db.entries[key] // Remove entry
         * for await (let entry of db.entries) {} // Iterate entries
         */
        this.entries = new Proxy({}, {
            set: (_,key,value) => {
                ctx.beforeSet && (value = ctx.beforeSet(key,value))
                return new Promise((resolve,reject) => {
                    let store = ctx.db.transaction(ctx.name,"readwrite").objectStore(ctx.name)
                    store.put({...value,[scheme.keyPath]:key}).onsuccess = event => {
                        resolve(event.target.result)
                        ctx.dispatchEvent(change)
                    }
                    store.onerror = err => reject(err)
                })
            },
            get: (_,key) => {
                if(key == Symbol.asyncIterator) return ctx[Symbol.asyncIterator].bind(ctx)
                return new Promise((resolve,reject) => {
                    let store = ctx.db.transaction(ctx.name,"readwrite").objectStore(ctx.name)
                    store.get(key).onsuccess = event => resolve(event.target.result)
                    store.onerror = err => reject(err)
                })
            },
            deleteProperty: (_,key) => {
                ctx.beforeDelete && ctx.beforeDelete(key)
                return new Promise((resolve,reject) => {
                    let store = ctx.db.transaction(ctx.name,"readwrite").objectStore(ctx.name)
                    store.delete(key).onsuccess = event => resolve(event.target.result)
                    store.onerror = err => reject(err)
                })
            },
            has: (_,key) => {
                return proxy[key]
            }
        })
    }
    /**
     * Open DB
     * @fires open
     * @returns {Promise}
     */
    open(){
        return new Promise( (resolve,reject) => {
            let request = indexedDB.open("OctoDB/"+this.name,1)
            request.onupgradeneeded = event => {
                this.created = true
                let db =  event.target.result
                let store = db.createObjectStore(this.name,{keyPath: this.scheme.keyPath})
                for(let index of this.scheme.indexes){
                    store.createIndex(index.name, index.name,{unique: index.unique})
                }
                this.db = db
                this.dispatchEvent(open)
                resolve(this)
            }
            request.onsuccess = event => {
                if(this.created) return
                this.db = event.target.result
                this.dispatchEvent(open)
                resolve(this)
            }
            request.onerror = () => {
                reject(request.error)
            }
        })
    }
    // I spent VERY much time to do this magic
    // Do not even try to understand how it works. I myself did not fully understand this.
    [Symbol.asyncIterator](){
        console.log(this.name)
        let store = this.db.transaction(this.name,"readwrite").objectStore(this.name)
        let reqCursor = store.openCursor()
        let iterationPromise = (reqCursor) => 
            new Promise(resolve => reqCursor.onsuccess = (event) => {
                let cursor = event.target.result
                resolve([cursor,iterationPromise(reqCursor)])
            })
        let promise = iterationPromise(reqCursor)
        return {
            async next(){
                let [cursor, nextPromise] = await promise;
                promise = nextPromise;
                if (cursor) {
                    cursor.continue();
                    return Promise.resolve({done: false, value: cursor.value});
                } else {
                    return Promise.resolve({done: true, value: null});
                }
            }
        }
    }
}

let open = new Event("open")
let change = new Event("change")
let onconnection = new Event("onconnection")

// It's beautiful...
class OctoStore extends OctoDB {
    /**
     * Useful add-on for OctoDB.
     * @param {String} name Name of database
     * @param {Object} scheme SchemeObject
     * @extends OctoDB
     */
    constructor(name,scheme){
        super(name,scheme)
    }
    /**
     * Filter DB and return new Array of results.
     * @param {Function} fn
     * @example users.filter(e => e.name[0] == 'J') // Get records of all users whose name begins with "J"
     */
    async filter(fn){
        let result = []
        for await (let o of this.entries){
            if(fn(o)) result.push(o)
        }
        return result
    }
    /**
     * Verify that all DB entries satisfy the condition 'fn'.
     * @param {Function} fn 
     * @example users.every(e => e.name[0] == 'J') // Check if all users have a name starting with "J"
     */
    async every(fn){
        for await (let o of this.entries){
            if(!fn(o)) return false
        }
        return true
    }
    /**
     * Slice DB.
     * 
     * Useful for pagination.
     * @param {Number} start
     * @param {Number} end
     * @example users.slice(0,10) // Get the first 10 entries
     */
    async slice(start,end){
        let result = []
        let i = 0
        for await (let entry of this.entries){
            if(i >= start && i <= end){
                result.push(entry)
            }
            if(i == end){
                break;
            }
        }
        return result
    }
    /**
     * ! Don't use, if DB is large !
     * 
     * Get all entries.
     */
    async all(){
        let result = []
        for await (let entry of this.entries){
            result.push(entry)
        }
        return result
    }
    /**
     * ! This method mutate DB !
     * 
     * Concat DB with the array.
     * @param {Array} array Array of entries
     */
    async concat(array){
        for(let o of array){
            await (this.entries[o[this.scheme.keyPath]] = o)
        }
    }
    /**
     * OctoStore transaction.
     * @param {Function} fn
     * @example db.transaction(db => { db.entries['foo'] = {name: 'foo'}; db.entries['bar'] = {name: 'bar'}})
     */
    async transaction(fn){
        let pseudoDB = Object.assign({},this)
        try{
            await fn(pseudoDB)
        }
        catch(e){
            throw e
        }
        await fn(this)
    }
}