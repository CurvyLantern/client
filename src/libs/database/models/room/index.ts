import mongoose, { model } from "mongoose";
import RoomSchema from "./schema";

const Room = (mongoose.models.Room || model("Room", RoomSchema)) as ReturnType<
  typeof model<typeof RoomSchema>
>;
const Doom = model("doom", RoomSchema);
export default Room;