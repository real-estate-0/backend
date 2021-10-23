import SocketIO from 'socket.io'
import Redis, { Redis as RedisInterface } from 'ioredis'
import redisAdapter from 'socket.io-redis'
import { nanoid } from 'nanoid'
import config from 'config'

class Socket {
  public io: SocketIO.Server
  public connect: number
  public ip: string
  public port: number
  public password: string
  public serverIp: string
  public redis: RedisInterface
  public myHostIp: string
  public myHostPort: number

  constructor(server, redisIp, redisPort, redisPassword) {
    this.connect = 0
    this.io = SocketIO(server) //require("socket.io")(server);
    //redis config
    this.ip = redisIp
    this.port = redisPort
    this.password = redisPassword
    //console.log("Socket Redis conf", this.ip, this.port, this.password);
    this.redis = new Redis(this.port, this.ip, { password: this.password })

    //host config
    this.myHostIp = config.get('socket.ip')
    this.myHostPort = config.get('socket.port')

    this.initialzeSocketIo()
  }

  private initialzeSocketIo() {
    this.io.adapter(
      redisAdapter({
        pubClient: new Redis(this.port, this.ip, {
          password: this.password,
        }),
        subClient: new Redis(this.port, this.ip, {
          password: this.password,
        }),
      })
    )
    let self = this

    this.io.on('connection', (socket) => {
      console.log('connected', socket.id, ++self.connect)

      socket.on('alive-check', async (args) => {
        console.log('alive-check', new Date(), socket.id, args)
        if (args.userId) {
          if (!userSockets[args.userId]) {
            userSockets[args.userId] = new Set<string>()
          }
          userSockets[args.userId].add(socket.id)
          console.log('userSockets', userSockets[args.userId])
          const clients = await this.io.of('/').clients(() => {})
          const ids = Object.keys(clients.sockets)
          for (let id of ids) {
            console.log('id', id, clients.sockets[id].connected)
          }
          if (userSockets && userSockets.hasOwnProperty(args.userId)) {
            console.log('userSocket2', userSockets[args.userId])
            userSockets[args.userId].forEach((socketId) => {
              console.log('emit to socketid', socketId)
              this.io.to(socketId).emit(args.userId, 'received your message')
            })
          }
        }
      })

      //TODO change to ROOM //서버 restart되면 socket id reset, join-room 다시 호출해야됨
      socket.on('initialize-socket', async (args) => {
        const clientIp = socket.request.connection.remoteAddress
        console.log('clientIp', clientIp)
        const clients = await this.io.of('/').clients(() => {})
        //console.log('client', clients.sockets)
        const ids = Object.keys(clients.sockets)
        for (let id of ids) {
          const socketIp = clients.sockets[id].handshake.address
          if (id !== socket.id && socketIp === clientIp) {
            console.log('exists socket with ip', clientIp, id)
            clients.sockets[id].disconnect()
          }
        }
      })

      socket.on('disconnect-all', async (args) => {
        console.log('disconnect-all', args)
      })

      socket.on('leave-room', (args) => {
        if (args.roomId) {
          socket.leave(args.roomId)
          console.log('leaved:' + args.roomId)
        }
      })
      socket.on('join-room', (args) => {
        console.log('received request-join', args)
        if (args.roomId) {
          socket.join(args.roomId)
          console.log('joined:' + args.roomId)
          console.log('rooms', socket.rooms)
          /*
          setTimeout(() => {
            this.io.sockets.to('test1').emit('test1', 'testmsg')
            console.log('emit testmsg')
          }, 1000)
          */
        }
      })
      socket.on('disconnect', () => {
        console.log('disconnected', --self.connect)
        console.log('rooms', socket.rooms)
      })
    })
  }
  public getIO() {
    return this.io
  }
}

export default Socket
