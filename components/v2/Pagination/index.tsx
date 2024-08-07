import { Button } from "../ui/button";

export interface PaginationProps {
	currentPage: number;
	pages: number;
	onClick?: (page: number) => void;
}

export default function Pagination(props: PaginationProps) {
	const { currentPage, pages, onClick } = props;

	return (
		<div className="join">
			{new Array(pages).fill(0).map((_, idx) => {
				return (
					<Button
						key={idx}
						className={`join-item btn btn-sm ${
							idx + 1 === currentPage ? "btn-primary" : ""
						}`}
						onClick={() => {
							onClick && onClick(idx + 1);
						}}
					>
						{idx + 1}
					</Button>
				);
			})}
		</div>
	);
}