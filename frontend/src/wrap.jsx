import { useState, useContext } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import logo from "./assets/logo.png";
import {
	FaFacebook,
	FaInstagram,
	FaXTwitter,
	FaGithub,
	FaYoutube,
	FaLinkedin,
	FaBars,
} from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import authContext from "./context/authContext.jsx";
import Chatbot from "./components/Chatbot.jsx";
import PropTypes from "prop-types";

function Header() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { auth, logout } = useContext(authContext);
	const navigate = useNavigate();

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const handleLogout = () => {
		logout();
		navigate("/");
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	// Common nav item styles
	const navItemClasses =
		"hover:text-yellow-400 transform transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded";

	return (
		<header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-slate-700 shadow-lg">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16 lg:h-20">
					{/* Logo and Title */}
					<div className="flex items-center space-x-3">
						<img
							className="h-10 w-10 lg:h-12 lg:w-12"
							src={logo}
							alt="Bookify Logo"
						/>
						<h1 className="text-2xl lg:text-3xl font-extrabold text-orange-500 tracking-tight">
							Bookify
						</h1>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden lg:flex items-center space-x-8">
						<NavLink
							to="/"
							className={({ isActive }) =>
								`${navItemClasses} text-lg font-medium ${
									isActive
										? "text-yellow-400 underline underline-offset-4"
										: "text-slate-300"
								}`
							}
							onClick={closeMobileMenu}
						>
							Home
						</NavLink>
						<NavLink
							to="/authors"
							className={({ isActive }) =>
								`${navItemClasses} text-lg font-medium ${
									isActive
										? "text-yellow-400 underline underline-offset-4"
										: "text-slate-300"
								}`
							}
							onClick={closeMobileMenu}
						>
							Authors
						</NavLink>
						<NavLink
							to="/genres"
							className={({ isActive }) =>
								`${navItemClasses} text-lg font-medium ${
									isActive
										? "text-yellow-400 underline underline-offset-4"
										: "text-slate-300"
								}`
							}
							onClick={closeMobileMenu}
						>
							Genres
						</NavLink>
						<NavLink
							to="/books"
							className={({ isActive }) =>
								`${navItemClasses} text-lg font-medium ${
									isActive
										? "text-yellow-400 underline underline-offset-4"
										: "text-slate-300"
								}`
							}
							onClick={closeMobileMenu}
						>
							Books
						</NavLink>
						<NavLink
							to="/bookinstances"
							className={({ isActive }) =>
								`${navItemClasses} text-lg font-medium ${
									isActive
										? "text-yellow-400 underline underline-offset-4"
										: "text-slate-300"
								}`
							}
							onClick={closeMobileMenu}
						>
							Book Instances
						</NavLink>
						<NavLink
							to="/study-plan"
							className={({ isActive }) =>
								`${navItemClasses} text-lg font-medium ${
									isActive
										? "text-yellow-400 underline underline-offset-4"
										: "text-slate-300"
								}`
							}
							onClick={closeMobileMenu}
						>
							Study Plan
						</NavLink>
						<NavLink
							to="/contact"
							className={({ isActive }) =>
								`${navItemClasses} text-lg font-medium ${
									isActive
										? "text-yellow-400 underline underline-offset-4"
										: "text-slate-300"
								}`
							}
							onClick={closeMobileMenu}
						>
							Contact Us
						</NavLink>

						{/* Auth Buttons */}
						{auth?.access ? (
							<button
								onClick={handleLogout}
								className="flex items-center space-x-2 px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
								aria-label="Sign out"
							>
								<FaSignOutAlt className="h-4 w-4" />
								<span>Sign Out</span>
							</button>
						) : (
							<>
								<Link
									to="/login"
									className="px-4 py-2 text-slate-300 hover:text-yellow-400 font-medium transition-colors duration-200"
									onClick={closeMobileMenu}
								>
									Login
								</Link>
								<Link
									to="/register"
									className="px-4 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors duration-200 shadow-md hover:shadow-lg"
									onClick={closeMobileMenu}
								>
									Register
								</Link>
							</>
						)}
					</nav>

					{/* Mobile menu button */}
					<div className="lg:hidden flex items-center">
						<button
							onClick={toggleMobileMenu}
							className="text-slate-300 hover:text-yellow-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
							aria-label="Toggle navigation menu"
						>
							{isMobileMenuOpen ? (
								<FaTimes className="h-6 w-6" />
							) : (
								<FaBars className="h-6 w-6" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Navigation Overlay */}
			{isMobileMenuOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
					onClick={toggleMobileMenu}
				>
					<nav className="fixed left-0 top-0 h-full w-80 bg-gray-900 border-r border-slate-700 transform transition-transform duration-300 ease-in-out">
						<div className="flex items-center justify-between p-4 border-b border-slate-700">
							<div className="flex items-center space-x-3">
								<img className="h-8 w-8" src={logo} alt="Bookify Logo" />
								<h1 className="text-xl font-extrabold text-orange-500">
									Bookify
								</h1>
							</div>
							<button
								onClick={toggleMobileMenu}
								className="text-slate-300 hover:text-yellow-400"
								aria-label="Close menu"
							>
								<FaTimes className="h-6 w-6" />
							</button>
						</div>
						<ul className="flex flex-col space-y-4 p-6 mt-4">
							<li>
								<NavLink
									to="/"
									className={({ isActive }) =>
										`block py-2 px-3 rounded-md ${navItemClasses} text-lg font-medium ${
											isActive
												? "text-yellow-400 bg-yellow-400/10"
												: "text-slate-300"
										}`
									}
									onClick={closeMobileMenu}
								>
									Home
								</NavLink>
							</li>
							<li>
								<NavLink
									to="/authors"
									className={({ isActive }) =>
										`block py-2 px-3 rounded-md ${navItemClasses} text-lg font-medium ${
											isActive
												? "text-yellow-400 bg-yellow-400/10"
												: "text-slate-300"
										}`
									}
									onClick={closeMobileMenu}
								>
									Authors
								</NavLink>
							</li>
							<li>
								<NavLink
									to="/genres"
									className={({ isActive }) =>
										`block py-2 px-3 rounded-md ${navItemClasses} text-lg font-medium ${
											isActive
												? "text-yellow-400 bg-yellow-400/10"
												: "text-slate-300"
										}`
									}
									onClick={closeMobileMenu}
								>
									Genres
								</NavLink>
							</li>
							<li>
								<NavLink
									to="/books"
									className={({ isActive }) =>
										`block py-2 px-3 rounded-md ${navItemClasses} text-lg font-medium ${
											isActive
												? "text-yellow-400 bg-yellow-400/10"
												: "text-slate-300"
										}`
									}
									onClick={closeMobileMenu}
								>
									Books
								</NavLink>
							</li>
							<li>
								<NavLink
									to="/bookinstances"
									className={({ isActive }) =>
										`block py-2 px-3 rounded-md ${navItemClasses} text-lg font-medium ${
											isActive
												? "text-yellow-400 bg-yellow-400/10"
												: "text-slate-300"
										}`
									}
									onClick={closeMobileMenu}
								>
									Book Instances
								</NavLink>
							</li>
							<li>
								<NavLink
									to="/study-plan"
									className={({ isActive }) =>
										`block py-2 px-3 rounded-md ${navItemClasses} text-lg font-medium ${
											isActive
												? "text-yellow-400 bg-yellow-400/10"
												: "text-slate-300"
										}`
									}
									onClick={closeMobileMenu}
								>
									Study Plan
								</NavLink>
							</li>
							<li>
								<NavLink
									to="/contact"
									className={({ isActive }) =>
										`block py-2 px-3 rounded-md ${navItemClasses} text-lg font-medium ${
											isActive
												? "text-yellow-400 bg-yellow-400/10"
												: "text-slate-300"
										}`
									}
									onClick={closeMobileMenu}
								>
									Contact Us
								</NavLink>
							</li>

							{/* Mobile Auth Links */}
							{auth?.access ? (
								<li className="pt-4 mt-6 border-t border-slate-700">
									<button
										onClick={handleLogout}
										className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200 font-medium shadow-md"
										aria-label="Sign out"
									>
										<FaSignOutAlt className="h-5 w-5" />
										<span>Sign Out</span>
									</button>
								</li>
							) : (
								<>
									<li className="pt-4 mt-6 border-t border-slate-700">
										<Link
											to="/login"
											className="block w-full text-center py-3 px-4 text-slate-300 hover:text-yellow-400 font-medium transition-colors duration-200 border border-slate-600 hover:border-yellow-400 rounded-md"
											onClick={closeMobileMenu}
										>
											Login
										</Link>
									</li>
									<li className="pt-2">
										<Link
											to="/register"
											className="block w-full text-center py-3 px-4 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors duration-200 shadow-md"
											onClick={closeMobileMenu}
										>
											Register
										</Link>
									</li>
								</>
							)}
						</ul>
					</nav>
				</div>
			)}
		</header>
	);
}

function Footer() {
	return (
		<footer className="max-h-20 flex flex-col md:flex-row justify-between items-center text-slate-200 border-t-2 border-slate-700 mt-auto p-4">
			<div className="my-4 text-xl flex space-x-5">
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.facebook.com"
					aria-label="Facebook"
					className="hover:text-yellow-400"
				>
					<FaFacebook />
				</a>
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.instagram.com"
					aria-label="Instagram"
					className="hover:text-yellow-400"
				>
					<FaInstagram />
				</a>
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.x.com"
					aria-label="Twitter"
					className="hover:text-yellow-400"
				>
					<FaXTwitter />
				</a>
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://github.com/MayukhChaturvedi/Bookify"
					aria-label="GitHub"
					className="hover:text-yellow-400"
				>
					<FaGithub />
				</a>
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.youtube.com"
					aria-label="YouTube"
					className="hover:text-yellow-400"
				>
					<FaYoutube />
				</a>
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.linkedin.com/in/mayukh-chaturvedi/"
					aria-label="LinkedIn"
					className="hover:text-yellow-400"
				>
					<FaLinkedin />
				</a>
			</div>
			<div className="my-4 ml-4 text-center md:text-left">
				&copy; 2025 Bookify, Inc. All rights reserved.
			</div>
		</footer>
	);
}

export default function Wrap({ children }) {
	const { auth } = useContext(authContext);
	return (
		<div className="flex flex-col min-h-screen bg-[#111924]">
			<Header />
			<main className="flex-grow p-4">{children}</main>
			<Footer />
			{auth.access && <Chatbot />}
		</div>
	);
}

Wrap.propTypes = { children: PropTypes.node.isRequired };
