import { ALPHABETS, roomIdDivider, roomIdLength } from "./Constants";

const checkRoomIdSyntax = (maybeWrongRoomId: string) => {
  let str = maybeWrongRoomId.replaceAll(roomIdDivider, "");
  str = str.toLowerCase();
  if (str.length !== roomIdLength) {
    return false;
  }
  const state = str.split("").some((letter) => {
    return ALPHABETS.includes(letter);
  });
  return state;
};

export default checkRoomIdSyntax;
