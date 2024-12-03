import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const RouteProtector = () => {
  const currentUser = useSelector((state) => state.user.currentUser); // Ensure you're selecting the correct user data
  const token = useSelector((state) => state.user.token); // Make sure token is correctly selected
  const isLoading = useSelector((state) => state.user.singInLoader);
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      console.log("User is not authenticated.");
    }
  }, [currentUser]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Ensure both currentUser and token are present
  return currentUser && token ? (
    <Outlet />
  ) : (
    <Navigate to="/sign-in" state={{ from: location }} replace />
  );
};

export default RouteProtector;
