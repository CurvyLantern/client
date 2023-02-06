// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { nanoid } from 'nanoid';
import { createRoomId } from '@/utils/Helpers';
type Data = {
	state: 'present' | 'absent';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	// look for this room id in the database
	// send data accordingly
	let state = await new Promise<Data['state']>(resolve => {
		setTimeout(resolve, 3000, 'present');
	});

	res.status(200).json({ state });
}
