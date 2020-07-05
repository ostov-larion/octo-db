class OctoDB {
    /**
     * OctoDB - Proxy wrapper for IDB, which syncs!
     * @param {String} name 
     * @param {Object} scheme 
     */
    constructor(name, scheme){
        name && (this.name = name)
        scheme && (this.scheme = scheme)
        this.entries = new Proxy({}, {
            set: (target,key,value) => {
                if(target[key]) return target[key] = value
                this.beforeSet && (value = this.beforeSet(key,value))
                return new Promise((resolve,reject) => {
                    let store = this.db.transaction(this.name,"readwrite").objectStore(this.name)
                    store.put({...value,[scheme.keyPath]:key}).onsuccess = event => resolve(event.target.result)
                    store.onerror = err => reject(err)
                })
            },
            get: (target,key) => {
                if(target[key]) return target[key]
                return new Promise((resolve,reject) => {
                    let store = this.db.transaction(this.name,"readwrite").objectStore(this.name)
                    store.get(key).onsuccess = event => resolve(event.target.result)
                    store.onerror = err => reject(err)
                })
            },
            deleteProperty: (_,key) => {
                this.beforeDelete && this.beforeDelete(key)
                return new Promise((resolve,reject) => {
                    let store = this.db.transaction(this.name,"readwrite").objectStore(this.name)
                    store.delete(key).onsuccess = event => resolve(event.target.result)
                    store.onerror = err => reject(err)
                })
            },
            has: (_,key) => {
                return proxy[key]
            }
        })
    }
    open(){
        return new Promise( (resolve,reject) => {
            let request = indexedDB.open("OctoDB/"+name,1)
            request.onupgradeneeded = event => {
                this.created = true
                let db =  event.target.result
                let store = db.createObjectStore(name,{keyPath: this.scheme.keyPath})
                for(let index of this.scheme.indexes){
                    store.createIndex(index.name, index.name,{unique: index.unique})
                }
                this.db = db
                resolve(this)
            }
            request.onsuccess = event => {
                if(this.created) return
                this.db = event.target.result
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

// It's beautiful...
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
        for await (let o of this.entries){
            if(fn(o)) result.push(o)
        }
        return result
    }
    /**
     * Verify that all DB entries satisfy the condition 'fn'
     * @param {Function} fn 
     */
    async every(fn){
        for await (let o of this.entries){
            if(!fn(o)) return false
        }
        return true
    }
    /**
     * Slice DB
     * @param {Number} start
     * @param {Number} end
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
     * ! This method mutate DB !
     * 
     * Concat DB with the array
     * @param {Array} array 
     */
    async concat(array){
        for(let o of array){
            await (this.entries[o[this.scheme.keyPath]] = o)
        }
    }
    /**
     * OctoStore transaction
     * @param {Function} fn 
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