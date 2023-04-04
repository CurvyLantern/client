import { connectToDatabase } from "@/libs/database";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  console.log(query, "query");
  if (method === "GET") {
    await connectToDatabase();
    return res.status(200).json({
      state: true,
    });
  }
  return res.end();
}
