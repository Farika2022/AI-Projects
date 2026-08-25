import { useState } from "react";

interface LoginPageProps {
  onLogin: (token: string) => void;
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5056/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError("Invalid email or password");
        return;
      }

      const data = await response.json();
      onLogin(data.token);

    } catch {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "32px",
      background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
      <h2 style={{ marginBottom: "24px", color: "#111827" }}>SmartDesk Staff Login</h2>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5",
          borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
          color: "#b91c1c", fontSize: "14px" }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: "500",
          marginBottom: "4px", color: "#374151" }}>Email</label>
        <input type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="staff@smartdesk.com"
          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px",
            border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" as const }} />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: "500",
          marginBottom: "4px", color: "#374151" }}>Password</label>
        <input type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px",
            border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" as const }} />
      </div>

      <button onClick={handleLogin} disabled={loading}
        style={{ width: "100%", padding: "10px", borderRadius: "8px",
          border: "none", background: "#1d4ed8", color: "white",
          fontSize: "15px", fontWeight: "500", cursor: "pointer",
          opacity: loading ? 0.7 : 1 }}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </div>
  );
}

export default LoginPage;