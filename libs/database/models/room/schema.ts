import { Schema } from "mongoose";
const RoomSchema = new Schema({
  roomId: String,
  authorId: String,
  members: [String],
});
export default RoomSchema;
