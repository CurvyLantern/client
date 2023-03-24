import { Room } from "libs/database/models";
import { createRoomId } from "./createRoomId";
import { doesRoomExist } from "./doesRoomExist";

interface CreateRoom {
  userId: string;
}
export const createRoom = async ({ userId }: CreateRoom) => {
  const getUniqueId = async (): Promise<string> => {
    const roomId = createRoomId();
    if (await doesRoomExist(roomId)) {
      return await getUniqueId();
    } else {
      return roomId;
    }
  };
  const roomId = await getUniqueId();
  const room = new Room({
    roomId,
    authorId: userId,
  });
  await room.save();
  return { roomId };
};
