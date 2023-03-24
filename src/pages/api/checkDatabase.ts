import { connectToDatabase } from "libs/database";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const testClient = await connectToDatabase();
    return res.status(200).json({ hello: "mom" });
  } catch (error) {
    return res.status(404).json({ hi: "hello" });
  }
}
