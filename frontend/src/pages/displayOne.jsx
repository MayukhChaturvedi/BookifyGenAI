import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsFillPencilFill, BsFillTrash3Fill } from "react-icons/bs";
import bookLogo from "../assets/book.jpg";
import authorLogo from "../assets/author.jpg";
import api from "../services/api.js";
import NoPage from "./noPage";

// Action buttons component for reuse
const ActionButtons = ({ onUpdate, onDelete }) => (
	<div className="flex flex-row md:flex-col justify-end gap-4 md:justify-evenly">
		<button
			onClick={onUpdate}
			className="p-2 rounded-full transition-colors hover:text-orange-500 hover:bg-orange-50"
			aria-label="Edit"
		>
			<BsFillPencilFill className="h-5 w-5" />
		</button>
		<button
			onClick={onDelete}
			className="p-2 rounded-full transition-colors hover:text-red-500 hover:bg-red-50"
			aria-label="Delete"
		>
			<BsFillTrash3Fill className="h-5 w-5" />
		</button>
	</div>
);

// Loading state component
const LoadingState = () => (
	<div className="max-w-full bg-white rounded-lg shadow-md m-5 p-6">
		<div className="flex animate-pulse">
			<div className="h-32 w-24 bg-gray-200 rounded mr-6"></div>
			<div className="space-y-4 flex-1">
				<div className="h-8 w-3/4 bg-gray-200 rounded"></div>
				<div className="h-4 w-2/3 bg-gray-200 rounded"></div>
				<div className="h-4 w-1/2 bg-gray-200 rounded"></div>
				<div className="h-4 w-full bg-gray-200 rounded"></div>
			</div>
		</div>
	</div>
);

// Error state component
const ErrorState = ({ message }) => (
	<div className="max-w-full bg-white rounded-lg shadow-md m-5 p-6 border border-red-200">
		<p className="text-red-500">Error occurred: {message}</p>
	</div>
);

// Book display component
const BookDisplay = ({ book, onUpdate, onDelete }) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
		className="max-w-full bg-white rounded-lg shadow-md m-5 overflow-hidden"
	>
		<div className="p-6 flex flex-col md:flex-row">
			<motion.img
				whileHover={{ scale: 1.05 }}
				transition={{ duration: 0.2 }}
				src={bookLogo}
				className="w-full max-w-32 md:max-w-40 object-cover rounded mb-4 md:mb-0 md:mr-6"
				alt={book.title}
			/>
			<div className="flex flex-col flex-1">
				<h2 className="text-3xl font-bold mb-4 text-center md:text-left">
					{book.title}
				</h2>
				<p className="my-2 font-serif text-lg">
					<span className="font-medium">Author:</span> {book.author}
				</p>
				<p className="my-2 font-serif text-lg">
					<span className="font-medium">Genre:</span> {book.genre}
				</p>
				<p className="my-4 font-serif text-lg text-justify">
					<span className="font-medium">Summary:</span> {book.summary}
				</p>
			</div>
			<ActionButtons onUpdate={onUpdate} onDelete={onDelete} />
		</div>
	</motion.div>
);

// Author display component
const AuthorDisplay = ({ author, onUpdate, onDelete }) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
		className="max-w-full bg-white rounded-lg shadow-md m-5 overflow-hidden"
	>
		<div className="p-6 flex flex-col md:flex-row">
			<motion.img
				whileHover={{ scale: 1.05 }}
				transition={{ duration: 0.2 }}
				src={authorLogo}
				className="w-full max-w-32 md:max-w-40 object-cover rounded mb-4 md:mb-0 md:mr-6"
				alt={author.name}
			/>
			<div className="flex flex-col flex-1 items-center md:items-start">
				<h2 className="text-3xl font-bold mb-4">{author.name}</h2>
				<div className="space-y-2 text-lg">
					<p>
						<span className="font-medium">Bio:</span>{" "}
						{author.bio || "Not Available"}
					</p>
				</div>
			</div>
			<ActionButtons onUpdate={onUpdate} onDelete={onDelete} />
		</div>
	</motion.div>
);

// Genre display component
const GenreDisplay = ({ genre, onUpdate, onDelete }) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
		className="max-w-md mx-auto bg-white rounded-lg shadow-md m-5 overflow-hidden"
	>
		<div className="p-6">
			<h2 className="text-3xl font-bold text-center mb-4">{genre.name}</h2>
			<p className="text-lg text-center mb-4">{genre.description}</p>
			<div className="flex justify-center">
				<ActionButtons onUpdate={onUpdate} onDelete={onDelete} />
			</div>
		</div>
	</motion.div>
);

// Book instance display component
const BookInstanceDisplay = ({ bookInstance, onUpdate, onDelete }) => {
	// Function to determine status badge color
	const getStatusColor = (status) => {
		switch (status.toLowerCase()) {
			case "available":
				return "bg-green-100 text-green-800";
			case "maintenance":
				return "bg-yellow-100 text-yellow-800";
			case "loaned":
				return "bg-blue-100 text-blue-800";
			case "reserved":
				return "bg-purple-100 text-purple-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="max-w-full bg-white rounded-lg shadow-md m-5 overflow-hidden"
		>
			<div className="p-6 flex flex-col md:flex-row">
				<motion.img
					whileHover={{ scale: 1.05 }}
					transition={{ duration: 0.2 }}
					src={bookLogo}
					className="w-full max-w-32 md:max-w-40 object-cover rounded mb-4 md:mb-0 md:mr-6"
					alt={bookInstance.book}
				/>
				<div className="flex flex-col flex-1">
					<h2 className="text-3xl font-bold mb-4 text-center md:text-left">
						{bookInstance.book || "Unknown Book"}
					</h2>
					<div className="space-y-3 text-lg">
						<p className="flex items-center">
							<span className="font-medium mr-2">Status:</span>
							<span
								className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
									bookInstance.status
								)}`}
							>
								{bookInstance.status}
							</span>
						</p>
						<p>
							<span className="font-medium">Due date:</span>{" "}
							<span className="font-mono">{bookInstance.due_date || "NA"}</span>
						</p>
					</div>
				</div>
				<ActionButtons onUpdate={onUpdate} onDelete={onDelete} />
			</div>
		</motion.div>
	);
};

// Main component
export default function DisplayOne() {
	const [item, setItem] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const { type, id } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const validTypes = ["books", "genres", "authors", "bookinstances"];
				if (!validTypes.includes(type)) {
					throw new Error("Invalid type");
				}

				const data = await api(`/api/${type}/${id}`);
				setItem(data.data);
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id, type]);

	const handleUpdate = () => navigate("update");
	const handleDelete = () => navigate("delete");

	if (loading) {
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState message={error.message} />;
	}

	if (!item) {
		return <NoPage />;
	}

	// Render the appropriate component based on type
	switch (type) {
		case "books":
			return (
				<BookDisplay
					book={item}
					onUpdate={handleUpdate}
					onDelete={handleDelete}
				/>
			);
		case "authors":
			return (
				<AuthorDisplay
					author={item}
					onUpdate={handleUpdate}
					onDelete={handleDelete}
				/>
			);
		case "genres":
			return (
				<GenreDisplay
					genre={item}
					onUpdate={handleUpdate}
					onDelete={handleDelete}
				/>
			);
		case "bookinstances":
			return (
				<BookInstanceDisplay
					bookInstance={item}
					onUpdate={handleUpdate}
					onDelete={handleDelete}
				/>
			);
		default:
			return <NoPage />;
	}
}
