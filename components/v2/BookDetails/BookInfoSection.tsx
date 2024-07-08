import { BookmarkIcon, HomeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useRecoilValueLoadable } from "recoil";
import type { Book } from "@prisma/client";
import BookInfoDialog from "components/v2/BookDetails/BookInfoDialog";
import type { BookDetailProps } from "const";
import { LoopCache, QnsAns, getAnswer, getBookCacheLocal, setCacheLocal } from "lib/aiqns";
import { currencyFormat } from "lib/utils";
import { useState } from "react";
import { bookInfoQuery } from "selectors";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";

export default function BookInfoSection() {
	const [bookDetailsState, setBookDetailsState] = React.useState<BookDetailProps | undefined>();
	const editBookDetailDialogRef = React.useRef<HTMLDialogElement>(null);
	const [qnsAnsOutput, setQnsAnsOutput] = useState<string[]>([]);
	const [qnsList, setQnsList] = useState<QnsAns[]>([]);

	const bookDetailsLodable = useRecoilValueLoadable(bookInfoQuery);

	const handleUpdate = (data: BookDetailProps) => {
		setBookDetailsState(data);
	};

	const shuffleArray = (array: any[]) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	};

	switch (bookDetailsLodable.state) {
		case "hasValue":
			const data = bookDetailsLodable.contents.content;

			const qnsInputKeyEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
				if (event.key !== "Enter") return;
				const qns = (document.getElementById("ai_qns_Input") as HTMLInputElement).value;
				const noAns = "There is no answer. We will try to ask the community for you.";
				const cache = getBookCacheLocal(Number(data.id));
				const ans = await getAnswer(qns, data as unknown as Book, cache || ({} as LoopCache), noAns);
				setQnsAnsOutput([...qnsAnsOutput, qns, ans]);
			};

			const ansInputKeyEnter = async (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
				if (event.key !== "Enter") return;
				const ans = (document.getElementById("ai_ans_input") as HTMLInputElement).value;
				const list = qnsList;
				list[index].ans = ans;
				setQnsList(list);
				setCacheLocal(Number(data.id), Number(data.id), list);
				alert("Answer saved!");
			};

			const loadCache = () => {
				const cache = getBookCacheLocal(Number(data.id));
				setQnsList(cache?.qnsans ?? []);
			};

			const buttons = shuffleArray([
				<Button
					className="w-32 btn btn-info"
					onClick={() => {
						editBookDetailDialogRef.current?.showModal();
					}}
					key="edit-details"
				>
					Edit Details
				</Button>,
				<Dialog key="chat-ai">
					<DialogTrigger>
						<Button>Chat with AI</Button>
					</DialogTrigger>
					<DialogContent className="modal-box">
						<DialogHeader>Chat with AI</DialogHeader>
						<DialogDescription>
							{qnsAnsOutput.map((text) => (
								<p key={text}>{text}</p>
							))}
						</DialogDescription>
						<Input
							type="text"
							id="ai_qns_Input"
							placeholder="Chat now"
							className="w-full max-w-xs Input Input-bordered Input-sm"
							onKeyUp={qnsInputKeyEnter}
						/>
					</DialogContent>
				</Dialog>,
				<Dialog key="answer-questions">
					<DialogTrigger>
						<Button onClick={loadCache}>Answer Questions</Button>
					</DialogTrigger>
					<DialogContent className="modal-box">
						<DialogHeader className="text-lg font-bold">Answer Questions</DialogHeader>
						<DialogDescription className="py-4">
							{qnsList.map((qnsans, index) => (
								<React.Fragment key={index}>
									{qnsans.ans ? null : (
										<Dialog>
											<DialogTrigger>
												<Button>{qnsans.qns}</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>{qnsans.qns}</DialogTitle>
													<DialogDescription>Please answer this question!</DialogDescription>
													<Input
														type="text"
														id="ai_ans_input"
														placeholder="Answer Question"
														className="w-full max-w-xs Input Input-bordered Input-sm"
														onKeyUp={(e) => ansInputKeyEnter(e, index)}
													/>
												</DialogHeader>
											</DialogContent>
										</Dialog>
									)}
								</React.Fragment>
							))}
						</DialogDescription>
					</DialogContent>
				</Dialog>,
			]);

			return (
				<>
					<div className="text-sm breadcrumbs">
						<ul>
							<li>
								<Link href="/">
									<HomeIcon className="w-4 h-4" />
									Book
								</Link>
							</li>
							<li>
								<BookmarkIcon className="w-4 h-4" />
								{data.title}
							</li>
						</ul>
					</div>

					<div className="justify-start h-auto p-5 m-5 shadow-xl rounded-box">
						<div className="flex-col hero-content lg:flex-row">
							<Image
								src={`https://picsum.photos/seed/${data.id}/200/280`}
								alt={`book image`}
								width={200}
								height={280}
							/>
							<div className="flex flex-col gap-2">
								<h1 className="text-5xl font-bold">{data.title}</h1>
								<p className="pt-6">
									<span className="pr-4 text-lg font-bold">Type:</span>
									{data.type.replaceAll(`_nbsp_`, ` `).replaceAll(`_amp_`, `&`)}
								</p>
								<p>
									<span className="pr-4 text-lg font-bold">Publication date:</span>
									{new Date(data.publishedAt).toLocaleDateString()}
								</p>
								<p>
									<span className="pr-4 text-lg font-bold">Price:</span>
									{`$ ${currencyFormat(data.price)}`}
								</p>
								<p>
									<span className="pr-4 text-lg font-bold">In stock:</span>
									{bookDetailsState?.stock || data.stock}
								</p>
								<div className="flex flex-wrap gap-5">{buttons}</div>
							</div>
						</div>
					</div>

					{data && (
						<BookInfoDialog
							key={`${data.id}-${data.stock}`}
							id="edit_book_detail"
							ref={editBookDetailDialogRef}
							data={data}
							onSuccess={handleUpdate}
						/>
					)}
				</>
			);
		case "loading":
			return (
				<>
					<div className="flex items-center justify-center">
						<span className="loading loading-bars loading-lg"></span>
					</div>
				</>
			);
		case "hasError":
			throw bookDetailsLodable.contents;
	}
}
