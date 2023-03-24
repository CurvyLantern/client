import { Room } from "libs/database/models";

export const doesRoomExist = async (roomId: string) => {
  const cursor = await Room.exists({
    roomId,
  });
  return Boolean(cursor);
};
