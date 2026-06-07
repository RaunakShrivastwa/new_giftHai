import { Link, useNavigate, useSearchParams } from "react-router-dom"; // Added useSearchParams
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/dataStore";
import { loginUser } from "../slice/authSlice"; // Note: ensure your slice has a sync action to save external tokens if needed

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook to parse ?token=XYZ
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const { error, loading, user } = useSelector(
    (state: RootState) => state.auth,
  );

  // 1. Monitor incoming OAuth redirect parameters
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      try {
        // Option A: If your slice has a dedicated reducer to manually set a token
        // dispatch(setOAuthCredentials({ token }));

        // Option B: If your login flow saves tokens into LocalStorage, do it here and update state
        localStorage.setItem("token", token);

        // Optional: Trigger a profile fetch to get user data if token isn't enough,
        // or let your root app configuration pick up the token on next render.

        toast.success("Logged in with Google successfully! 💕", {
          className: "luxury_toast",
        });
        navigate("/");
      } catch (err) {
        toast.error("Failed to process Google sign-in credentials.");
      }
    }
  }, [searchParams, dispatch, navigate]);

  // 2. Normal redirect loop when user profile state is hydrated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      const resultAction = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        toast.success("Welcome back 💕", {
          className: "luxury_toast",
          style: {
            animation:
              "toastSlide 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          },
        });
      } else if (loginUser.rejected.match(resultAction)) {
        const serverError =
          (resultAction.payload as string) || "Invalid credentials";
        toast.error(serverError, { className: "luxury_toast" });
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    window.open(`${backendUrl}/oauth2/authorization/google`, "_self");
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
           
          >
            <img
              src="https://res.cloudinary.com/dnk5iqeup/image/upload/v1780836781/Gemini_Generated_Image_mn6xrmn6xrmn6xrm-removebg-preview_eoiwwq.png"
              alt=""
            />
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

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full mb-4 py-3 px-4 flex items-center justify-center gap-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all shadow-sm active:scale-[0.99]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        <div className="relative flex py-2 items-center my-2">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-xs text-gray-400 font-medium tracking-wide uppercase">
            or
          </span>
          <div className="flex-grow border-t border-gray-100"></div>
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
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:border-pink-400"
            style={{ borderColor: "var(--pink-200)" }}
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:border-pink-400"
            style={{ borderColor: "var(--pink-200)" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full text-white font-semibold disabled:opacity-50 transition-opacity active:scale-[0.98] transform duration-100"
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
