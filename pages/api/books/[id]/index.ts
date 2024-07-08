import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

const bookDetailHandler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    switch (req.method) {
        case 'GET':
            try {
                const book = await getBookDetail(req);
                res.status(200).json(book);
            } catch (err: any) {
                console.error(err);
                res.status(500).json({ message: err.message });
            }
            break;
        case 'PUT':
            try {
                await updateBookDetail(req, res);
            } catch (err: any) {
                console.error(err);
                res.status(500).json({ message: err.message });
            }
            break;
        default:
            res.status(405).json({ message: `HTTP method ${req.method} is not supported.` });
    }
};

async function getBookDetail(req: NextApiRequest) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        throw new Error('Invalid parameter `id`.');
    }

    const bookId = BigInt(id);

    const book = await prisma.book.findUnique({
        where: { id: bookId }
    });

    if (!book) {
        throw new Error('Book not found.');
    }

    const averageRating = await prisma.rating.aggregate({
        _avg: { score: true },
        where: { bookId }
    });

    return { ...book, averageRating: averageRating._avg.score };
}

async function updateBookDetail(req: NextApiRequest, res: NextApiResponse<any>) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        throw new Error('Invalid parameter `id`.');
    }

    const bookId = BigInt(id);

    if (!req.body || typeof req.body !== 'object') {
        throw new Error('Invalid parameters.');
    }

    const result = await prisma.book.update({
        data: req.body,
        where: { id: bookId }
    });

    res.status(200).json({ message: 'success', data: result });
}

export default bookDetailHandler;