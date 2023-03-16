// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { createRoom } from "@/utils/RoomHelpers";
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
    const { roomId } = await createRoom();
    return res.status(200).json({ roomId });
  }

  return res.status(200).json({ roomId: "" });
}
