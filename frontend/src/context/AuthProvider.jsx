import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import Cookies from "js-cookie";

import AuthContext from "./authContext";

const AuthProvider = ({ children }) => {
	const [auth, setAuth] = useState({
		access: null,
		user: {
			id: null,
			email: null,
			role: null,
		},
	});

	const refreshToken = useCallback(async () => {
		try {
			const refresh = Cookies.get("refresh");
			if (!refresh) {
				throw new Error("No refresh token available");
			}

			const response = await api.post("/auth/refresh", { refresh });

			if (response.status === 200) {
				const newAccess = response.data.access;
				Cookies.set("access", newAccess, { secure: true, sameSite: "strict" });
				api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
				setAuth({ access: newAccess, user: jwtDecode(newAccess) });
				return newAccess;
			} else {
				throw new Error("Failed to refresh token");
			}
		} catch (error) {
			console.error("Token refresh failed:", error);
			logout();
			return null;
		}
	}, []);

	useEffect(() => {
		const initAuth = async () => {
			const access = Cookies.get("access");
			if (!access) return;

			try {
				const decoded = jwtDecode(access);

				if (decoded.exp * 1000 > Date.now()) {
					// Token is still valid
					setAuth({ access, user: decoded });
					api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
				} else {
					// Token has expired, try refreshing
					await refreshToken();
				}
			} catch (error) {
				console.error("Auth initialization failed:", error);
				logout();
			}
		};

		initAuth();
	}, [refreshToken]);

	const login = (access, refresh) => {
		try {
			const decoded = jwtDecode(access);
			console.log("Decoded JWT:", decoded);
			Cookies.set("access", access, { secure: true, sameSite: "strict" });
			Cookies.set("refresh", refresh, { secure: true, sameSite: "strict" });
			api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
			setAuth({
				access,
				user: { id: decoded.id, email: decoded.email, role: decoded.role },
			});
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	const logout = () => {
		Cookies.remove("access");
		Cookies.remove("refresh");
		delete api.defaults.headers.common["Authorization"];
		setAuth({ access: null, user: null });
	};

	return (
		<AuthContext.Provider value={{ auth, login, logout, refreshToken }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
