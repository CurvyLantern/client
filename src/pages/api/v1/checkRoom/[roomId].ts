// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { doesRoomExist } from "@/server/utils/doesRoomExist";
import { connectToDatabase } from "libs/database";
import type { NextApiRequest, NextApiResponse } from "next";

type Data =
  | {
      roomState: "available" | "unavailable";
    }
  | {
      message: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // look for this room id in the database
  // send data accordingly
  if (req.method === "GET") {
    const { roomId } = req.query as { roomId: string };
    await connectToDatabase();
    const isAvailable = await doesRoomExist(roomId);
    return res
      .status(200)
      .json({ roomState: isAvailable ? "available" : "unavailable" });
  }

  return res
    .status(400)
    .json({ message: "bad request or method type is wrong" });
}
