import { useState, useEffect, useCallback } from "react";
import { TextField, Autocomplete, CircularProgress } from "@mui/material";
import PropTypes from "prop-types";
import api from "../services/api";

const LiveSearchSelect = ({
	label,
	value,
	setValue,
	endpoint,
	getOptionLabel,
	getOptionValue,
}) => {
	const [options, setOptions] = useState([]);
	const [inputValue, setInputValue] = useState("");
	const [loading, setLoading] = useState(false);
	const [selectedOption, setSelectedOption] = useState(null);

	// Fetch the current selected item when value changes (for update forms)
	const fetchSelectedItem = useCallback(
		async (itemId) => {
			if (!itemId) return null;

			try {
				console.log(`Fetching selected item: ${endpoint}/${itemId}`);
				const res = await api.get(`${endpoint}/${itemId}`);

				// Handle different response structures
				let item = res.data;
				if (item.data) {
					item = item.data;
				}

				console.log("Fetched selected item:", item);
				return item;
			} catch (err) {
				console.error("Failed to fetch selected item:", err);
				return null;
			}
		},
		[endpoint]
	);

	// Initialize selected option when value changes
	useEffect(() => {
		const initializeSelectedOption = async () => {
			if (value && value !== selectedOption?.id) {
				const item = await fetchSelectedItem(value);
				if (item) {
					setSelectedOption(item);
					setInputValue(getOptionLabel(item));
				}
			} else if (!value && selectedOption) {
				setSelectedOption(null);
				setInputValue("");
			}
		};

		initializeSelectedOption();
	}, [value, fetchSelectedItem, getOptionLabel, selectedOption]);

	// Search for options based on input
	useEffect(() => {
		const searchTimer = setTimeout(async () => {
			if (inputValue.length < 2) {
				setOptions([]);
				return;
			}

			setLoading(true);
			try {
				console.log(`Searching: ${endpoint}?search=${inputValue}`);
				const res = await api.get(endpoint, {
					params: {
						search: inputValue,
						limit: 10,
					},
				});

				console.log("Search response:", res.data);

				// Handle different response structures from your backend
				let data = [];
				if (res.data.authors) {
					data = res.data.authors;
				} else if (res.data.genres) {
					data = res.data.genres;
				} else if (res.data.books) {
					data = res.data.books;
				} else if (res.data.data) {
					data = res.data.data;
				} else if (Array.isArray(res.data)) {
					data = res.data;
				}

				console.log("Processed options:", data);
				setOptions(data);
			} catch (err) {
				console.error("Search fetch failed", err);
				setOptions([]);
			} finally {
				setLoading(false);
			}
		}, 300);

		return () => clearTimeout(searchTimer);
	}, [inputValue, endpoint]);

	// Clear options when input is too short and no option is selected
	useEffect(() => {
		if (inputValue.length < 2 && !selectedOption) {
			setOptions([]);
		}
	}, [inputValue, selectedOption]);

	const handleChange = (event, newValue) => {
		console.log("Selection changed:", newValue);

		setSelectedOption(newValue);
		if (newValue) {
			const newValueId = getOptionValue(newValue);
			setValue(newValueId);
			setInputValue(getOptionLabel(newValue));
		} else {
			setValue("");
			setInputValue("");
		}
	};

	const handleInputChange = (event, newInputValue, reason) => {
		console.log("Input changed:", newInputValue, "reason:", reason);

		setInputValue(newInputValue);

		// If the input is cleared by user, also clear the selected value
		if (reason === "clear" || newInputValue === "") {
			setSelectedOption(null);
			setValue("");
		}
	};

	// Find the currently selected option from search results or use the pre-loaded selected option
	const currentValue =
		selectedOption ||
		options.find((opt) => getOptionValue(opt) === value) ||
		null;

	console.log(
		"Current value:",
		currentValue,
		"Input value:",
		inputValue,
		"Options count:",
		options.length
	);

	return (
		<Autocomplete
			fullWidth
			value={currentValue}
			onChange={handleChange}
			inputValue={inputValue}
			onInputChange={handleInputChange}
			options={options}
			getOptionLabel={getOptionLabel}
			loading={loading}
			noOptionsText={
				inputValue.length < 2
					? "Type at least 2 characters to search"
					: "No options found"
			}
			isOptionEqualToValue={(option, value) => {
				if (!option || !value) return false;
				return getOptionValue(option) === getOptionValue(value);
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					label={label}
					margin="normal"
					variant="outlined"
					InputProps={{
						...params.InputProps,
						endAdornment: (
							<>
								{loading ? <CircularProgress size={16} /> : null}
								{params.InputProps.endAdornment}
							</>
						),
					}}
				/>
			)}
		/>
	);
};

LiveSearchSelect.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
	setValue: PropTypes.func.isRequired,
	endpoint: PropTypes.string.isRequired,
	getOptionLabel: PropTypes.func.isRequired,
	getOptionValue: PropTypes.func.isRequired,
};

export default LiveSearchSelect;
