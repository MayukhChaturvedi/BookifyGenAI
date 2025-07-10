export default function LoadingState() {
	return (
		<div className="max-w-full sm:max-w-2xl bg-white rounded-lg shadow-md p-8 my-8 mx-auto text-center">
			<div className="animate-pulse flex flex-col items-center">
				<div className="h-12 w-12 rounded-full bg-indigo-200 mb-4"></div>
				<div className="h-4 w-32 bg-indigo-200 rounded mb-4"></div>
				<div className="h-3 w-48 bg-gray-200 rounded mb-2"></div>
				<div className="h-3 w-40 bg-gray-200 rounded"></div>
			</div>
			<p className="mt-4 text-gray-600 font-medium">Loading content...</p>
		</div>
	);
}
