import socketIOClient, { Socket } from 'socket.io-client'
import User from '../../interfaces/entities/User'
import {
  ENTER_ROOM,
  SET_UP_CALL,
  USER_CONNECTED,
  JOINED_CALL,
} from '../../sockets/Channels'

import Peer from 'peerjs'

/**
 *  ==============================================
 *     SOCKET.IO CLIENT FOR A VIDEO CHAT ROOM
 *  ==============================================
 */
export default class SocketRoom {
  /* Socket.io client */
  private socketClient: Socket

  /* PeerJS connection */
  private peerClient: Peer
  private myVideo: HTMLVideoElement

  constructor(
    private roomid: string,
    private peerId: string,
    private videoGrid: HTMLElement
  ) {
    this.socketClient = socketIOClient()
    this.peerClient = new Peer(this.peerId)
    this.myVideo = document.createElement('video')
    this.myVideo.muted = true
    this.handleMessages()
  }

  /* Enter to socket.io room on the server */
  public enterSocketRoom(): void {
    /* Check if the user is logged in */
    this.socketClient.emit(ENTER_ROOM, {
      peerid: this.peerId,
      roomid: this.roomid,
    })
  }

  /* Handle socket messages */
  public handleMessages(): void {
    /* When the user has been confirmed to belong to the room we can stream */
    /* Get current users video stream */
    this.socketClient.on(SET_UP_CALL, () => {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((stream: MediaStream) => {
          this.addVideoStream(this.myVideo, stream)

          this.peerClient.on('call', (call) => {
            console.log('Call incoming')
            call.answer(stream)
            const userVideo = document.createElement('video')
            call.on('stream', (otherUserStream) => {
              console.log('other person stream')
              this.addVideoStream(userVideo, otherUserStream)
            })
          })

          this.socketClient.on(USER_CONNECTED, ({ peerid }) => {
            setTimeout(() => {
              this.connectToUser(peerid, stream)
            }, 1000)
          })

          this.socketClient.emit(JOINED_CALL, {
            roomid: this.roomid,
            peerid: this.peerId,
          })
        })
    })

    this.peerClient.on('error', (err) => {
      console.log(err)
    })
  }

  /* Add video stream */
  public addVideoStream(video: HTMLVideoElement, stream: MediaStream): void {
    console.log(stream)
    video.srcObject = stream
    video.addEventListener('loadeddata', () => {
      video.play()
    })
    this.videoGrid.append(video)
  }

  /* Connect to the other user */
  public connectToUser(id: string, stream: MediaStream): void {
    console.log(`Calling id ${id}`)
    const call = this.peerClient.call(id, stream)
    const video = document.createElement('video')
    call.on('stream', (userVideoStream: MediaStream) => {
      this.addVideoStream(video, userVideoStream)
    })

    call.on('close', () => {
      video.remove()
    })
  }
}
