import mongoose, { Model } from "mongoose";
const RoomSchema = new mongoose.Schema({
  roomId: String,
  authorId: String,
  members: [String],
});

const Room = mongoose.models.Room || mongoose.model("Room", RoomSchema);

export default Room;
