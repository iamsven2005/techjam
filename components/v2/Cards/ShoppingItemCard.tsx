import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { shoppingCartState } from "atoms";
import HalfRating from "components/v2/Rating/HalfRating";
import type { BookProps } from "const";
import { currencyFormat } from "lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useSnackbar } from "notistack";
import { useRecoilState } from "recoil";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function ShoopingItemCard(props: BookProps) {
	const {
		id,
		title,
		type,
		price,
		averageRating = 0,
		authors,
		ratings,
		stock,
	} = props;
	const [shoppingCart, setShoppingCart] = useRecoilState(shoppingCartState);

	const { enqueueSnackbar } = useSnackbar();

	const addItem = () => {
		setShoppingCart((oldShoppingCart) => {
			const existingItem = oldShoppingCart.find((i) => i.id === id);
			if (existingItem) {
				if (existingItem.quantity >= stock) {
					enqueueSnackbar(`Out of stock!`, { variant: "error" });
					return [...oldShoppingCart];
				}
				const newItem = {
					...existingItem,
					quantity: existingItem.quantity + 1,
				};
				enqueueSnackbar(`"${title}" was successfully added.`, {
					variant: "success",
				});
				return [...oldShoppingCart.filter((i) => i.id !== id), newItem];
			}
			enqueueSnackbar(`"${title}" was successfully added.`, {
				variant: "success",
			});
			return [
				...oldShoppingCart,
				{
					...props,
					quantity: 1,
				},
			];
		});
	};

	return (
		<Card className="shadow-xl card card-compact w-96 bg-base-100">
			<CardHeader>
				<Image
					src={`https://picsum.photos/seed/${id}/384/140`}
					alt={title}
					width={384}
					height={140}
				/>
			</CardHeader>
			<CardContent className="card-body">
				<div className="text-sm text-slate-500">
					{" "}
					{type.replaceAll(`_nbsp_`, ` `).replaceAll(`_amp_`, `&`)}
				</div>
				<CardTitle className="card-title">{title}</CardTitle>
				<p className="font-medium text-slate-500">
					{authors.map((author) => author.author.name).join(`, `)}
				</p>
				<HalfRating rating={averageRating} disabled />
				<div className="flex gap-5 m-5">
					<Button className="btn" onClick={addItem}>
						${currencyFormat(price)}
						<ShoppingCartIcon className="w-6 h-6" />
					</Button>
					<Link href={`/book/${id}`}>
						<Button>View Details</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}