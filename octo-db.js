class OctoDB {
    /**
     * OctoDB - Proxy wrapper for IDB, which syncs!
     * @param {String} name 
     * @param {Object} scheme 
     */
    constructor(name, scheme){
        name && (this.name = name)
        scheme && (this.scheme = scheme)
        let proxy =  new Proxy(this, {
            set: (_,key,value) => {
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
        return new Promise( (resolve,reject) => {
            let request = indexedDB.open("OctoDB/"+name,1)
            request.onupgradeneeded = event => {
                this.created = true
                let db =  event.target.result
                let store = db.createObjectStore(name,{keyPath: scheme.keyPath})
                for(let index of scheme.indexes){
                    store.createIndex(index.name, index.name,{unique: index.unique})
                }
                this.db = db
                resolve(proxy)
            }
            request.onsuccess = event => {
                if(this.created) return
                this.db = event.target.result
                resolve(proxy)
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