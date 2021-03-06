import User from "./entities/User";
import Patient from "./entities/Patient";

/**
 *  =========================
 *     Model Socket Rooms
 *  =========================
 */
/* Will be used for chatting rooms */
export default interface SocketRoom {
  [id: string]: [
    { peerid: string; user: User },
    { peerid: string; user: Patient }
  ];
}
