import authContext from "../context/authContext";
import { useContext } from "react";

const AdminRoute = ({ children }) => {
	const { auth } = useContext(authContext);

	return auth?.user?.role == "admin" ? (
		children
	) : (
		<div className="text-center text-red-500">Access Denied: Admins Only</div>
	);
};

export default AdminRoute;
