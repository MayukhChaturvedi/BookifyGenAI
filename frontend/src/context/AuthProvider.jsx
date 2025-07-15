import { useState, useEffect, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import Cookies from "js-cookie";

import AuthContext from "./authContext";

const AuthProvider = ({ children }) => {
	const [auth, setAuth] = useState({
		access: null,
		user: null, // Initialize user as null for clarity
	});

	const [isLoading, setIsLoading] = useState(true);
	// Ref to prevent multiple simultaneous refresh calls
	const isRefreshing = useRef(false);

	const setUserAuth = (accessToken) => {
		try {
			const decoded = jwtDecode(accessToken);
			api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
			setAuth({
				access: accessToken,
				user: {
					id: decoded.id,
					email: decoded.email,
					role: decoded.role,
					session: decoded.session,
				},
			});
		} catch (error) {
			console.error("Failed to decode token:", error);
			logout(); // Logout if token is malformed
		} finally {
			setIsLoading(false);
		}
	};

	const refreshToken = useCallback(async () => {
		// Prevent multiple refresh calls if one is already in progress
		if (isRefreshing.current) return;
		isRefreshing.current = true;

		try {
			const refresh = Cookies.get("refresh");
			if (!refresh) throw new Error("No refresh token available");

			const response = await api.post("/auth/refresh", { refresh });

			if (response.status === 200) {
				const { access: newAccess, refresh: newRefresh } = response.data;
				Cookies.set("access", newAccess, { secure: true, sameSite: "strict" });
				Cookies.set("refresh", newRefresh, {
					secure: true,
					sameSite: "strict",
				});
				setUserAuth(newAccess); // Use the centralized function to set state
				return newAccess;
			} else {
				throw new Error("Failed to refresh token");
			}
		} catch (error) {
			console.error("Token refresh failed:", error);
			logout();
			return null;
		} finally {
			// Always reset the flag
			isRefreshing.current = false;
		}
	}, []);

	useEffect(() => {
		const initAuth = async () => {
			const accessToken = Cookies.get("access");

			if (accessToken) {
				try {
					const decoded = jwtDecode(accessToken);
					// Check if the access token is expired
					if (decoded.exp * 1000 > Date.now()) {
						// Token is valid, set the auth state
						setUserAuth(accessToken);
					} else {
						// Access token is expired, try to refresh it
						await refreshToken();
					}
				} catch (error) {
					// If decoding fails, token is likely malformed. Try to refresh.
					console.error("Malformed access token:", error);
					await refreshToken();
				}
			} else if (Cookies.get("refresh")) {
				// 2. If no access token exists, but a refresh token does, refresh.
				await refreshToken();
			}
		};

		initAuth();
	}, [refreshToken]);

	const login = (access, refresh) => {
		Cookies.set("access", access, { secure: true, sameSite: "strict" });
		Cookies.set("refresh", refresh, { secure: true, sameSite: "strict" });
		setUserAuth(access); // Use the centralized function
	};

	const logout = () => {
		Cookies.remove("access");
		Cookies.remove("refresh");
		delete api.defaults.headers.common["Authorization"];
		setAuth({ access: null, user: null });
	};

	return (
		<AuthContext.Provider
			value={{ auth, isLoading, login, logout, refreshToken }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
