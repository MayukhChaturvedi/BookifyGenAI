import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import api from "../services/api";
// import FormGenerate from "./formGenerate.jsx";
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
			.matches(/[A-Za-z]{1,100}\s[A-Za-z]/, "Must be 1-100 letters")
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
		author: Yup.string()
			.required("Author is required")
			.uuid("Invalid author ID"),
		genre: Yup.string().required("Genre is required").uuid("Invalid genre ID"),
	}),
	bookinstances: Yup.object({
		book: Yup.string().required("Book is required").uuid("Invalid book ID"),
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

export default function Create() {
	const [loading, setLoading] = useState(false);
	const { type } = useParams();
	const { enqueueSnackbar } = useSnackbar();

	const initialValues = {
		authors: {
			name: "",
			bio: "",
		},
		genres: {
			name: "",
			description: "",
		},
		books: {
			title: "",
			summary: "",
			author: "",
			genre: "",
		},
		bookinstances: {
			book: "",
			status: "",
			due_date: "",
		},
	};

	const handleSubmit = async (values, { setSubmitting, resetForm }) => {
		const postData = { ...values };
		if (type === "bookinstances" && postData.due_date) {
			postData.due_date = new Date(postData.due_date).toISOString();
		}
		try {
			const res = await api.post(`/api/${type}`, postData);
			enqueueSnackbar(res.data.message || "Created successfully!", {
				variant: "success",
			});
			resetForm();
		} catch (err) {
			enqueueSnackbar("Error submitting form", { variant: "error" });
			console.error("Submit error:", err);
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
							value={values.name}
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
							value={values.bio}
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
							value={values.name}
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
							value={values.description}
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
							value={values.title}
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
							value={values.summary}
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
								value={values.author}
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
								value={values.genre}
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
								value={values.book}
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
								value={values.status}
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
							value={values.due_date}
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

	if (loading)
		return <CircularProgress sx={{ display: "block", mx: "auto", my: 5 }} />;

	return (
		<Container maxWidth="sm" sx={{ my: 5 }}>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
					<Typography variant="h5" gutterBottom align="center">
						Add New {type?.charAt(0).toUpperCase() + type?.slice(1)}
					</Typography>
					<Formik
						initialValues={initialValues[type]}
						validationSchema={validationSchemas[type]}
						onSubmit={handleSubmit}
					>
						{({ isSubmitting, values, setFieldValue, errors, touched }) => (
							<Form>
								{renderFormFields(type, values, setFieldValue, errors, touched)}
								<Button
									type="submit"
									variant="contained"
									color="primary"
									fullWidth
									disabled={isSubmitting}
									sx={{ mt: 3, py: 1.5 }}
								>
									{isSubmitting ? "Submitting..." : "Submit"}
								</Button>
							</Form>
						)}
					</Formik>
				</Paper>
			</motion.div>
		</Container>
	);
}
