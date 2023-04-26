import Room from "@/libs/database/room/model";
import { ALPHABETS, roomIdDivider, roomIdLength } from "@/utils/Constants";
import { customAlphabet } from "nanoid";

const customNano = customAlphabet(ALPHABETS, roomIdLength);
const splitString = (str: string, divider: string) => {
  return str.slice(0, 3) + divider + str.slice(3, 7) + divider + str.slice(7);
};
export const createRoomId = () => {
  const rawId = customNano();
  // const paddedRawId = rawId.padEnd(roomIdLength, "a");
  let id = splitString(rawId, roomIdDivider);
  return id;
};

export const doesRoomExist = async (roomId: string) => {
  const cursor = await Room.exists({
    roomId,
  });
  return Boolean(cursor);
};

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
