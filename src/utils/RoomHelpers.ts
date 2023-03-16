import { createRoomId } from "@/utils/Helpers";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { app, database } from "libs/database/firebase";

export const createRoom = async () => {
  const dbRef = collection(database, "rooms");
  const roomSnapshot = (await getDocs(dbRef)).docs.map(
    (doc) => doc.data() as { code: string }
  );
  const roomId = await createRoomId(9, roomSnapshot);

  // add this roomcode to firebase
  const addedRoom = await addDoc(dbRef, {
    code: roomId,
    createAt: Timestamp.now(),
  });

  return { roomId };
};
