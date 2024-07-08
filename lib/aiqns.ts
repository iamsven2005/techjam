import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Book } from "@prisma/client";

const model = new GoogleGenerativeAI(
	process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
).getGenerativeModel({ model: "gemini-1.5-flash" });

export type LoopCache = {
	id: number;
	bookId: number;
	qnsans: QnsAns[];
};

export type QnsAns = {
	qns: string;
	ans: string | undefined;
};

// export async function getCache(id: number) {
//     try {
//         const cache = await prisma?.loopCache.findFirst({
//             where: {
//                 id: BigInt(id)
//             },
//             include: {
//                 qnsans: true,
//             },
//         });
//         return cache;
//     } catch (error) {
//         console.error("Error fetching cache:", error);
//         return null;
//     }
// }

// export async function setCache(id: number, qnsans: { qns: string; ans: string | null }[]) {
//     try {

//         const cache = await prisma?.loopCache.create({
//             data: {
//                 id: BigInt(id),
//                 qnsans: {
//                     create: qnsans.map(qa => ({
//                         qns: qa.qns,
//                         ans: qa.ans ?? null, // Ensure ans is always defined, use null if undefined
//                     })),
//                 },
//             },
//         });
//         return cache;
//     } catch (error) {
//         console.error("Error setting cache:", error);
//         return null;
//     }
// }

export function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getCacheListLocal() {
	return JSON.parse(localStorage.getItem("cache") ?? "[]") as LoopCache[];
}

export function getBookCacheLocal(id: number) {
	const cache = getCacheListLocal();
	return cache.find((c) => c.bookId === id);
}

export function setCacheLocal(id: number, bookId: number, qnsans: QnsAns[]) {
	const cache = getCacheListLocal();
	if (cache.find((c) => c.bookId === bookId)) {
		// biome-ignore lint/complexity/noForEach:
		cache.forEach((c) => {
			if (c.bookId === bookId) {
				c.qnsans = qnsans;
			}
		});
	} else {
		cache.push({ id, bookId, qnsans });
	}
	localStorage.setItem("cache", JSON.stringify(cache));
}

export async function getAnswer(
	qns: string,
	book: Book,
	cache: LoopCache,
	defaultRes: string,
) {
	let cacheString = "";
	for (const qnsans of cache?.qnsans ?? []) {
		cacheString += `Q: ${qnsans.qns}\nA: ${qnsans.ans ?? defaultRes}\n`;
	}
	const prompt = `
You are a chatbot answering a user's question about a product. This is the product's information:

Title: ${book.title}
Price: ${book.price}
Published At: ${book.publishedAt}
Stock: ${book.stock}
Type: ${book.type}

There are some already answered questions in the cache, use them when needed:

${cacheString}

The user's question is: ${qns}

If you can't find an answer, respond with "${defaultRes}".
    `;
	console.log(prompt);
	const result = await model.generateContent(prompt);
	const response = await result.response;
	const text = await response.text();

	if (text.trim() === defaultRes) {
		setCacheLocal(cache.id, Number(book.id), [
			...(cache.qnsans ?? []),
			{
				qns,
				ans: undefined,
			},
		]);
	}

	return text;
}