import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Outlet,
  Link,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Nav from "./components/navigation/Nav";
import RouteProtector from "./components/navigation/RouteProtector";
import UserFypPage from "./pages/userPages/UserFypPage";
import ErrorBoundary from "./utils/ErrorBoundary";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Public Routes */}
      <Route index element={<Home />} />
      <Route
        path="signup"
        element={
          <ErrorBoundary>
            <SignUp />
          </ErrorBoundary>
        }
      />
      <Route
        path="sign-in"
        element={
          <ErrorBoundary>
            <SignIn />
          </ErrorBoundary>
        }
      />

      {/* Protected Routes */}
      <Route element={<RouteProtector />}>
        <Route path="nav" element={<Nav />}>
          <Route path="fyp" element={<UserFypPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="about" element={<About />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/sign-in" />} />

    </Route>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
