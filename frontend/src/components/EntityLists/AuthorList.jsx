import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import authorLogo from "../../assets/author.jpg";
import { BsFillPencilFill, BsFillTrash3Fill } from "react-icons/bs";

export default function AuthorList({ entities }) {
	const navigate = useNavigate();

	// const formatDate = (dateString) => {
	// 	if (!dateString) return "NA";
	// 	return new Date(dateString).toLocaleDateString(undefined, {
	// 		year: "numeric",
	// 		month: "long",
	// 		day: "numeric",
	// 	});
	// };

	return (
		<div className="bg-white rounded-lg shadow-lg overflow-hidden">
			{entities.map((author) => (
				<Fragment key={author.id + "frag"}>
					<div
						key={author.id}
						onClick={() => navigate(`/books/?author=${author.name}`)}
						className="p-4 hover:bg-indigo-50 transition-colors duration-300 flex flex-wrap sm:flex-nowrap items-center gap-4 cursor-pointer"
					>
						<div className="w-24 h-24 flex-shrink-0 rounded-full overflow-hidden">
							<img
								src={authorLogo}
								className="w-full h-full object-cover"
								alt={author.name}
							/>
						</div>

						<div className="flex-grow">
							<h2 className="text-xl font-bold text-gray-900 mb-2">
								{author.name}
							</h2>
							<div className="text-gray-600">
								<p>Bio: {author.bio || "NA"}</p>
							</div>
						</div>

						<div className="flex sm:flex-col gap-4 ml-auto">
							<button
								onClick={(e) => {
									navigate(`${author.id}/update`);
									e.stopPropagation();
								}}
								className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full transition-colors duration-300"
								title="Edit"
							>
								<BsFillPencilFill />
							</button>
							<button
								onClick={(e) => {
									navigate(`${author.id}/delete`);
									e.stopPropagation();
								}}
								className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition-colors duration-300"
								title="Delete"
							>
								<BsFillTrash3Fill />
							</button>
						</div>
					</div>
					<div className="h-px bg-gray-200 mx-4 last:hidden"></div>
				</Fragment>
			))}
		</div>
	);
}
