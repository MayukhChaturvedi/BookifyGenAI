import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
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

	return (
		<header className="sticky top-0 z-30 bg-blend-darken flex justify-between items-center max-h-20 text-slate-50 border-b-2 border-slate-700 bg-[#111924] p-4">
			<div className="flex items-center max-w-[20%]">
				<img className="h-14 w-12 ml-4" src={logo} alt="logo" />
				<h1 className="font-extrabold text-4xl text-orange-500 m-2">Bookify</h1>
			</div>

			{/* Hamburger Menu Button */}
			<div className="lg:hidden flex items-center mr-4 z-20">
				<button onClick={toggleMobileMenu} aria-label="Toggle Menu">
					{isMobileMenuOpen ? (
						<FaTimes className="text-2xl" />
					) : (
						<FaBars className="text-2xl" />
					)}
				</button>
			</div>

			{/* Fullscreen Mobile Menu */}
			<ul
				className={`fixed inset-0 bg-black bg-opacity-90 transform ${
					isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
				} lg:relative lg:transform-none lg:bg-transparent lg:flex list-none flex-col lg:flex-row lg:justify-around items-center lg:items-center font-serif text-xl transition-transform duration-300 w-full lg:w-[80%] bg-[#111924] justify-around items-around`}
			>
				<li className="my-6 lg:my-0 hover:text-yellow-400 transform transition duration-100 hover:-translate-y-0.5">
					<Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
						Home
					</Link>
				</li>
				<li className="my-6 lg:my-0 hover:text-yellow-400 transform transition duration-100 hover:-translate-y-0.5">
					<Link to="/authors" onClick={() => setIsMobileMenuOpen(false)}>
						Authors
					</Link>
				</li>
				<li className="my-6 lg:my-0 hover:text-yellow-400 transform transition duration-100 hover:-translate-y-0.5">
					<Link to="/genres" onClick={() => setIsMobileMenuOpen(false)}>
						Genres
					</Link>
				</li>
				<li className="my-6 lg:my-0 hover:text-yellow-400 transform transition duration-100 hover:-translate-y-0.5">
					<Link to="/books" onClick={() => setIsMobileMenuOpen(false)}>
						Books
					</Link>
				</li>
				<li className="my-6 lg:my-0 hover:text-yellow-400 transform transition duration-100 hover:-translate-y-0.5">
					<Link to="/bookinstances" onClick={() => setIsMobileMenuOpen(false)}>
						Book Instances
					</Link>
				</li>
				<li className="my-6 lg:my-0 hover:text-yellow-400 transform transition duration-100 hover:-translate-y-0.5">
					<Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
						Contact Us
					</Link>
				</li>

				{/* Conditional Rendering for Authentication Links */}
				{auth.access ? (
					<li className="my-6 lg:my-0 hover:text-yellow-400 transform transition duration-100 hover:-translate-y-0.5">
						<button
							onClick={handleLogout}
							className="flex items-center space-x-2 px-4 py-2 rounded-md bg-white text-indigo-700 hover:bg-gray-100 transition-colors duration-200 font-medium shadow-sm"
						>
							<FaSignOutAlt className="h-4 w-4" />
							<span>Sign Out</span>
						</button>
					</li>
				) : (
					<>
						<li className="my-6 lg:my-0 hover:text-yellow-400 transform transition duration-100 hover:-translate-y-0.5">
							<Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
								Login
							</Link>
						</li>
						<li className="my-6 lg:my-0 hover:text-yellow-400 transform transition duration-100 hover:-translate-y-0.5">
							<Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
								Register
							</Link>
						</li>
					</>
				)}
			</ul>
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
