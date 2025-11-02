import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import NoPage from "./pages/noPage.jsx";
import DisplayOne from "./pages/displayOne.jsx";
import DisplayMany from "./pages/displayMany.jsx";
import Create from "./pages/create.jsx";
import Update from "./pages/update.jsx";
import Delete from "./pages/delete.jsx";
import Contact from "./pages/contact.jsx";
import StudyPlanUploader from "./pages/studyPlanner";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Dashboard from "./pages/dashboard.jsx";
import { SnackbarProvider } from "notistack";
import Wrap from "./wrap.jsx";
import AuthProvider from "./context/AuthProvider";
import PrivateRoute from "./components/privateRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
	return (
		<SnackbarProvider maxSnack={3}>
			<AuthProvider>
				<BrowserRouter>
					<Wrap>
						<Routes>
							<Route path="/" element={<Dashboard />} />
							<Route path="/contact" element={<Contact />} />
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />

							<Route
								path="/:type"
								element={
									<PrivateRoute>
										<DisplayMany />
									</PrivateRoute>
								}
							/>
							<Route
								path="/:type/create"
								element={
									<PrivateRoute>
										<AdminRoute>
											<Create />
										</AdminRoute>
									</PrivateRoute>
								}
							/>
							<Route
								path="/:type/:id"
								element={
									<PrivateRoute>
										<DisplayOne />
									</PrivateRoute>
								}
							/>
							<Route
								path="/:type/:id/update"
								element={
									<PrivateRoute>
										<AdminRoute>
											<Update />
										</AdminRoute>
									</PrivateRoute>
								}
							/>
							<Route
								path="/:type/:id/delete"
								element={
									<PrivateRoute>
										<AdminRoute>
											<Delete />
										</AdminRoute>
									</PrivateRoute>
								}
							/>
							<Route
								path="/study-plan"
								element={
									<PrivateRoute>
										<StudyPlanUploader />
									</PrivateRoute>
								}
							/>

							<Route path="*" element={<NoPage />} />
						</Routes>
					</Wrap>
				</BrowserRouter>
			</AuthProvider>
		</SnackbarProvider>
	);
}

export default App;
