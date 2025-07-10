import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import api from "../services/api.js"; // Your axios instance

const Chatbot = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false); // New loading state
	const chatWindowRef = useRef(null);

	// GSAP Animation for sliding in/out
	useEffect(() => {
		if (isOpen) {
			gsap.fromTo(
				chatWindowRef.current,
				{ x: "100%", opacity: 0 },
				{ x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
			);
		} else {
			gsap.to(chatWindowRef.current, {
				x: "100%",
				opacity: 0,
				duration: 0.3,
				ease: "power2.in",
			});
		}
	}, [isOpen]);

	const handleSend = async () => {
		if (!input.trim()) return;

		const userMessage = { text: input, sender: "user" };
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setLoading(true); // Start loading

		try {
			// API call to /rag/
			const response = await api.post("/rag/", {
				query: input,
			});

			const botMessage = {
				text: response.data.response || "Sorry, I couldn't find an answer.",
				sender: "bot",
			};
			setMessages((prev) => [...prev, botMessage]);
		} catch (error) {
			console.error("Chatbot API error:", error);
			const errorMessage = {
				text: "Oops, something went wrong. Try again later!",
				sender: "bot",
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setLoading(false); // Stop loading
		}
	};

	return (
		<div className="fixed bottom-6 right-6 z-50">
			{!isOpen && (
				<button
					onClick={() => setIsOpen(true)}
					className="bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors duration-200"
					aria-label="Open Chatbot"
				>
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
						/>
					</svg>
				</button>
			)}

			{isOpen && (
				<div
					ref={chatWindowRef}
					className="w-80 h-[400px] bg-[#1e2a38] rounded-lg shadow-xl flex flex-col text-white overflow-hidden"
				>
					{/* Header */}
					<div className="bg-orange-500 p-3 flex justify-between items-center">
						<span className="font-bold">Bookify Chatbot</span>
						<button
							onClick={() => setIsOpen(false)}
							className="text-white hover:text-gray-200"
							aria-label="Close Chatbot"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					{/* Messages */}
					<div className="flex-1 p-4 overflow-y-auto">
						{messages.map((msg, index) => (
							<div
								key={index}
								className={`mb-3 ${
									msg.sender === "user" ? "text-right" : "text-left"
								}`}
							>
								<span
									className={`inline-block p-2 rounded-lg ${
										msg.sender === "user"
											? "bg-orange-500 text-white"
											: "bg-gray-700 text-gray-200"
									}`}
								>
									{msg.text}
								</span>
							</div>
						))}
						{/* Typing Animation */}
						{loading && (
							<div className="text-left mb-3">
								<span className="inline-block p-2 rounded-lg bg-gray-700 text-gray-200">
									<div className="flex space-x-1">
										<div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce delay-0"></div>
										<div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce delay-100"></div>
										<div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce delay-200"></div>
									</div>
								</span>
							</div>
						)}
					</div>

					{/* Input */}
					<div className="p-3 bg-[#2a3b4c] flex gap-2">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && handleSend()}
							className="flex-1 p-2 rounded bg-gray-800 text-white border-none focus:outline-none focus:ring-2 focus:ring-orange-500"
							placeholder="Ask about books..."
							disabled={loading} // Disable input while loading
						/>
						<button
							onClick={handleSend}
							className="bg-orange-500 text-white p-2 rounded hover:bg-orange-600 transition-colors duration-200 disabled:bg-orange-300"
							disabled={loading} // Disable button while loading
						>
							Send
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default Chatbot;
