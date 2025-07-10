import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import bookLogo from "../../assets/book.jpg";
import { BsFillPencilFill, BsFillTrash3Fill } from "react-icons/bs";

export default function BookInstanceList({ entities }) {
	const navigate = useNavigate();

	const getStatusBadge = (status) => {
		const statusStyles = {
			Available: "bg-green-100 text-green-800",
			CheckedOut: "bg-blue-100 text-blue-800",
			Reserved: "bg-purple-100 text-purple-800",
			default: "bg-gray-100 text-gray-800",
		};

		const style = statusStyles[status] || statusStyles.default;

		return (
			<span
				className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
			>
				{status}
			</span>
		);
	};

	const formatDate = (dateString) => {
		if (!dateString) return "Not specified";
		return new Date(dateString).toLocaleDateString(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<div className="bg-white rounded-lg shadow-lg overflow-hidden">
			{entities.map((instance) => (
				<Fragment key={instance.id + "frag"}>
					<div
						key={instance.id}
						onClick={() => navigate(`${instance.id}`)}
						className="p-4 hover:bg-indigo-50 transition-colors duration-300 flex flex-wrap sm:flex-nowrap items-center gap-4 cursor-pointer"
					>
						<div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
							<img
								src={bookLogo}
								className="w-full h-full object-cover"
								alt={instance.book || "Book"}
							/>
						</div>

						<div className="flex-grow">
							<h2 className="text-xl font-bold text-gray-900 mb-2">
								{instance.book || "Unknown Book"}
							</h2>
							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-2">
									<span className="text-gray-500">Status:</span>
									{getStatusBadge(instance.status)}
								</div>
								<p className="text-gray-600">
									Due back: {formatDate(instance.due_date)}
								</p>
							</div>
						</div>

						<div className="flex sm:flex-col gap-4 ml-auto">
							<button
								onClick={(e) => {
									navigate(`${instance.id}/update`);
									e.stopPropagation();
								}}
								className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full transition-colors duration-300"
								title="Edit"
							>
								<BsFillPencilFill />
							</button>
							<button
								onClick={(e) => {
									navigate(`${instance.id}/delete`);
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
