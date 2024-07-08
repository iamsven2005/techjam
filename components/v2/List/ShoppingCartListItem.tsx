import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { currentUserIdState, shoppingCartState } from "atoms";
import type { shoppingCartItemProps } from "const";
import { buyBook } from "lib/http";
import { calcCartItemTotalPrice, currencyFormat } from "lib/utils";
import Image from "next/image";
import { useSnackbar } from "notistack";
import * as React from "react";
import { useRecoilState } from "recoil";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function ShoppingCartListItem(props: shoppingCartItemProps) {
	const {
		id,
		title,
		authors,
		type,
		price,
		averageRating,
		quantity,
		stock,
		publishedAt,
	} = props;
	const [loading, setLoading] = React.useState(false);

	const [shoppingCart, setShoppingCart] = useRecoilState(shoppingCartState);
	const [currentUserId] = useRecoilState(currentUserIdState);

	const { enqueueSnackbar } = useSnackbar();

	function handleAddQty() {
		setShoppingCart((oldShoppingCart) => {
			return oldShoppingCart.reduce<shoppingCartItemProps[]>((prev, item) => {
				if (item.id === id) {
					prev.push({
						...item,
						quantity: quantity + 1,
					});
				} else {
					prev.push(item);
				}
				return prev;
			}, []);
		});
	}

	function handleRemoveQty() {
		setShoppingCart((oldShoppingCart) => {
			return oldShoppingCart.reduce<shoppingCartItemProps[]>((prev, item) => {
				if (item.id === id) {
					prev.push({
						...item,
						quantity: quantity - 1,
					});
				} else {
					prev.push(item);
				}
				return prev;
			}, []);
		});
	}

	function deleteItem() {
		setShoppingCart((oldShoppingCart) => {
			return [...oldShoppingCart.filter((i) => i.id !== id)];
		});
	}

	const handleBuyClick = async () => {
		setLoading(true);
		const response = await buyBook(id, {
			userID: currentUserId,
			quality: quantity,
		});
		if (response.error) {
			enqueueSnackbar(`Error: ${response.error}.`, {
				variant: "error",
			});
			setLoading(false);
			return;
		}
		enqueueSnackbar(`${response.content?.message}`, {
			variant: "success",
		});
		setLoading(false);
		setShoppingCart((oldShoppingCart) => {
			return oldShoppingCart.filter((i) => i.id !== id);
		});
	};

	return (
		<>
			<div className="shadow-xl card card-side bg-base-100">
				<figure>
					<Image
						src={`https://picsum.photos/seed/${id}/200/300`}
						alt={title}
						width={150}
						height={225}
					/>
				</figure>
				<div className="card-body">
					<div className="flex flex-col gap-1">
						<p>
							<span className="pr-4 text-lg font-bold">Title:</span>
							{title}
						</p>
						<p>
							<span className="pr-4 text-lg font-bold">Type:</span>
							{type.replaceAll(`_nbsp_`, ` `).replaceAll(`_amp_`, `&`)}
						</p>
						<p>
							<span className="pr-4 text-lg font-bold">Publication date:</span>
							{new Date(publishedAt).toLocaleDateString()}
						</p>
						<p>
							<span className="pr-4 text-lg font-bold">Price:</span>
							{`$ ${currencyFormat(price)}`}
						</p>
						<p>
							<span className="pr-4 text-lg font-bold">In stock:</span>
							{stock}
						</p>
						<div className="flex justify-between">
							<div className="join">
								<Button
									className="btn btn-sm join-item"
									disabled={quantity >= stock}
									onClick={handleAddQty}
								>
									<PlusIcon className="w-6 h-6 stroke-current shrink-0" />
								</Button>
								<Input
									className="w-12 Input Input-sm Input-bordered join-item"
									value={quantity}
									disabled
								/>
								<Button
									className="btn btn-sm join-item"
									disabled={quantity <= 1}
									onClick={handleRemoveQty}
								>
									<MinusIcon className="w-6 h-6 stroke-current shrink-0" />
								</Button>
							</div>
							<div className="flex justify-end gap-4">
								<div className="font-bold">
									<span className="pr-1">
										{quantity === 1
											? `(${quantity} item) $`
											: `(${quantity} items) $`}
									</span>
									{calcCartItemTotalPrice([props])}
								</div>
							</div>
						</div>
						<div className="flex justify-end gap-4">
							<Button className="btn btn-sm btn-error" onClick={deleteItem}>
								<TrashIcon className="w-6 h-6 stroke-current shrink-0" />
								Delete
							</Button>
							<Button
								className="btn btn-sm btn-info"
								onClick={handleBuyClick}
								disabled={loading}
							>
								{loading && <span className="loading loading-spinner" />}
								Proceed to Purchase
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}