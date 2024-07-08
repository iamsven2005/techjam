import HalfRating from "components/v2/Rating/HalfRating";
import { addRatingByBookID } from "lib/http";
import NextRouter from "next/router";
import { useSnackbar } from "notistack";
import * as React from "react";
import { Button } from "../ui/button";

export interface BookAddRatingDialog {
	bookId: string;
}

const BookAddRatingDialog = React.forwardRef(
	(props: BookAddRatingDialog, ref: any) => {
		const { bookId } = props;
		const [loading, setLoading] = React.useState(false);
		const [value, setValue] = React.useState<number | null>(null);

		const { enqueueSnackbar } = useSnackbar();

		const handleChange = (newValue: number | null) => {
			setValue(newValue);
		};

		const handleClose = () => {
			ref?.current?.close();
		};

		const handleAdd = async (e: any) => {
			e.preventDefault();

			setLoading(true);
			const response = await addRatingByBookID(props.bookId, {
				score: value as number,
			});
			if (response.error) {
				enqueueSnackbar(`Error: Add rating.`, {
					variant: "error",
				});
				setLoading(false);
				handleClose();
				return;
			}
			enqueueSnackbar(`The rating was successfully added.`, {
				variant: "success",
			});
			setLoading(false);
			handleClose();
			NextRouter.reload();
		};

		return (
			<dialog id={bookId} className="modal" ref={ref}>
				<form method="dialog" className="p-5 m-5 modal-box">
					<h3 className="pb-6 text-lg font-bold">Add Rating</h3>
					<HalfRating onChange={handleChange} />
					<span className="pl-2">{value}</span>

					<div className="modal-action">
						{/* if there is a Button in form, it will close the modal */}
						<Button className="btn">Cancel</Button>
						<Button
							className="btn btn-error"
							disabled={loading || !value}
							onClick={handleAdd}
						>
							{loading && <span className="loading loading-spinner" />}
							Save
						</Button>
					</div>
				</form>
			</dialog>
		);
	},
);

BookAddRatingDialog.displayName = "BookAddRatingDialog";

export default BookAddRatingDialog;