import { useEffect, useState } from "react";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    setError("Please login first");
                    return;
                }

                const response = await fetch(
                    "http://localhost:5000/api/auth/profile",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message);
                    return;
                }

                setUser(data.user);

            } catch (error) {
                console.error(error);
                setError("Unable to connect to server");
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/";
    };

    if (error) {
        return (
            <div>
                <h2>{error}</h2>
                <button onClick={() => {
                    window.location.href = "/";
                }}>
                    Go to Login
                </button>
            </div>
        );
    }

    if (!user) {
        return <h2>Loading...</h2>;
    }

    return (
        <div>
            <h1>Welcome to StudentMart</h1>

            <h2>Hello, {user.name}!</h2>

            <p>Email: {user.email}</p>

            <hr />

            <h3>Student Dashboard</h3>

            <button>
                Browse Products
            </button>

            <button>
                Sell an Item
            </button>

            <button>
                My Products
            </button>

            <button>
                My Orders
            </button>

            <br />
            <br />

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default Dashboard;