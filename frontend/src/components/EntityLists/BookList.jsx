import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import bookLogo from "../../assets/book.jpg";
import { BsFillPencilFill, BsFillTrash3Fill } from "react-icons/bs";
import { FaMagnifyingGlass } from "react-icons/fa6";

export default function BookList({ entities }) {
	const navigate = useNavigate();

	return (
		<div className="bg-white rounded-lg shadow-lg overflow-hidden">
			{entities.map((book) => (
				<Fragment key={book.id + "frag"}>
					<div
						key={book.id}
						onClick={() => navigate(`${book.id}`)}
						className="p-4 hover:bg-indigo-50 transition-colors duration-300 flex flex-wrap sm:flex-nowrap items-center gap-4 cursor-pointer"
					>
						<div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
							<img
								src={bookLogo}
								className="w-full h-full object-cover"
								alt={book.title}
							/>
						</div>

						<div className="flex-grow">
							<h2 className="text-xl font-bold text-gray-900 mb-2">
								{book.title}
							</h2>
							<p className="text-gray-600 line-clamp-2">{book.summary}</p>
						</div>

						<div className="flex sm:flex-col gap-4 ml-auto">
							<button
								onClick={(e) => {
									navigate(`${book.id}/update`);
									e.stopPropagation();
								}}
								className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full transition-colors duration-300"
								title="Edit"
							>
								<BsFillPencilFill />
							</button>
							<button
								onClick={(e) => {
									navigate(`${book.id}/delete`);
									e.stopPropagation();
								}}
								className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition-colors duration-300"
								title="Delete"
							>
								<BsFillTrash3Fill />
							</button>
							<button
								onClick={(e) => {
									navigate(`/bookinstances/?book=${book.id}`);
									e.stopPropagation();
								}}
								className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full transition-colors duration-300"
								title="View Instances"
							>
								<FaMagnifyingGlass />
							</button>
						</div>
					</div>
					<div className="h-px bg-gray-200 mx-4 last:hidden"></div>
				</Fragment>
			))}
		</div>
	);
}
