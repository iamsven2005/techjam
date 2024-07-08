import type { BookDetailProps } from "const";
import { updateBookDetails } from "lib/http";
import { checkIsValidInteger, currencyFormat } from "lib/utils";
import { useSnackbar } from "notistack";
import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Editor } from "../Rating/editor";

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
        const [description, setDescription] = React.useState<string>(data.description);
        const [title, setTitle] = React.useState<string>(data.title);
        const [type, setType] = React.useState<string>(data.type);
        const [publishedAt, setPublishedAt] = React.useState<string>(data.publishedAt);
        const [price, setPrice] = React.useState<string>(data.price);

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

        const handleUpdateDescription = (value: string) => {
            setDescription(value);
        };

        const handleUpdateTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
            setTitle(e.target.value);
        };

        const handleUpdatePublishDate = (e: React.ChangeEvent<HTMLInputElement>) => {
            setPublishedAt(e.target.value);
        };

        const handleUpdatePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
            setPrice(e.target.value);
        };

        const handleUpdate = async (event: React.FormEvent) => {
            event.preventDefault();

            setIsUpdating(true);
            const res = await updateBookDetails(data.id, {
                stock: stock,
                description: description,
                publishedAt: publishedAt,
                title: title,
                type: type,
                price: price,
            });
            if (res.error) {
                enqueueSnackbar(`Error: Update book details.`, {
                    variant: "error",
                });
                setIsUpdating(false);
                return;
            }
            enqueueSnackbar(`Book details were updated.`, {
                variant: "success",
            });
            res.content?.data && onSuccess && onSuccess(res.content.data);
            setIsUpdating(false);

            ref?.current?.close();
        };

        const formatDate = (date: string) => {
            const d = new Date(date);
            const month = `${d.getMonth() + 1}`.padStart(2, '0');
            const day = `${d.getDate()}`.padStart(2, '0');
            const year = d.getFullYear();
            return `${year}-${month}-${day}`;
        };

        return (
            <dialog id={id} className="modal" ref={ref}>
                <form method="dialog" className="m-5 p-5">
                    <h3 className="text-lg font-bold">Edit Book Details</h3>
                    <div className="w-full max-w-xs ">
                        <label className="label">
                            <span className="label-text">Book Type</span>
                        </label>
                        <Input
                            type="text"
                            className="w-full max-w-xs Input Input-sm Input-bordered"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            disabled
                        />
                    </div>
                    <div className="w-full max-w-xs ">
                        <label className="label">
                            <span className="label-text">Book Title</span>
                        </label>
                        <Input
                            type="text"
                            className="w-full max-w-xs Input Input-sm Input-bordered"
                            value={title}
                            onChange={handleUpdateTitle}
                        />
                    </div>
                    <div className="w-full max-w-xs ">
                        <label className="label">
                            <span className="label-text">Publication Date</span>
                        </label>
                        <Input
                            type="date"
                            className="w-full max-w-xs Input Input-sm Input-bordered"
                            value={formatDate(publishedAt)}
                            onChange={handleUpdatePublishDate}
                        />
                    </div>
                    <div className="w-full max-w-xs ">
                        <label className="label">
                            <span className="label-text">Price</span>
                        </label>
                        <Input
                            type="text"
                            className="w-full max-w-xs Input Input-sm Input-bordered"
                            value={price}
                            onChange={handleUpdatePrice}
                        />
                    </div>
                    <div className="w-full max-w-xs ">
                        <label className="label">
                            <span className="label-text">Description</span>
                        </label>
                        <Editor
                            value={description}
                            onChange={handleUpdateDescription}
                        />
                    </div>
                    <div className="w-full max-w-xs ">
                        <label className="label">
                            <span className="label-text">Stock</span>
                        </label>
                        <Input
                            type="number"
                            className="w-full max-w-xs Input Input-sm Input-bordered"
                            value={stock}
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
