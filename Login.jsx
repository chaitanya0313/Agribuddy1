import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  // Simplified state for Email + Password login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── NEW LOGIN HANDLER (JWT BASED) ──────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/farmers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("⚠️ Login failed:", data.message);
        throw new Error(data.message || "Invalid credentials");
      }

      // ✅ Store JWT and farmer info for use across the app
      localStorage.setItem("agri_token", data.token);
      localStorage.setItem("agri_farmer_name", data.name);
      localStorage.setItem("agri_farmer_id", data.farmerId);

      console.log("✅ Login successful! Token stored.");
      alert("Login successful ✅");
      navigate("/dashboard");

    } catch (err) {
      console.error("❌ Error during login:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf7]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">AgriFinTech</h1>
          <p className="text-gray-500 text-sm">Smart farming, better profits</p>
        </div>

        <h2 className="text-xl font-semibold text-center text-green-700">Welcome back!</h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Sign in with your registered email
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login ✓"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-green-700 font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}