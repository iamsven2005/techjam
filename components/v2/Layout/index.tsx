import Header, { type HeaderProps } from "components/v2/Layout/Header";

export interface CommonLayoutProps {
	children?: any;
	headerProps?: HeaderProps;
}

export default function CommonLayout(props: CommonLayoutProps) {
	const { headerProps, children } = props;

	return (
		<>
			<div className="min-h-full">
				<Header {...headerProps} />

				<main>
					<div className="px-4 py-6 mx-auto max-w-7xl">
						{/* Your content */}
						{children}
					</div>
				</main>
			</div>
		</>
	);
}