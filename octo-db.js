class OctoDB {
    constructor(peer){
        this.peer = peer
    }
    async open(name,protocol){
        return await new Promise( (resolve) => {
            let request = indexedDB.open("OctoDB",1)
            request.onupgradeneeded = function(event){
                let db =  event.target.result
                let store = db.createObjectStore(name,{keyPath: protocol.keyPath})
                for(let index of protocol.indexes){
                    store.createIndex(index.name, index.name,{unique: index.unique})
                }
                let method = msg => protocol.methods(store).forEach(m => msg[m.name] && m.reaction(msg[m.name]))
                let wrapStore = {method}
                resolve(wrapStore)
            }
            request.onsuccess = function(event){
                let db =  event.target.result
                let store = db.transaction(name,"readwrite").objectStore(name)
                let method = msg => protocol.methods(store).forEach(m => msg[m.name] && m.reaction(msg[m.name]))
                let wrapStore = {method}
                resolve(wrapStore)
            }
        })
    }
}
