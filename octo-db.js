class OctoDB {
    constructor(peer){
        this.peer = peer
    }
    async open(name,scheme){
        return await new Promise( (resolve,reject) => {
            let request = indexedDB.open("OctoDB",1)
            request.onupgradeneeded = event => {
                let db =  event.target.result
                let store = db.createObjectStore(name,{keyPath: scheme.keyPath})
                for(let index of scheme.indexes){
                    store.createIndex(index.name, index.name,{unique: index.unique})
                }
                resolve(new OctoStoreTransaction(name,db,scheme,this.peer))
            }
            request.onsuccess = event =>{
                let db =  event.target.result
                resolve(new OctoStoreTransaction(name,db,scheme,this.peer))
            }
            request.onerror = () => {
                reject(request.error)
            }
        })
    }
}

class EventEmmiter {
    on(eventName, handler) {
      if (!this._eventHandlers) this._eventHandlers = {};
      if (!this._eventHandlers[eventName]) {
        this._eventHandlers[eventName] = [];
      }
      this._eventHandlers[eventName].push(handler);
    }
    off(eventName, handler) {
      let handlers = this._eventHandlers && this._eventHandlers[eventName];
      if (!handlers) return;
      for (let i = 0; i < handlers.length; i++) {
        if (handlers[i] === handler) {
          handlers.splice(i--, 1);
        }
      }
    }
    trigger(eventName, ...args) {
      if (!this._eventHandlers || !this._eventHandlers[eventName]) {
        return; 
      }
      this._eventHandlers[eventName].forEach(handler => handler.apply(this, args));
    }
}

class OctoStoreTransaction extends EventEmmiter {
    #db = {}
    constructor(name,db,scheme,peer){
        super()
        this.name = name
        this.scheme = scheme
        this.#db = db
        this.peer = peer
        this.sync()
    }
    add(value){
        this.scheme.beforeAdd && this.scheme.beforeAdd(value)
        let store = this.#db.transaction(this.name,"readwrite").objectStore(this.name)
        let request = store.add(value)
        this.trigger("add",value)
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    }
    put(value){
        this.scheme.beforePut && this.scheme.beforePut(value)
        let store = this.#db.transaction(this.name,"readwrite").objectStore(this.name)
        let request = store.put(value)
        this.trigger("put",value)
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    }
    delete(key){
        this.scheme.beforeDelete && this.scheme.beforeDelete(value)
        let store = this.#db.transaction(this.name,"readwrite").objectStore(this.name)
        let request = store.delete(key)
        this.trigger("delete",key)
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    }
    async get(key){
        let value = await this.getLocally(key)
        if(value){
            return value
        }
        else {

        }
    }
    getLocally(key){
        this.scheme.beforeGet && this.scheme.beforeGet(key)
        let store = this.#db.transaction(this.name,"readwrite").objectStore(this.name)
        let request = store.get(key)
        return new Promise((resolve, reject) => {
            request.onsuccess = event => {
                resolve(event.target.result)
            }
            request.onerror = () => reject(request.error)
        })
    }
    getAll(){
        this.scheme.beforeGetAll && this.scheme.beforeGetAll()
        let store = this.#db.transaction(this.name,"readwrite").objectStore(this.name)
        let request = store.getAll()
        return new Promise((resolve, reject) => {
            request.onsuccess = event => {
                this.dispatch({getAll: true})
                resolve(event.target.result)
            }
            request.onerror = () => reject(request.error)
        })
    }
	getAllLocally(){
		this.scheme.beforeGetAll && this.scheme.beforeGetAll()
        let store = this.#db.transaction(this.name,"readwrite").objectStore(this.name)
        let request = store.getAll()
        return new Promise((resolve, reject) => {
            request.onsuccess = event => {
                resolve(event.target.result)
            }
            request.onerror = () => reject(request.error)
        })
	}
    count(key){
        let store = this.#db.transaction(this.name,"readwrite").objectStore(this.name)
        return new Promise( resolve => store.count(key).onsuccess = event => resolve(event.target.result))
    }
    async has(key){
        return await this.count(key) > 0
    }
    async sync(){
        let ctx = this
        this.peer.on("connection", connection => {
			if(connection.peer == this.peer.id) return
            console.log("New peer")
            connection.on("data", async(data) => {
                console.log("Data:", data)
                if(data.getAll) {
                    let answer = this.peer.connect(connection.peer)
                    answer.on("open", async() => {
                        let s = await ctx.getAllLocally()
                        answer.send({ postAll: s })
                    })
					answer.on('data', data => {
					if(data.postDB) {
							console.log('Putting db from another peer')
							putDB(data.postDB)
						}
					})
                }
                if(data.postAll) {
                    for(let entry of data.postAll){
                        try {
                            this.add(entry)
                        }
                        catch(e){}
                    }
                }
                if(data.add) {
                    try {
                        this.add(data.add)
                    }
                    catch(e){}
                }
				if(data.put) {
                    try {
                        this.add(data.put)
                    }
                    catch(e){}
                }
				if(data.delete){
					try {
                        this.delete(data.delete)
                    }
                    catch(e){}
				}
                if(data.get) {
                    let s = await ctx.getLocally(data.get)
                    let answer = peer.connect(connection.peer)
					answer.on("open", () => answer.send({post: s}))
                }
            })
        })
        this.peer.listAllPeers(list => {
            console.log("Peers:", list)
            if(list.length == 0) return 
            for(let id of list){
                if(id != this.peer.id) {
                    this.peer.connect(id)
                }
            }
        })
    }
    dispatch(data){
        for(let p in this.peer.connections) {
            if(this.peer.connections[p]){
                for(let i in this.peer.connections[p]) this.peer.connections[p][i].send(data)
            }
        }
    }
}