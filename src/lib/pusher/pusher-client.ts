import PusherJS from 'pusher-js'

let pusherClientSingleton: PusherJS | undefined
export function getPusherClient() {
  // PusherJS.logToConsole = true

  if (!pusherClientSingleton) {
    pusherClientSingleton = new PusherJS('app-key', {
      cluster: 'NOT_USED',
      wsHost: '127.0.0.1',
      wsPort: 6001,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: '/api/pusher/auth-channel',
    })
  }
  return pusherClientSingleton
}
