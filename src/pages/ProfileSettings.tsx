import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";

export default function ProfileSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const inputCls = "rounded-xl border px-4 py-3 text-sm outline-none";
  const inputStyle = { borderColor: "var(--pink-200)" } as React.CSSProperties;

  return (
    <div
      className="bg-white rounded-2xl border p-6 shadow-sm space-y-6"
      style={{ borderColor: "var(--pink-100)" }}
    >
      <div>
        <h2
          className="font-serif text-2xl"
          style={{ color: "var(--pink-900)" }}
        >
          Account settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your details and preferences.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          defaultValue={user?.name}
          placeholder="Full name"
          className={inputCls}
          style={inputStyle}
        />
        <input
          defaultValue={user?.email}
          placeholder="Email"
          className={inputCls}
          style={inputStyle}
        />
        <input placeholder="Phone" className={inputCls} style={inputStyle} />
        <input placeholder="Birthday" className={inputCls} style={inputStyle} />
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" defaultChecked />
        Email me gift inspiration weekly
      </label>
      <div
        className="flex gap-3 pt-4 border-t"
        style={{ borderColor: "var(--pink-100)" }}
      >
        <button
          onClick={() => toast.success("Settings saved 💕")}
          className="px-6 py-2.5 rounded-full text-white text-sm font-semibold"
          style={{ background: "var(--gradient-rose)" }}
        >
          Save changes
        </button>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="px-6 py-2.5 rounded-full bg-white border text-sm font-medium"
          style={{ borderColor: "var(--pink-300)", color: "var(--pink-700)" }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
