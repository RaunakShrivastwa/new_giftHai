import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signup(name, email, password);
    toast.success("Account created 🌸");
    navigate("/profile");
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6 py-16" style={{ background: "var(--gradient-soft)" }}>
      <div className="w-full max-w-md bg-white rounded-3xl border p-8" style={{ borderColor: "var(--pink-100)", boxShadow: "var(--shadow-soft)" }}>
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-full items-center justify-center text-white" style={{ background: "var(--gradient-rose)" }}><Heart className="w-5 h-5" fill="currentColor" /></div>
          <h1 className="mt-4 font-serif text-3xl" style={{ color: "var(--pink-900)" }}>Join the bloom</h1>
          <p className="text-sm text-muted-foreground mt-1">Save addresses, track gifts, and more.</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-xl border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--pink-200)" }} />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--pink-200)" }} />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6)" minLength={6} className="w-full rounded-xl border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--pink-200)" }} />
          <button type="submit" className="w-full py-3.5 rounded-full text-white font-semibold" style={{ background: "var(--gradient-rose)", boxShadow: "var(--shadow-soft)" }}>Create account</button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already a member? <Link to="/login" className="font-medium hover:underline" style={{ color: "var(--pink-700)" }}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}
