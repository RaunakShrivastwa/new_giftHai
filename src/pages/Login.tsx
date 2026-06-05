import { Link, useNavigate } from "react-router-dom";
import {useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/dataStore";
import { loginUser } from "../slice/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading ,user} = useSelector((state: RootState) => state.auth);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      const resultAction = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        toast.success("Welcome back 💕", {
          className: "luxury_toast",
          style: {
            animation:
              "toastSlide 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          },
        });
        navigate("/");
      } else if (loginUser.rejected.match(resultAction)) {
        const serverError = resultAction.payload || "Invalid credentials";
        toast.error(serverError, { className: "luxury_toast" });
      }
    }
  };


  return (
    <main
      className="min-h-[80vh] flex items-center justify-center px-6 py-16"
      style={{ background: "var(--gradient-soft)" }}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl border p-8"
        style={{
          borderColor: "var(--pink-100)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div className="text-center mb-6">
          <div
            className="inline-flex w-12 h-12 rounded-full items-center justify-center text-white"
            style={{ background: "var(--gradient-rose)" }}
          >
            <Heart className="w-5 h-5" fill="currentColor" />
          </div>
          <h1
            className="mt-4 font-serif text-3xl"
            style={{ color: "var(--pink-900)" }}
          >
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to send love faster.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {error && (
            <div className="p-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl text-center animate-shake">
              {error}
            </div>
          )}

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: "var(--pink-200)" }}
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: "var(--pink-200)" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full text-white font-semibold disabled:opacity-50 transition-opacity"
            style={{
              background: "var(--gradient-rose)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          New here?{" "}
          <Link
            to="/signup"
            className="font-medium hover:underline"
            style={{ color: "var(--pink-700)" }}
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
