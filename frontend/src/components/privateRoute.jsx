import { useContext } from "react";
import AuthContext from "../context/authContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
	const { auth } = useContext(AuthContext);

	return auth?.access ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
