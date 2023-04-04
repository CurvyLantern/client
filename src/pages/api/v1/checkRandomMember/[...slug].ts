import { connectToDatabase } from "@/libs/database";
import Room from "@/libs/database/room/model";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const slug = query.slug! as string[];

  if (method === "GET") {
    await connectToDatabase();

    const [roomId, userId] = slug;
    const hasMember = await Room.where("roomId", roomId)
      .or([{ authorId: userId }, { members: { $in: [userId] } }])
      .countDocuments();

    console.log(hasMember, " hasMember ");

    // const hasMember = await Room.findOne({
    //   roomId: slug[0],
    //   members: {
    //     $in: [slug[1]],
    //   },
    // });
    return res.status(200).json({
      state: hasMember > 0,
    });
  }
  return res.end();
}
