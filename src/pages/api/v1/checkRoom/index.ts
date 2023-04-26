// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { connectToDatabase } from "@/libs/database";
import { doesRoomExist } from "@/server/utils/createRoom";
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
  if (req.method === "POST") {
    const { roomId } = req.body as { roomId: string | null };
    if (!roomId || typeof roomId !== "string") {
      return res
        .status(400)
        .json({ message: "roomId is not valid, enter valid input" });
    }
    await connectToDatabase();

    const availability = await doesRoomExist(roomId);
    return res
      .status(200)
      .json({ roomState: availability ? "available" : "unavailable" });
  }

  return res
    .status(400)
    .json({ message: "bad request or method type is wrong" });
}
