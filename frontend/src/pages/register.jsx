import { useState, useContext, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Eye, EyeOff } from "lucide-react";
import AuthContext from "../context/authContext";

const Register = () => {
	const { auth } = useContext(AuthContext);
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [showAdminPassword, setShowAdminPassword] = useState(false);

	useEffect(() => {
		if (auth.access) {
			navigate("/");
		}
	}, [auth.access, navigate]);

	const validationSchema = Yup.object({
		username: Yup.string()
			.min(3, "Username must be at least 3 characters")
			.required("Username is required"),
		email: Yup.string()
			.email("Invalid email address")
			.required("Email is required"),
		password: Yup.string()
			.min(8, "Password must be at least 8 characters")
			.matches(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password must contain at least one uppercase letter, one lowercase letter, and one number"
			)
			.required("Password is required"),
		confirmPassword: Yup.string()
			.oneOf([Yup.ref("password"), null], "Passwords must match")
			.required("Confirm password is required"),
		role: Yup.string()
			.oneOf(["user", "admin"], "Role must be either 'user' or 'admin'")
			.required("Role is required"),
		adminPassword: Yup.string().when("role", {
			is: "admin",
			then: (schema) => schema.required("Admin password required").min(6),
			otherwise: (schema) => schema.notRequired(),
		}),
	});

	const handleSubmit = async (values, { setSubmitting }) => {
		try {
			// Remove confirmPassword before sending to API
			const { confirmPassword, ...formData } = values;
			// console.log(formData);
			await api.post("/auth/register", formData);
			enqueueSnackbar("Registered successfully! Please login.", {
				variant: "success",
			});
			navigate("/login");
		} catch (error) {
			enqueueSnackbar(error.response?.data?.message || "Registration failed.", {
				variant: "error",
			});
		} finally {
			setSubmitting(false);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const toggleConfirmPasswordVisibility = () => {
		setShowConfirmPassword(!showConfirmPassword);
	};

	const toggleAdminPasswordVisibility = () => {
		setShowAdminPassword(!showAdminPassword);
	};

	return (
		<div className="max-w-md min-w-[50%] mx-auto my-20 p-10 bg-white shadow-lg rounded-md">
			<h2 className="text-2xl font-semibold text-gray-800 mb-6">Register</h2>

			<Formik
				initialValues={{
					username: "",
					email: "",
					password: "",
					confirmPassword: "",
					role: "user",
					adminPassword: "",
				}}
				validationSchema={validationSchema}
				onSubmit={handleSubmit}
			>
				{({ isSubmitting }) => (
					<Form className="flex flex-col items-center">
						<div className="w-full mb-4">
							<Field
								type="text"
								name="username"
								placeholder="Username"
								className="border-2 border-gray-300 rounded-lg w-full p-2 focus:border-blue-500 focus:outline-none"
							/>
							<ErrorMessage
								name="username"
								component="div"
								className="text-red-500 text-sm mt-1"
							/>
						</div>

						<div className="w-full mb-4">
							<Field
								type="email"
								name="email"
								placeholder="Email"
								className="border-2 border-gray-300 rounded-lg w-full p-2 focus:border-blue-500 focus:outline-none"
							/>
							<ErrorMessage
								name="email"
								component="div"
								className="text-red-500 text-sm mt-1"
							/>
						</div>

						<div className="w-full mb-4">
							<div className="relative">
								<Field
									type={showPassword ? "text" : "password"}
									name="password"
									placeholder="Password"
									className="border-2 border-gray-300 rounded-lg w-full p-2 focus:border-blue-500 focus:outline-none"
								/>
								<button
									type="button"
									onClick={togglePasswordVisibility}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
								>
									{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
								</button>
							</div>
							<ErrorMessage
								name="password"
								component="div"
								className="text-red-500 text-sm mt-1"
							/>
						</div>

						<div className="w-full mb-4">
							<div className="relative">
								<Field
									type={showConfirmPassword ? "text" : "password"}
									name="confirmPassword"
									placeholder="Confirm Password"
									className="border-2 border-gray-300 rounded-lg w-full p-2 focus:border-blue-500 focus:outline-none"
								/>
								<button
									type="button"
									onClick={toggleConfirmPasswordVisibility}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
								>
									{showConfirmPassword ? (
										<EyeOff size={20} />
									) : (
										<Eye size={20} />
									)}
								</button>
							</div>
							<ErrorMessage
								name="confirmPassword"
								component="div"
								className="text-red-500 text-sm mt-1"
							/>
						</div>

						<div className="w-full mb-4">
							<div className="relative">
								<Field
									as="select"
									name="role"
									placeholder="Select Role"
									className="border-2 border-gray-300 rounded-lg w-full p-2 focus:border-blue-500 focus:outline-none"
								>
									<option value="user">User</option>
									<option value="admin">Admin</option>
								</Field>
								<ErrorMessage
									name="role"
									component="div"
									className="text-red-500 text-sm mt-1"
								/>
							</div>
						</div>

						{/* Use Formik's values to control visibility and correct state for icon */}
						<Field name="role">
							{({ field, form }) =>
								form.values.role === "admin" && (
									<div className="w-full mb-4">
										<div className="relative">
											<Field
												type={showAdminPassword ? "text" : "password"}
												name="adminPassword"
												placeholder="Enter Admin Password"
												className="border-2 border-gray-300 rounded-lg w-full p-2 focus:border-blue-500 focus:outline-none"
											/>
											<button
												type="button"
												onClick={toggleAdminPasswordVisibility}
												className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
											>
												{showAdminPassword ? (
													<EyeOff size={20} />
												) : (
													<Eye size={20} />
												)}
											</button>
										</div>
										<ErrorMessage
											name="adminPassword"
											component="div"
											className="text-red-500 text-sm mt-1"
										/>
									</div>
								)
							}
						</Field>

						<button
							type="submit"
							disabled={isSubmitting}
							className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg w-full mb-4 disabled:opacity-50"
						>
							{isSubmitting ? "Registering..." : "Register"}
						</button>
					</Form>
				)}
			</Formik>

			<div className="flex justify-between items-center mt-4">
				<p className="text-gray-600">Already have an account?</p>
				<button
					onClick={() => navigate("/login")}
					className="text-blue-500 font-semibold hover:underline"
				>
					Login
				</button>
			</div>
		</div>
	);
};

export default Register;
