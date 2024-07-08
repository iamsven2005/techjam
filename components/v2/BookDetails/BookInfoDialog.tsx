import type { BookDetailProps } from "const";
import { updateBookDetails } from "lib/http";
import { checkIsValidInteger, currencyFormat } from "lib/utils";
import { useSnackbar } from "notistack";
import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export interface BookInfoDialogProps {
	data: BookDetailProps;
	id: string;
	onSuccess?: (data: BookDetailProps) => void;
}

const BookInfoDialog = React.forwardRef(
	(props: BookInfoDialogProps, ref: any) => {
		const { data, id, onSuccess } = props;

		const [isStockValid, setIsStockValid] = React.useState<boolean>(true);
		const [isUpdating, setIsUpdating] = React.useState<boolean>(false);
		const [stock, setStock] = React.useState<number>(data.stock);

		const { enqueueSnackbar } = useSnackbar();

		const handleUpdateStock = (e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			try {
				const isValid = checkIsValidInteger(value);
				if (isValid) {
					setIsStockValid(true);
					setStock(parseInt(value));
				} else {
					throw new Error("Invalid stock value");
				}
			} catch (error) {
				setIsStockValid(false);
			}
		};

		const handleUpdate = async (event: any) => {
			event.preventDefault();

			setIsUpdating(true);
			const res = await updateBookDetails(data.id, {
				stock: stock,
			});
			if (res.error) {
				enqueueSnackbar(`Error: Update book details.`, {
					variant: "error",
				});
				setIsUpdating(false);
				return;
			}
			enqueueSnackbar(`Book details was updated.`, {
				variant: "success",
			});
			res.content?.data && onSuccess && onSuccess(res.content.data);
			setIsUpdating(false);

			ref?.current?.close();
		};

		return (
			<dialog id={id} className="modal" ref={ref}>
				<form method="dialog" className="modal-box">
					<h3 className="text-lg font-bold">Edit Book Details</h3>
					<div className="w-full max-w-xs form-control">
						<label className="label">
							<span className="label-text">Book Type</span>
						</label>
						<Input
							type="text"
							className="w-full max-w-xs Input Input-sm Input-bordered"
							value={data.type}
							disabled
						/>
					</div>
					<div className="w-full max-w-xs form-control">
						<label className="label">
							<span className="label-text">Book Title</span>
						</label>
						<Input
							type="text"
							className="w-full max-w-xs Input Input-sm Input-bordered"
							value={data.title}
							disabled
						/>
					</div>
					<div className="w-full max-w-xs form-control">
						<label className="label">
							<span className="label-text">Publication Date</span>
						</label>
						<Input
							type="text"
							className="w-full max-w-xs Input Input-sm Input-bordered"
							value={new Date(data.publishedAt).toLocaleDateString()}
							disabled
						/>
					</div>
					<div className="w-full max-w-xs form-control">
						<label className="label">
							<span className="label-text">Price</span>
						</label>
						<Input
							type="text"
							className="w-full max-w-xs Input Input-sm Input-bordered"
							value={`$ ${currencyFormat(data.price)}`}
							disabled
						/>
					</div>
					<div className="w-full max-w-xs form-control">
						<label className="label">
							<span className="label-text">Stock</span>
						</label>
						<Input
							type="text"
							className="w-full max-w-xs Input Input-sm Input-bordered"
							defaultValue={data.stock}
							onChange={handleUpdateStock}
						/>
						{!isStockValid && (
							<label className="label">
								<span className="text-xs label-text-alt text-error">
									Invalid stock value
								</span>
							</label>
						)}
					</div>
					<div className="modal-action">
						{/* if there is a Button in form, it will close the modal */}
						<Button className="btn">Cancel</Button>
						<Button
							className="btn btn-info"
							disabled={!isStockValid || isUpdating || stock === data.stock}
							onClick={handleUpdate}
						>
							{isUpdating && <span className="loading loading-spinner" />}
							Update
						</Button>
					</div>
				</form>
			</dialog>
		);
	},
);

BookInfoDialog.displayName = "BookInfoDialog";

export default BookInfoDialog;