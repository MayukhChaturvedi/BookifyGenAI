import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// console.log(import.meta.env.VITE_BASEURL);

const api = axios.create({
	baseURL: import.meta.env.VITE_BASEURL,
});

// Set default authorization header if token exists
const token = Cookies.get("access");
if (token) {
	api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Function to refresh token
const refreshToken = async () => {
	try {
		const refresh = Cookies.get("refresh");
		if (!refresh) {
			throw new Error("No refresh token available");
		}

		// Use a new axios instance to avoid interceptors loop
		const response = await axios.post(
			`${import.meta.env.VITE_BASEURL}/auth/refresh/`,
			{ refresh }
		);

		if (response.status === 200) {
			const newAccess = response.data.access;
			Cookies.set("access", newAccess, { secure: true, sameSite: "strict" });
			api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
			return newAccess;
		} else {
			throw new Error("Failed to refresh token");
		}
	} catch (error) {
		console.error("Token refresh failed:", error);
		// Clear tokens on refresh failure
		Cookies.remove("access");
		Cookies.remove("refresh");
		delete api.defaults.headers.common["Authorization"];
		return null;
	}
};

// Response interceptor for handling token expiration
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// If the error is 401 (Unauthorized) and we haven't tried to refresh yet
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// Check if token is expired before attempting refresh
				const access = Cookies.get("access");
				let tokenExpired = false;

				if (access) {
					try {
						const decoded = jwtDecode(access);
						tokenExpired = decoded.exp * 1000 <= Date.now();
					} catch (e) {
						tokenExpired = true;
					}
				} else {
					tokenExpired = true;
				}

				if (tokenExpired) {
					const newToken = await refreshToken();
					if (newToken) {
						// Retry the original request with the new token
						originalRequest.headers.Authorization = `Bearer ${newToken}`;
						return api(originalRequest);
					}
				}
			} catch (refreshError) {
				// Let the application handle auth errors (redirect to login, etc.)
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

export default api;
