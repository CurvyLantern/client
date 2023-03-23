// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { createRoom } from "@/server/utils/createRoom";
import { connectToDatabase } from "libs/database";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  roomId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // look for this room id in the database
  // send data accordingly
  if (req.method === "GET") {
    const testClient = await connectToDatabase();
    const { roomId } = await createRoom();
    return res.status(200).json({ roomId });
  }

  return res.status(200).json({ roomId: "" });
}
