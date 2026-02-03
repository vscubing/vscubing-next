Current implementation:

- ./src/app/(app)/cube-together/page shows a page with one cube that can be controller by anyone who joins
- ./socket-server handles the socket connections and broadcasts moves to all connected clients
- The cube state is saved in memory and shared on join, otherwise moves are broadcast to all clients.

Desired implementation:

- create rooms so that multiple separate cubes can be controlled independently by different groups of users
- make it only possible for logged in users to create rooms, but allow guests to join existing rooms
- Show who is in the room
- Make it possible to kick users
- make it possible to change the room settings (e.g. allow guests or not, change password)
- Room's name should be "username's room"
- Auth is based on session cookie like in src/backend/auth/session.ts
- Make it possible to set a room password when creating a room, and require that password to join the room
- Store everything in memory, don't touch nextjs backend or database.
- Make sure to handle disconnections properly: if no users are left, delete the room after 5 minutes of inactivity
