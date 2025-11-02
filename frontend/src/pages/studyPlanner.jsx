import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function StudyPlanUploader() {
	const [file, setFile] = useState(null);
	const [plan, setPlan] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleUpload = async () => {
		if (!file) return;
		setLoading(true);
		const formData = new FormData();
		formData.append("file", file);
		try {
			const res = await api.post("/api/study-plan/upload", formData);
			setPlan(res.data);
		} catch (error) {
			console.error("Upload failed:", error);
			alert("Failed to upload and generate study plan. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-blue-500 py-8 px-4">
			<div className="max-w-4xl mx-auto">
				{/* Upload Card */}
				<div className="bg-white rounded-lg shadow-xl p-6 mb-6">
					<h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
						Generate Study Plan
					</h2>
					<div className="flex flex-col md:flex-row gap-4 items-center justify-center">
						<input
							type="file"
							accept=".pdf"
							onChange={(e) => setFile(e.target.files?.[0] || null)}
							className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
						/>
						<button
							onClick={handleUpload}
							disabled={!file || loading}
							className={`px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md ${
								loading ? "opacity-60 cursor-not-allowed" : ""
							}`}
						>
							{loading && (
								<svg
									className="animate-spin h-5 w-5 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
									></path>
								</svg>
							)}
							{loading ? "Generating..." : "Upload & Generate"}
						</button>
					</div>
				</div>

				{/* Study Plan Results Card */}
				{plan && (
					<div className="bg-white rounded-lg shadow-xl p-6 overflow-hidden">
						<div className="mb-6">
							<h3 className="text-xl font-bold text-gray-800 mb-2">
								{plan.summary}
							</h3>
							<p className="text-gray-600">
								Explore recommended books for each topic extracted from your
								syllabus.
							</p>
						</div>

						<div className="space-y-6 max-h-96 overflow-y-auto">
							{Object.entries(plan.topics).map(([topic, books]) => (
								<div
									key={topic}
									className="border-b border-gray-200 pb-6 last:border-b-0"
								>
									<h4 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
										{topic}
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										{books.map((book) => (
											<div
												key={book.id}
												className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
											>
												<Link
													to={`/books/${book.id}`}
													className="block font-medium text-blue-600 hover:text-blue-800 mb-2 line-clamp-2"
													title={book.title}
												>
													{book.title}
												</Link>
												<p className="text-sm text-gray-600 mb-1">
													by {book.author}
												</p>
												<p className="text-xs text-gray-500 mb-2">
													{book.genre}
												</p>
												<div className="flex items-center justify-between">
													<span className="text-xs text-green-600 font-medium">
														Relevance:{" "}
														{((book.similarity - 1) * 100).toFixed(0)}%
													</span>
													<Link
														to={`/books/${book.id}`}
														className="text-xs text-blue-500 hover:underline"
													>
														View Details →
													</Link>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
