import { BookmarkIcon, HomeIcon } from "@heroicons/react/24/outline";
import type { Book } from "@prisma/client";
import BookInfoDialog from "components/v2/BookDetails/BookInfoDialog";
import type { BookDetailProps } from "const";
import {
	type LoopCache,
	type QnsAns,
	getAnswer,
	getBookCacheLocal,
	setCacheLocal,
} from "lib/aiqns";
import { currencyFormat } from "lib/utils";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useState } from "react";
import { useRecoilValueLoadable } from "recoil";
import { bookInfoQuery } from "selectors";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Preview } from "../Rating/preview";

interface ButtonClickTimestamp {
	[key: number]: number;
}

export default function BookInfoSection() {
	const [bookDetailsState, setBookDetailsState] = React.useState<
		BookDetailProps | undefined
	>();
	const editBookDetailDialogRef = React.useRef<HTMLDialogElement>(null);
	const [qnsAnsOutput, setQnsAnsOutput] = useState<{
		isBot: boolean;
		text: string;
	}[]>([]);
	const [qnsList, setQnsList] = useState<QnsAns[]>([]);
	const [buttonClickTimestamps, setButtonClickTimestamps] = useState<ButtonClickTimestamp>({});

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
			// biome-ignore lint/correctness/noSwitchDeclarations:
			const data = bookDetailsLodable.contents.content;

			// biome-ignore lint/correctness/noSwitchDeclarations:
			const qnsInputKeyEnter = async (
				event: React.KeyboardEvent<HTMLInputElement>,
			) => {
				if (event.key !== "Enter") return;
				const qns = (
					document.getElementById("ai_qns_Input") as HTMLInputElement
				).value;
				const noAns =
					"There is no answer. We will try to ask the community for you.";
				const cache = getBookCacheLocal(Number(data.id));
				const ans = await getAnswer(
					qns,
					data as unknown as Book,
					cache || ({} as LoopCache),
					noAns,
				);
				setQnsAnsOutput([...qnsAnsOutput, {
					isBot: false,
					text: qns,
				}, {
					isBot: true,
					text: ans,
				}]);
			};

			// biome-ignore lint/correctness/noSwitchDeclarations:
			const ansInputKeyEnter = async (
				event: React.KeyboardEvent<HTMLInputElement>,
				index: number,
			) => {
				if (event.key !== "Enter") return;
				const ans = (
					document.getElementById("ai_ans_input") as HTMLInputElement
				).value;
				const list = qnsList;
				list[index].ans = ans;
				setQnsList(list);
				setCacheLocal(Number(data.id), Number(data.id), list);
				alert("Answer saved!");
			};

			// biome-ignore lint/correctness/noSwitchDeclarations:
			const loadCache = () => {
				const cache = getBookCacheLocal(Number(data.id));
				setQnsList(cache?.qnsans ?? []);
			};

			const updateButtonTimestamp = (index: number) => {
				setButtonClickTimestamps((prevTimestamps) => ({
					...prevTimestamps,
					[index]: Date.now(),
				}));
			};

			// biome-ignore lint/correctness/noSwitchDeclarations:
			const buttons = [
				<Button
					className="w-32 btn btn-info"
					onClick={() => {
						editBookDetailDialogRef.current?.showModal();
						updateButtonTimestamp(0);
					}}
					key="edit-details"
				>
					Edit Details
				</Button>,
				<Dialog key="chat-ai">
					<DialogTrigger>
						<Button onClick={() => {
							setQnsAnsOutput([]);
							updateButtonTimestamp(1);
						}}>Chat with AI</Button>
					</DialogTrigger>
					<DialogContent className="modal-box">
						<DialogHeader>Chat with AI</DialogHeader>
						<DialogDescription>
							{qnsAnsOutput.map((chat) => (
								<React.Fragment key={chat.isBot + chat.text}>
									<div className={"font-bold"}>{chat.isBot ? "Bot" : "User"}</div>
									<div>{chat.text}</div>
									<Separator />
								</React.Fragment>
							))}
						</DialogDescription>
						<Input
							type="text"
							id="ai_qns_Input"
							placeholder="Chat now"
							onKeyUp={qnsInputKeyEnter}
						/>
					</DialogContent>
				</Dialog>,
				<Dialog key="answer-questions">
					<DialogTrigger>
						<Button onClick={() => {
							loadCache();
							updateButtonTimestamp(2);
						}}>Answer Questions</Button>
					</DialogTrigger>
					<DialogContent className="modal-box">
						<DialogHeader className="text-lg font-bold">
							Answer Questions
						</DialogHeader>
						<DialogDescription className="py-4 flex flex-col">
							{qnsList.map((qnsans, index) => (
								<React.Fragment key={index}>
									{qnsans.ans ? null : (
										<Dialog>
											<DialogTrigger>
												<Button className={"w-full"}>{qnsans.qns}</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>{qnsans.qns}</DialogTitle>
													<DialogDescription className="py-4">
														Please answer this question.
													</DialogDescription>
													<DialogFooter>
														<Input
															type="text"
															id="ai_ans_input"
															placeholder="Please enter your answer"
															onKeyUp={(e) => ansInputKeyEnter(e, index)}
														/>
													</DialogFooter>
												</DialogHeader>
											</DialogContent>
										</Dialog>
									)}
								</React.Fragment>
							))}
						</DialogDescription>
					</DialogContent>
				</Dialog>,
			];

			const sortedButtons = [...buttons].sort((a, b) => {
				const indexA = buttons.indexOf(a);
				const indexB = buttons.indexOf(b);
				return (buttonClickTimestamps[indexB] || 0) - (buttonClickTimestamps[indexA] || 0);
			});

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
									<span className="pr-4 text-lg font-bold">
										Publication date:
									</span>
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
								<p>
									<span className="pr-4 text-lg font-bold">Description:</span>
									<Preview value={bookDetailsState?.description || data.description} />

								</p>
								<div className="flex flex-wrap gap-5">{sortedButtons}</div>
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