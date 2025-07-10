import { useContext, useState } from "react";
import AuthContext from "../context/authContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";

// Validation schema using Yup
const LoginSchema = Yup.object().shape({
	email: Yup.string()
		.email("Invalid email address")
		.required("Email is required"),
	password: Yup.string()
		.min(6, "Password must be at least 6 characters")
		.required("Password is required"),
});

const Login = () => {
	const { auth, login } = useContext(AuthContext);
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (auth.access) {
		navigate("/");
	}

	const initialValues = {
		email: "",
		password: "",
	};

	const handleSubmit = async (values, { setSubmitting, resetForm }) => {
		setIsSubmitting(true);
		try {
			const response = await api.post("/auth/login", values);
			console.log("Login response:", response.data);
			login(response.data.access, response.data.refresh);
			enqueueSnackbar("Logged in successfully!", { variant: "success" });
			resetForm();
			navigate("/");
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				"Login failed. Check your credentials.";
			enqueueSnackbar(errorMessage, { variant: "error" });
		} finally {
			setSubmitting(false);
			setIsSubmitting(false);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const handleSignupRedirect = () => {
		navigate("/register");
	};

	return (
		<div className="max-w-md min-w-[50%] mx-auto my-12 p-8 bg-white shadow-lg rounded-lg border border-gray-200">
			<div className="text-center mb-8">
				<h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
				<p className="text-gray-600">Please login to access your account</p>
			</div>

			<Formik
				initialValues={initialValues}
				validationSchema={LoginSchema}
				onSubmit={handleSubmit}
			>
				{({ errors, touched, isSubmitting }) => (
					<Form className="space-y-5">
						<div className="relative">
							<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
								<FaUser />
							</div>
							<Field
								type="email"
								name="email"
								placeholder="Email"
								className={`border-2 rounded-lg w-full p-3 pl-10 focus:outline-none focus:ring-2 transition-all
                  ${
										errors.username && touched.username
											? "border-red-400 focus:ring-red-200"
											: "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
									}`}
							/>
							<ErrorMessage
								name="username"
								component="div"
								className="text-red-600 text-sm mt-1 ml-1"
							/>
						</div>

						<div className="relative">
							<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
								<FaLock />
							</div>
							<Field
								type={showPassword ? "text" : "password"}
								name="password"
								placeholder="Password"
								className={`border-2 rounded-lg w-full p-3 pl-10 pr-12 focus:outline-none focus:ring-2 transition-all
                  ${
										errors.password && touched.password
											? "border-red-400 focus:ring-red-200"
											: "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
									}`}
							/>
							<button
								type="button"
								onClick={togglePasswordVisibility}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? <FaEyeSlash /> : <FaEye />}
							</button>
							<ErrorMessage
								name="password"
								component="div"
								className="text-red-600 text-sm mt-1 ml-1"
							/>
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg w-full transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
						>
							{isSubmitting ? (
								<span className="flex items-center">
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Logging in...
								</span>
							) : (
								"Login"
							)}
						</button>
					</Form>
				)}
			</Formik>

			<div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
				<p className="text-gray-600">Don&apos;t have an account?</p>
				<button
					onClick={handleSignupRedirect}
					className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
				>
					Sign Up
				</button>
			</div>
		</div>
	);
};

export default Login;
