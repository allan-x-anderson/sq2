import {Socket, Presence} from "phoenix"

export function connectToSocket(socket, params) {
  socket.connect(params)
}

export function getBoardChannel (socket, id) {
  return socket.channel("board:" + id)
}

export function joinChannel(channel, token){
  channel.join({token: token})
    .receive("ok", resp => {
      console.log("Joined successfully", resp)
     })
    .receive("error", resp => { console.log("Unable to join", resp) })
  return channel
}
