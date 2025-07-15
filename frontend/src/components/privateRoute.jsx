import { useContext } from "react";
import AuthContext from "../context/authContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
	const { auth, isLoading } = useContext(AuthContext);

	if (isLoading) return null;

	return auth?.access ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
