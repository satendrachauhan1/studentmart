import { useState } from "react";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
    const [page, setPage] = useState("register");

    const token = localStorage.getItem("token");

    if (token) {
        return <Dashboard />;
    }

    return (
        <div>
            {page === "register" && (
                <Register
                    onRegisterSuccess={() => setPage("login")}
                />
            )}

            {page === "login" && (
                <Login />
            )}
        </div>
    );
}

export default App;