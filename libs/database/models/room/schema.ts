import { Schema } from "mongoose";
const RoomSchema = new Schema({
  roomId: String,
  creatorId: String,
  members: [String],
});
export default RoomSchema;
