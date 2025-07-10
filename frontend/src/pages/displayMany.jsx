import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import NoPage from "./noPage";
import api from "../services/api";

import BookList from "../components/EntityLists/BookList";
import AuthorList from "../components/EntityLists/AuthorList.jsx";
import GenreList from "../components/EntityLists/GenreList.jsx";
import BookInstanceList from "../components/EntityLists/BookInstanceList.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import Paginator from "../components/common/Paginator.jsx";

export default function DisplayMany() {
	const [entities, setEntities] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [searchParams] = useSearchParams();
	const [totalCount, setTotalCount] = useState(0);
	const navigate = useNavigate();
	const { type } = useParams();

	// Build filter from search params
	const authorId = searchParams.get("author") || "";
	const genreId = searchParams.get("genre") || "";
	const bookId = searchParams.get("book") || "";

	const buildFilterString = () => {
		let filter = "";
		if (authorId) filter += `author=${authorId}&`;
		if (genreId) filter += `genre=${genreId}&`;
		if (bookId) filter += `book=${bookId}&`;
		return filter;
	};

	useEffect(() => {
		const validTypes = ["books", "genres", "authors", "bookinstances"];

		setLoading(true);

		const fetchData = async () => {
			try {
				if (!validTypes.includes(type)) {
					throw new Error("Invalid type");
				}

				const filterString = buildFilterString();
				console.log(`Fetching ${type} with filter: ${filterString}`);

				const response = await api.get(
					`/api/${type}?skip=${page - 1}&${filterString}limit=10`
				);

				console.log("API Response:", response.data);
				setEntities(response.data.data);
				setTotalCount(response.data.totalCount);
			} catch (err) {
				console.error("Error fetching data:", err);
				setError(err);
				setEntities(null); // Reset entities on error
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [type, page, authorId, genreId, bookId]);

	const handleCreateNew = () => {
		navigate("create");
	};

	if (loading || entities == null) return <LoadingState />;
	if (error) return <ErrorState message={error.message} />;

	// Return empty state when no entities found
	if (entities.length === 0) {
		const entityName =
			type && type.length > 0
				? type.charAt(0).toUpperCase() + type.slice(1)
				: "Items";
		return <EmptyState message={`No ${entityName} Found`} />;
	}

	// Create entity button text
	const getCreateButtonText = () => {
		switch (type) {
			case "books":
				return "Add a Book";
			case "authors":
				return "Add an Author";
			case "genres":
				return "Add a Genre";
			case "bookinstances":
				return "Add Another Book Instance";
			default:
				return "Add New";
		}
	};

	// Render the appropriate list component based on type
	const renderEntityList = () => {
		// Add a key that includes the type to force re-rendering
		switch (type) {
			case "books":
				return <BookList key={`books-list-${page}`} entities={entities} />;
			case "authors":
				return <AuthorList key={`authors-list-${page}`} entities={entities} />;
			case "genres":
				return <GenreList key={`genres-list-${page}`} entities={entities} />;
			case "bookinstances":
				return (
					<BookInstanceList
						key={`bookinstances-list-${page}`}
						entities={entities}
					/>
				);
			default:
				return <NoPage />;
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<button
				onClick={handleCreateNew}
				className="block w-full max-w-xs mx-auto mb-8 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-lg font-semibold rounded-lg shadow transition-colors duration-300"
			>
				{getCreateButtonText()}
			</button>

			{renderEntityList()}

			<Paginator
				currentPage={page}
				totalPages={Math.ceil(totalCount / 10)}
				onPageChange={setPage}
			/>
		</div>
	);
}
