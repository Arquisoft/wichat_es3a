import { Navigate, createBrowserRouter } from "react-router-dom";
import Login from "../components/Login";
import AddUser from "../components/AddUser";
import React from "react";
const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" replace />,
},
{
    path: "/login",
        element: <Login />,
},
{
    path: "/register",
        element: <AddUser />,
},
]);

export default router;
