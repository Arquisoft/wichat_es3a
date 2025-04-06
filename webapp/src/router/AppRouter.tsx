import { Navigate, createBrowserRouter } from "react-router-dom";
import Login from "../components/Login/Login";
import AddUser from "../components/AddUser/AddUser";
import Main from "../components/Main/Main";
import Game from "../components/Game/Game";
import EndGame from "../components/Game/EndGame";
import Ranking from "../components/Ranking/Ranking";
import Historic from "../components/Historic/Historic";
import Api from "../components/Api/Api";

const router = createBrowserRouter([
    { path: "/", element: <Navigate to="/login" replace /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <AddUser /> },
    { path: "/main", element: <Main /> },
    { path: "/game", element: <Game /> },
    { path: "/endGame", element: <EndGame /> },
    { path: "/logout", element: <Login /> },
    { path: "/historic", element: <Historic /> },
    { path: "/ranking", element: <Ranking /> },
    { path: "/api", element: <Api /> },
]);

export default router;