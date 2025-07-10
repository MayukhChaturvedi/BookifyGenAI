import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import api from "../services/api";
import LiveSearchSelect from "../components/LiveSearchSelect.jsx";
import {
	Button,
	Container,
	Paper,
	Typography,
	CircularProgress,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormHelperText,
	Box,
} from "@mui/material";
import { motion } from "framer-motion";

// Validation Schemas
const validationSchemas = {
	authors: Yup.object({
		name: Yup.string()
			.matches(
				/^[A-Za-z\s]{2,100}$/,
				"Name must be 2-100 letters and spaces only"
			)
			.required("Name is required"),
		bio: Yup.string().optional(),
	}),
	genres: Yup.object({
		name: Yup.string()
			.min(3, "Must be at least 3 characters")
			.max(100, "Must be less than 100 characters")
			.required("Name is required"),
		description: Yup.string().optional(),
	}),
	books: Yup.object({
		title: Yup.string().required("Title is required"),
		summary: Yup.string().required("Summary is required"),
		author: Yup.string().required("Author is required"),
		genre: Yup.string().required("Genre is required"),
	}),
	bookinstances: Yup.object({
		book: Yup.string().required("Book is required"),
		status: Yup.string().required("Status is required"),
		due_date: Yup.date().nullable(),
	}),
};

// Status options for book instances
const statusOptions = [
	{ value: "Available", label: "Available" },
	{ value: "On loan", label: "On loan" },
	{ value: "Maintenance", label: "Maintenance" },
	{ value: "Reserved", label: "Reserved" },
];

export default function Update() {
	const [initialValues, setInitialValues] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { type, id } = useParams();
	const { enqueueSnackbar } = useSnackbar();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				console.log(`Fetching data for ${type}/${id}`);

				// Fetch the item to update
				const itemResponse = await api.get(`/api/${type}/${id}`);
				console.log("API Response:", itemResponse.data);

				// Handle different response structures
				let item = itemResponse.data;

				// If the response has a data property, use that
				if (item.data) {
					item = item.data;
				}

				// Set initial form values based on type
				switch (type) {
					case "authors":
						setInitialValues({
							name: item.name || "",
							bio: item.bio || "",
						});
						break;
					case "genres":
						setInitialValues({
							name: item.name || "",
							description: item.description || "",
						});
						break;
					case "books":
						setInitialValues({
							title: item.title || "",
							summary: item.summary || "",
							author: item.author_id || "",
							genre: item.genre_id || "",
						});
						break;
					case "bookinstances":
						setInitialValues({
							book: item.book_id || item.book || "",
							status: item.status || "",
							due_date: item.due_date
								? new Date(item.due_date).toISOString().split("T")[0]
								: "",
						});
						break;
					default:
						throw new Error(`Unknown type: ${type}`);
				}
			} catch (err) {
				console.error("Fetch error:", err);
				const errorMessage =
					err.response?.data?.message || "Error fetching data";
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: "error" });
			} finally {
				setLoading(false);
			}
		};

		if (type && id) {
			fetchData();
		}
	}, [id, type, enqueueSnackbar]);

	const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
		try {
			console.log("Submitting values:", values);

			const putData = { ...values };

			// Handle date formatting
			if (type === "bookinstances" && putData.due_date) {
				putData.due_date = new Date(putData.due_date).toISOString();
			} else if (type === "authors") {
				if (putData.date_of_birth) {
					putData.date_of_birth = new Date(putData.date_of_birth).toISOString();
				}
				if (putData.date_of_death) {
					putData.date_of_death = new Date(putData.date_of_death).toISOString();
				}
			}

			console.log("Sending PUT request with data:", putData);

			const res = await api.put(`/api/${type}/${id}`, putData);

			console.log("Update response:", res.data);

			enqueueSnackbar(res.data.message || "Updated successfully!", {
				variant: "success",
			});

			// Navigate back to the list or detail view
			navigate(`/${type}`);
		} catch (err) {
			console.error("Submit error:", err);

			// Handle validation errors from backend
			if (err.response?.status === 400 && err.response?.data?.errors) {
				const errors = err.response.data.errors;
				Object.keys(errors).forEach((field) => {
					setFieldError(field, errors[field][0] || errors[field]);
				});
			}

			const errorMessage = err.response?.data?.message || "Error updating data";
			enqueueSnackbar(errorMessage, { variant: "error" });
		} finally {
			setSubmitting(false);
		}
	};

	// Custom form renderer for different entity types
	const renderFormFields = (type, values, setFieldValue, errors, touched) => {
		switch (type) {
			case "authors":
				return (
					<>
						<TextField
							name="name"
							label="Author Name"
							value={values.name || ""}
							onChange={(e) => setFieldValue("name", e.target.value)}
							fullWidth
							margin="normal"
							variant="outlined"
							error={touched.name && Boolean(errors.name)}
							helperText={touched.name && errors.name}
						/>
						<TextField
							name="bio"
							label="Biography"
							value={values.bio || ""}
							onChange={(e) => setFieldValue("bio", e.target.value)}
							fullWidth
							margin="normal"
							variant="outlined"
							multiline
							rows={4}
							error={touched.bio && Boolean(errors.bio)}
							helperText={touched.bio && errors.bio}
						/>
					</>
				);

			case "genres":
				return (
					<>
						<TextField
							name="name"
							label="Genre Name"
							value={values.name || ""}
							onChange={(e) => setFieldValue("name", e.target.value)}
							fullWidth
							margin="normal"
							variant="outlined"
							error={touched.name && Boolean(errors.name)}
							helperText={touched.name && errors.name}
						/>
						<TextField
							name="description"
							label="Description"
							value={values.description || ""}
							onChange={(e) => setFieldValue("description", e.target.value)}
							fullWidth
							margin="normal"
							variant="outlined"
							multiline
							rows={4}
							error={touched.description && Boolean(errors.description)}
							helperText={touched.description && errors.description}
						/>
					</>
				);

			case "books":
				return (
					<>
						<TextField
							name="title"
							label="Book Title"
							value={values.title || ""}
							onChange={(e) => setFieldValue("title", e.target.value)}
							fullWidth
							margin="normal"
							variant="outlined"
							error={touched.title && Boolean(errors.title)}
							helperText={touched.title && errors.title}
						/>
						<TextField
							name="summary"
							label="Summary"
							value={values.summary || ""}
							onChange={(e) => setFieldValue("summary", e.target.value)}
							fullWidth
							margin="normal"
							variant="outlined"
							multiline
							rows={4}
							error={touched.summary && Boolean(errors.summary)}
							helperText={touched.summary && errors.summary}
						/>
						<Box sx={{ mt: 2 }}>
							<LiveSearchSelect
								label="Select Author"
								value={values.author || ""}
								setValue={(value) => setFieldValue("author", value || "")}
								endpoint="/api/authors"
								getOptionLabel={(option) => option?.name || ""}
								getOptionValue={(option) => option?.id || ""}
							/>
							{touched.author && errors.author && (
								<FormHelperText error sx={{ ml: 2 }}>
									{errors.author}
								</FormHelperText>
							)}
						</Box>
						<Box sx={{ mt: 2 }}>
							<LiveSearchSelect
								label="Select Genre"
								value={values.genre || ""}
								setValue={(value) => setFieldValue("genre", value || "")}
								endpoint="/api/genres"
								getOptionLabel={(option) => option?.name || ""}
								getOptionValue={(option) => option?.id || ""}
							/>
							{touched.genre && errors.genre && (
								<FormHelperText error sx={{ ml: 2 }}>
									{errors.genre}
								</FormHelperText>
							)}
						</Box>
					</>
				);

			case "bookinstances":
				return (
					<>
						<Box sx={{ mt: 2 }}>
							<LiveSearchSelect
								label="Select Book"
								value={values.book || ""}
								setValue={(value) => setFieldValue("book", value || "")}
								endpoint="/api/books"
								getOptionLabel={(option) => option?.title || ""}
								getOptionValue={(option) => option?.id || ""}
							/>
							{touched.book && errors.book && (
								<FormHelperText error sx={{ ml: 2 }}>
									{errors.book}
								</FormHelperText>
							)}
						</Box>
						<FormControl
							fullWidth
							margin="normal"
							variant="outlined"
							error={touched.status && Boolean(errors.status)}
						>
							<InputLabel>Status</InputLabel>
							<Select
								value={values.status || ""}
								onChange={(e) => setFieldValue("status", e.target.value)}
								label="Status"
							>
								{statusOptions.map((option) => (
									<MenuItem key={option.value} value={option.value}>
										{option.label}
									</MenuItem>
								))}
							</Select>
							{touched.status && errors.status && (
								<FormHelperText>{errors.status}</FormHelperText>
							)}
						</FormControl>
						<TextField
							name="due_date"
							label="Due Date"
							type="date"
							value={values.due_date || ""}
							onChange={(e) => setFieldValue("due_date", e.target.value)}
							fullWidth
							margin="normal"
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							error={touched.due_date && Boolean(errors.due_date)}
							helperText={touched.due_date && errors.due_date}
						/>
					</>
				);

			default:
				return null;
		}
	};

	if (loading) {
		return (
			<Container maxWidth="sm" sx={{ my: 5, textAlign: "center" }}>
				<CircularProgress sx={{ display: "block", mx: "auto", my: 5 }} />
				<Typography variant="body1" sx={{ mt: 2 }}>
					Loading {type}...
				</Typography>
			</Container>
		);
	}

	if (error) {
		return (
			<Container maxWidth="sm" sx={{ my: 5, textAlign: "center" }}>
				<Typography variant="h6" color="error" gutterBottom>
					Error Loading Data
				</Typography>
				<Typography variant="body1" sx={{ mb: 2 }}>
					{error}
				</Typography>
				<Button variant="contained" onClick={() => window.location.reload()}>
					Retry
				</Button>
			</Container>
		);
	}

	if (!initialValues) {
		return (
			<Container maxWidth="sm" sx={{ my: 5, textAlign: "center" }}>
				<Typography variant="h6" color="error">
					No data found
				</Typography>
			</Container>
		);
	}

	return (
		<Container maxWidth="sm" sx={{ my: 5 }}>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
					<Typography variant="h5" gutterBottom align="center">
						Update {type?.charAt(0).toUpperCase() + type?.slice(1)}
					</Typography>
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchemas[type]}
						onSubmit={handleSubmit}
						enableReinitialize={true}
					>
						{({ isSubmitting, values, setFieldValue, errors, touched }) => (
							<Form>
								{renderFormFields(type, values, setFieldValue, errors, touched)}
								<Box sx={{ mt: 3, display: "flex", gap: 2 }}>
									<Button
										type="button"
										variant="outlined"
										color="secondary"
										fullWidth
										onClick={() => navigate(`/${type}`)}
										disabled={isSubmitting}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										variant="contained"
										color="primary"
										fullWidth
										disabled={isSubmitting}
									>
										{isSubmitting ? "Updating..." : "Update"}
									</Button>
								</Box>
							</Form>
						)}
					</Formik>
				</Paper>
			</motion.div>
		</Container>
	);
}
