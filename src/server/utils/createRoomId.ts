import { customAlphabet } from "nanoid";
let letters = "abcdefghijklmnopqrstuvwxyz";
const len = 10;
const splitString = (str: string) => {
  return str.slice(0, 3) + "-" + str.slice(3, 7) + "-" + str.slice(7);
};
const toCustomLengthString = (len: number, str: string) => {
  return str.padEnd(len, "a");
};

const transformRawRoomId = (rawId: string) => {
  if (typeof rawId !== "string") {
    throw new Error("needs string type to transform raw room id");
  }
  let _roomId = toCustomLengthString(len, rawId);
  return splitString(_roomId);
};
const customNano = customAlphabet(letters, 9);
export const createRoomId = (exceptId: string = ""): string => {
  let id = transformRawRoomId(customNano());
  if (exceptId === id) {
    return createRoomId(id);
  }
  return id;
};
