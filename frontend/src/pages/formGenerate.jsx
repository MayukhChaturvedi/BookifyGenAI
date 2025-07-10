import PropTypes from "prop-types";
import { Field, ErrorMessage } from "formik";
import {
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Checkbox,
	FormControlLabel,
	Typography,
	Box,
} from "@mui/material";
import { motion } from "framer-motion";
import LiveSearchSelect from "../components/LiveSearchSelect.jsx";

export default function FormGenerate({
	type,
	values,
	setFieldValue,
	extraData,
	isSubmitting,
}) {
	const fieldVariants = {
		hidden: { opacity: 0, x: -20 },
		visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
	};

	if (type === "authors") {
		return (
			<>
				<motion.div variants={fieldVariants} initial="hidden" animate="visible">
					<Field
						name="name"
						as={TextField}
						label="Name"
						fullWidth
						margin="normal"
						disabled={isSubmitting}
						autoFocus
						helperText={<ErrorMessage name="name" />}
						error={Boolean(
							values.first_name &&
								!/[A-Za-z]{1,100}\s[A-Za-z]{1,100}/.test(values.first_name)
						)}
					/>
				</motion.div>
				<motion.div variants={fieldVariants} initial="hidden" animate="visible">
					<Field
						name="bio"
						as={TextField}
						label="Bio"
						fullWidth
						margin="normal"
						disabled={isSubmitting}
						helperText={<ErrorMessage name="bio" />}
					/>
				</motion.div>
			</>
		);
	} else if (type === "genres") {
		return (
			<>
				<motion.div variants={fieldVariants} initial="hidden" animate="visible">
					<Field
						name="name"
						as={TextField}
						label="Name"
						fullWidth
						margin="normal"
						disabled={isSubmitting}
						autoFocus
						helperText={<ErrorMessage name="name" />}
					/>
				</motion.div>
				<motion.div variants={fieldVariants} initial="hidden" animate="visible">
					<Field
						name="description"
						as={TextField}
						label="Description"
						fullWidth
						margin="normal"
						disabled={isSubmitting}
						autoFocus
						helperText={<ErrorMessage name="description" />}
					/>
				</motion.div>
			</>
		);
	} else if (type === "books") {
		return (
			<>
				<motion.div variants={fieldVariants} initial="hidden" animate="visible">
					<Field
						name="title"
						as={TextField}
						label="Title"
						fullWidth
						margin="normal"
						disabled={isSubmitting}
						autoFocus
						helperText={<ErrorMessage name="title" />}
					/>
				</motion.div>
				<motion.div variants={fieldVariants} initial="hidden" animate="visible">
					<Field
						name="summary"
						as={TextField}
						label="Summary"
						fullWidth
						margin="normal"
						multiline
						rows={4}
						disabled={isSubmitting}
						helperText={<ErrorMessage name="summary" />}
					/>
				</motion.div>
				<motion.div variants={fieldVariants} initial="hidden" animate="visible">
					<FormControl fullWidth margin="normal">
						<InputLabel>Author</InputLabel>
						<LiveSearchSelect
							label="Author"
							value={values.author}
							setValue={(val) => setFieldValue("author", val)}
							endpoint="/authors"
							getOptionLabel={(opt) => opt.name}
							getOptionValue={(opt) => opt.id}
						/>
						<ErrorMessage
							name="author"
							component="div"
							style={{ color: "red", fontSize: "0.75rem" }}
						/>
					</FormControl>
				</motion.div>
				<motion.div variants={fieldVariants} initial="hidden" animate="visible">
					<FormControl fullWidth margin="normal">
						<InputLabel>Genre</InputLabel>
						<LiveSearchSelect
							label="Genre"
							value={values.genre}
							setValue={(val) => setFieldValue("genre", val)}
							endpoint="/genres"
							getOptionLabel={(opt) => opt.name}
							getOptionValue={(opt) => opt.id}
						/>
						<ErrorMessage
							name="genre"
							component="div"
							style={{ color: "red", fontSize: "0.75rem" }}
						/>
					</FormControl>
				</motion.div>
			</>
		);
	} else if (type === "bookinstances") {
		return (
			<>
				<motion.div variants={fieldVariants} initial="hidden" animate="visible">
					<FormControl fullWidth margin="normal">
						<InputLabel>Book</InputLabel>
						<LiveSearchSelect
							label="Book"
							value={values.book}
							setValue={(val) => setFieldValue("book", val)}
							endpoint="/api/books"
							getOptionLabel={(opt) => opt.title}
							getOptionValue={(opt) => opt.id}
						/>
						<ErrorMessage
							name="book"
							component="div"
							style={{ color: "red", fontSize: "0.75rem" }}
						/>
					</FormControl>
				</motion.div>
				<motion.div variants={fieldVariants} initial="hidden" animate="visible">
					<FormControl fullWidth margin="normal">
						<InputLabel>Status</InputLabel>
						<Field
							name="status"
							as={Select}
							label="Status"
							disabled={isSubmitting}
						>
							<MenuItem value="">--Select Status--</MenuItem>
							{["Available", "Maintenance", "Checked Out", "Reserved"].map(
								(status) => (
									<MenuItem key={status} value={status}>
										{status}
									</MenuItem>
								)
							)}
						</Field>
						<ErrorMessage
							name="status"
							component="div"
							style={{ color: "red", fontSize: "0.75rem" }}
						/>
					</FormControl>
				</motion.div>
				<motion.div variants={fieldVariants} initial="hidden" animate="visible">
					<Field
						name="due_date"
						as={TextField}
						label="Due Date"
						type="date"
						fullWidth
						margin="normal"
						disabled={isSubmitting}
						InputLabelProps={{ shrink: true }}
						helperText={<ErrorMessage name="due_date" />}
					/>
				</motion.div>
			</>
		);
	}
}

FormGenerate.propTypes = {
	type: PropTypes.string.isRequired,
	values: PropTypes.object.isRequired,
	setFieldValue: PropTypes.func.isRequired,
	extraData: PropTypes.object.isRequired,
	isSubmitting: PropTypes.bool.isRequired,
};
