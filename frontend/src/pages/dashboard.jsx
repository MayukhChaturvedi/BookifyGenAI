import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import libraryImg from "../assets/libraryImg.jpg";
import AuthContext from "../context/authContext";
import { FaBook, FaUserEdit, FaBookmark, FaBookOpen } from "react-icons/fa";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Dashboard = () => {
	const { auth } = useContext(AuthContext);
	const [scrolled, setScrolled] = useState(false);

	// Refs for elements to animate
	const titleRef = useRef(null);
	const buttonContainerRef = useRef(null);
	const welcomeMessageRef = useRef(null);
	const overlayRef = useRef(null);
	const featureSectionRef = useRef(null);
	const card1Ref = useRef(null);
	const card2Ref = useRef(null);
	const card3Ref = useRef(null);
	const card4Ref = useRef(null);
	const scrollPromptRef = useRef(null);

	useEffect(() => {
		// Animate the overlay opacity
		gsap.fromTo(
			overlayRef.current,
			{ opacity: 0 },
			{ opacity: 0.7, duration: 1.5, ease: "power2.out" }
		);

		// Animate the title
		gsap.fromTo(
			titleRef.current,
			{ y: 50, opacity: 0 },
			{ y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.3 }
		);

		// Animate buttons or welcome message
		if (!auth.token) {
			gsap.fromTo(
				buttonContainerRef.current,
				{ y: 30, opacity: 0 },
				{ y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.8 }
			);
		} else {
			gsap.fromTo(
				welcomeMessageRef.current,
				{ scale: 0.8, opacity: 0 },
				{
					scale: 1,
					opacity: 1,
					duration: 1,
					ease: "elastic.out(1, 0.5)",
					delay: 0.8,
				}
			);
		}

		// Scroll prompt animation
		gsap.fromTo(
			scrollPromptRef.current,
			{ y: 0, opacity: 0.7 },
			{
				y: 10,
				opacity: 1,
				duration: 1.5,
				repeat: -1,
				yoyo: true,
				ease: "power1.inOut",
				delay: 2,
			}
		);

		// Feature cards animation with scroll trigger
		const cards = [card1Ref, card2Ref, card3Ref, card4Ref];

		cards.forEach((card, index) => {
			gsap.fromTo(
				card.current,
				{
					y: 50,
					opacity: 0,
					scale: 0.9,
				},
				{
					y: 0,
					opacity: 1,
					scale: 1,
					duration: 0.8,
					ease: "back.out(1.7)",
					scrollTrigger: {
						trigger: featureSectionRef.current,
						start: "top 80%",
						toggleActions: "play none none none",
					},
					delay: 0.2 * index,
				}
			);
		});

		// Handle scroll detection for sticky navbar
		const handleScroll = () => {
			if (window.scrollY > 100) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [auth.token]);

	return (
		<div className="relative w-full min-h-screen overflow-x-hidden">
			{/* Hero Section */}
			<div className="relative h-screen overflow-hidden">
				{/* Background Image */}
				<div className="absolute inset-0">
					<img
						src={libraryImg}
						className="w-full h-full object-cover transform scale-105 transition-transform duration-300"
						alt="Library Background"
					/>
				</div>

				{/* Overlay with animated opacity */}
				<div
					ref={overlayRef}
					className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 z-10"
				></div>

				{/* Content */}
				<div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
					{/* Animated Title */}
					<h1
						ref={titleRef}
						className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-center mb-6 tracking-tight drop-shadow-lg"
					>
						Welcome to <span className="text-orange-500">Bookify!</span>
					</h1>

					<p className="text-xl md:text-2xl text-center max-w-3xl mb-10 px-4 text-gray-200">
						Your complete library management system for organizing books,
						authors, genres, and more.
					</p>

					{/* Conditional Rendering for Authenticated/Unauthenticated Users */}
					{!auth.access && (
						<div ref={buttonContainerRef} className="flex space-x-6">
							<Link
								to="/login"
								className="relative bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
							>
								<span className="relative z-10">Login</span>
								<div className="absolute inset-0 bg-blue-500 opacity-0 hover:opacity-30 rounded-lg transition-opacity duration-300"></div>
							</Link>
							<Link
								to="/register"
								className="relative bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
							>
								<span className="relative z-10">Sign Up</span>
								<div className="absolute inset-0 bg-green-500 opacity-0 hover:opacity-30 rounded-lg transition-opacity duration-300"></div>
							</Link>
						</div>
					)}

					{auth.access && (
						<div
							ref={welcomeMessageRef}
							className="flex flex-col items-center gap-6"
						>
							<p className="text-2xl md:text-3xl font-semibold text-center bg-black/30 py-4 px-8 rounded-lg backdrop-blur-sm">
								Welcome back! Explore your library.
							</p>
							<div className="flex flex-wrap gap-4 justify-center">
								<Link
									to="/books"
									className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
								>
									<FaBook />
									<span>Browse Books</span>
								</Link>
								<Link
									to="/authors"
									className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
								>
									<FaUserEdit />
									<span>View Authors</span>
								</Link>
							</div>
						</div>
					)}

					{/* Scroll indicator */}
					<div
						ref={scrollPromptRef}
						className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
					>
						<p className="text-gray-200 mb-2 font-medium text-lg">
							Scroll to explore
						</p>
						<svg
							className="w-6 h-6 text-orange-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 14l-7 7m0 0l-7-7m7 7V3"
							/>
						</svg>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div
				ref={featureSectionRef}
				className="relative z-20 py-20 px-6 bg-gradient-to-b from-[#111924] to-[#192338]"
			>
				<div className="max-w-7xl mx-auto">
					<h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">
						Manage Your <span className="text-orange-500">Entire Library</span>{" "}
						With Ease
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{/* Card 1 - Authors */}
						<div
							ref={card1Ref}
							className="bg-gradient-to-br from-indigo-900/70 to-indigo-800/60 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-indigo-700/40 hover:shadow-indigo-500/20 hover:border-indigo-500/50 transition-all duration-300"
						>
							<div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-indigo-600/20">
								<FaUserEdit className="text-white text-2xl" />
							</div>
							<h3 className="text-xl font-bold text-white text-center mb-4">
								Authors
							</h3>
							<p className="text-gray-300 text-center">
								Track and manage all authors with complete biographical
								information and linked works.
							</p>
							<div className="mt-6 text-center">
								<Link
									to="/authors"
									className="inline-block text-indigo-300 hover:text-indigo-200 font-medium hover:underline"
								>
									Browse Authors
								</Link>
							</div>
						</div>

						{/* Card 2 - Genres */}
						<div
							ref={card2Ref}
							className="bg-gradient-to-br from-green-900/70 to-green-800/60 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-green-700/40 hover:shadow-green-500/20 hover:border-green-500/50 transition-all duration-300"
						>
							<div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-green-600/20">
								<FaBookmark className="text-white text-2xl" />
							</div>
							<h3 className="text-xl font-bold text-white text-center mb-4">
								Genres
							</h3>
							<p className="text-gray-300 text-center">
								Organize your collection by genres to make searching and
								discovery easier.
							</p>
							<div className="mt-6 text-center">
								<Link
									to="/genres"
									className="inline-block text-green-300 hover:text-green-200 font-medium hover:underline"
								>
									Explore Genres
								</Link>
							</div>
						</div>

						{/* Card 3 - Books */}
						<div
							ref={card3Ref}
							className="bg-gradient-to-br from-orange-900/70 to-orange-800/60 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-orange-700/40 hover:shadow-orange-500/20 hover:border-orange-500/50 transition-all duration-300"
						>
							<div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-orange-600/20">
								<FaBook className="text-white text-2xl" />
							</div>
							<h3 className="text-xl font-bold text-white text-center mb-4">
								Books
							</h3>
							<p className="text-gray-300 text-center">
								Catalog all your books with detailed information including
								summaries, publication dates, and more.
							</p>
							<div className="mt-6 text-center">
								<Link
									to="/books"
									className="inline-block text-orange-300 hover:text-orange-200 font-medium hover:underline"
								>
									View Books
								</Link>
							</div>
						</div>

						{/* Card 4 - Book Instances */}
						<div
							ref={card4Ref}
							className="bg-gradient-to-br from-blue-900/70 to-blue-800/60 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-blue-700/40 hover:shadow-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
						>
							<div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-600/20">
								<FaBookOpen className="text-white text-2xl" />
							</div>
							<h3 className="text-xl font-bold text-white text-center mb-4">
								Book Instances
							</h3>
							<p className="text-gray-300 text-center">
								Track individual copies of books, their availability status, and
								lending history.
							</p>
							<div className="mt-6 text-center">
								<Link
									to="/bookinstances"
									className="inline-block text-blue-300 hover:text-blue-200 font-medium hover:underline"
								>
									Check Availability
								</Link>
							</div>
						</div>
					</div>

					{/* CTA Section */}
					<div className="mt-20 text-center">
						<h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
							Ready to organize your library?
						</h3>
						{!auth.access ? (
							<Link
								to="/register"
								className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-10 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
							>
								Get Started Now
							</Link>
						) : (
							<Link
								to="/books/create"
								className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-10 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
							>
								Add New Book
							</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
