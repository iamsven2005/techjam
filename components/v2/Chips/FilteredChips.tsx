import { XMarkIcon } from "@heroicons/react/24/outline";
import type { SetterOrUpdater } from "recoil";

export function Chip(props: any) {
	const { label, onDelete } = props;

	return (
		<div className="gap-2 cursor-default badge badge-ghost">
			{label}
			<XMarkIcon
				className="inline-block w-4 h-4 cursor-pointer stroke-current"
				onClick={onDelete}
				tabIndex={0}
			/>
		</div>
	);
}

export const FilteredChips = (props: {
	data: { page: number; type: string; sort: string; size: number };
	onChange: SetterOrUpdater<{
		page: number;
		type: string;
		sort: string;
		size: number;
	}>;
}) => {
	const { data, onChange } = props;
	const handleDelete = (key: "type" | "sort") => {
		onChange((originData) => ({ ...originData, [key]: "" }));
	};
	return (
		<div className="flex flex-wrap items-center justify-start gap-2 pb-4">
			{data.type && (
				<Chip
					label={`Type: ${data.type
						.replaceAll(`_nbsp_`, ` `)
						.replaceAll(`_amp_`, `&`)}`}
					onDelete={() => {
						handleDelete("type");
					}}
				/>
			)}
			{data.sort && (
				<Chip
					label={`Sort: ${data.sort}`}
					onDelete={() => {
						handleDelete("sort");
					}}
				/>
			)}
		</div>
	);
};