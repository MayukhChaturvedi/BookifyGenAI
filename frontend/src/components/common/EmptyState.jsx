export default function EmptyState({ message }) {
	return (
		<div className="max-w-full sm:max-w-2xl bg-white rounded-lg shadow-md p-8 my-8 mx-auto text-center">
			<svg
				className="w-16 h-16 text-gray-400 mx-auto mb-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
				></path>
			</svg>
			<h2 className="text-xl font-bold text-gray-800 mb-2">{message}</h2>
			<p className="text-gray-600">
				Try adding a new item or adjusting your filters.
			</p>
		</div>
	);
}
