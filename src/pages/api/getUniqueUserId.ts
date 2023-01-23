// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { nanoid } from 'nanoid';
type Data = {
	userId: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	const userId = nanoid(8);

	res.status(200).json({ userId });
}
