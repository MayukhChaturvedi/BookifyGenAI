export default function ErrorState({ message }) {
	return (
		<div className="max-w-full sm:max-w-2xl bg-white rounded-lg shadow-md p-8 my-8 mx-auto text-center border-l-4 border-red-500">
			<svg
				className="w-12 h-12 text-red-500 mx-auto mb-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
			<h2 className="text-xl font-bold text-gray-800 mb-2">Error Occurred</h2>
			<p className="text-gray-600 font-mono">{message}</p>
		</div>
	);
}
