import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../../store/authSlice";
import toast from "react-hot-toast";

// TEMPORARY dev-only page — paste a token from GET /api/test-token (backend stub)
// to authenticate the frontend before real login exists. Remove before integration.
export default function DevLoginPage() {
  const [token, setToken] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!token.trim()) {
      toast.error("Paste a token first");
      return;
    }
    try {
      dispatch(setCredentials({ accessToken: token.trim() }));
      toast.success("Logged in (dev)");
      navigate("/assessment");
    } catch {
      toast.error("Invalid token");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold text-slate-800">
          Dev Login (temporary)
        </h1>
        <p className="text-sm text-slate-500">
          Get a token from{" "}
          <code className="text-brand-600">GET /api/test-token</code> in
          Swagger, paste it here.
        </p>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
          placeholder="Paste JWT here"
          className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2 font-medium"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
