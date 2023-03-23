import { Room } from "libs/database/models";
import { createRoomId } from "./createRoomId";
import { doesRoomExist } from "./doesRoomExist";

export const createRoom = async (
  exceptRoomId: string = ""
): Promise<{
  roomId: string;
}> => {
  const roomId = createRoomId(exceptRoomId);
  if (await doesRoomExist(roomId)) {
    return await createRoom(roomId);
  }
  const room = new Room({
    roomId,
  });
  await room.save();
  return { roomId };
};
