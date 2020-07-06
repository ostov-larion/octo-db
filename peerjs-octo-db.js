/**
 * PeerJS NetAdapter.
 * Responsible for connecting to peers and establishing communication channels between databases
 * @param {Peer} peer PeerJS client
 * @returns {NetAdapterObject}
 */
PeerJSNetAdapter = (peer,db) =>
    /**
     * @interface NetAdapterObject
     */
    ({
    __channels__: [],
    /**
     * Connect to other peers
     * @memberof NetAdapterObject
     */
    connect(){
        peer.on("connection", connection => {
            connection.on('open', () => {
                db.dispatchEvent(onconnection,connection)
                connection.on('data',data => {
                    let answer = (method,answerData) => connection.send({header:data.header,method,data:answerData}) 
                    this.__channels__.forEach(ch => ch.header == data.header && ch.methods[data.method](data.data,answer))
                })
            })
        })
        peer.listAllPeers(list => {
            if(!list) return 
            for(let id of list){
                if(id != peer.id) {
                    let connection = peer.connect(id)
                    connection.on('open', () => {
                        db.dispatchEvent(onconnection, connection)
                        connection.on('data', data => {
                            let answer = (method,answerData) => connection.send({header:data.header,method,data:answerData}) 
                            this.__channels__.forEach(ch => ch.header == data.header && ch.methods[data.method](data.data,answer))
                        })
                    })
                }
            }
        })
    },
    /**
     * Broadcast message to other peers
     * @param {String} header Name of channel
     * @param {String} method Name of method (usually 'get' or 'post')
     * @param {Object} [data] Any object
     * @memberof NetAdapterObject
     * @example db.broadcast('tags','get')
     */
    broadcast(header,method,data){
        for(let c in peer.connections) {
            if(peer.connections[c]){
                for(let i in peer.connections[c]) peer.connections[c][i].send({header,method,data})
            }
        }
    },
    /**
     * Create channel
     * @param {String} header Name of channel
     * @param {Object} methods Methods of NetAdapter
     * @memberof NetAdapterObject
     * @example
     * db.net.channel('tags',{
     *  async get(_,answer){
     *      answer('post',(await db.all()).map(e => ({hash: e.hash, tags: e.tags})))
     *  },
     *  async post(data){
     *      for(let entry of data) {
     *          db.entries[entry.hash] = entry
     *      }
     *  }
     * })
     */
    channel(header,methods){
        this.__channels__.push({header,methods})
    }
})

class PeerStore extends OctoStore {
    /**
     * @extends OctoStore
     * @param {String} name Name of DB
     * @param {Object} scheme Scheme Object
     * @param {Peer} peer PeerJS client
     */
    constructor(name,scheme,peer){
        super(name,scheme)
        /**
         * @type {NetAdapterObject} net
         * @memberof PeerStore
         */
        this.net = PeerJSNetAdapter(peer, this)
        peer.on('open', () => this.net.connect())
    }
}