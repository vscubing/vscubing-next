import PusherServer from 'pusher'

export const pusherServer = new PusherServer({
  appId: 'app-id',
  key: 'app-key',
  secret: 'app-secret',
  cluster: 'UNUSED',
  host: '127.0.0.1',
  port: '6001',
  useTLS: false,
})
