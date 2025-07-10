import { useNavigate } from "react-router-dom";
import { BsFillPencilFill, BsFillTrash3Fill } from "react-icons/bs";

export default function GenreList({ entities }) {
	const navigate = useNavigate();

	// Safety check if entities is null, undefined, or not an array
	if (!entities || !Array.isArray(entities)) {
		return <div>No genres available</div>;
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
			{entities.map((genre) => {
				// Check if genre and genre.name exist
				if (!genre || !genre.name) {
					console.error("Invalid genre object:", genre);
					return null; // Skip this item
				}

				return (
					<div
						key={genre.id}
						onClick={() => navigate(`/books/?genre=${genre.name}`)}
						className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
					>
						<div className="p-6 flex flex-col items-center">
							<div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
								<span className="text-2xl font-bold text-indigo-700">
									{genre.name.charAt(0).toUpperCase()}
								</span>
							</div>

							<h2 className="text-xl font-bold text-center text-gray-900 mb-4">
								{genre.name}
							</h2>

							<h2 className="text-md font-normal text-center text-gray-700 mb-1">
								{genre.description || "NA"}
							</h2>

							<div className="flex gap-4 mt-2">
								<button
									onClick={(e) => {
										e.stopPropagation();
										navigate(`${genre.id}/update`);
									}}
									className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full transition-colors duration-300"
									title="Edit"
								>
									<BsFillPencilFill />
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										navigate(`${genre.id}/delete`);
									}}
									className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition-colors duration-300"
									title="Delete"
								>
									<BsFillTrash3Fill />
								</button>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
