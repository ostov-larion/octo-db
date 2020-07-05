PeerJSNetAdapter = peer => ({
    __channels__: [],
    connect(){
        peer.on("connection", connection => {
            connection.on('open', () => {
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
                        connection.on('data', data => {
                            let answer = (method,answerData) => connection.send({header:data.header,method,data:answerData}) 
                            this.__channels__.forEach(ch => ch.header == data.header && ch.methods[data.method](data.data,answer))
                        })
                    })
                }
            }
        })
    },
    broadcast(header,method,data){
        for(let c in peer.connections) {
            if(peer.connections[c]){
                for(let i in peer.connections[c]) peer.connections[c][i].send({header,method,data})
            }
        }
    },
    channel(header,methods){
        this.__channels__.push({header,methods})
    }
})

class PeerStore extends OctoStore {
    constructor(name,scheme,peer){
        super(name,scheme)
        this.net = PeerJSNetAdapter(peer)
        peer.on('open', () => this.net.connect())
    }
}