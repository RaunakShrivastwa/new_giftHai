import { cloneElement, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactElement, ReactNode } from "react";
import { useSelector } from "react-redux";
import {
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { RootState } from "../store/dataStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const DELIVERY_LOCATION_KEY = "giftHai.deliveryLocation";

type AddressForm = {
  state: string;
  pincode: string;
  landmark: string;
};

type ProfileForm = {
  fname: string;
  lname: string;
  email: string;
  role: string;
  address: AddressForm[];
  mobileNumbers: string[];
};

type SavedDeliveryLocation = {
  label?: string;
  pincode?: string;
};

type StoreUser = Partial<ProfileForm> & {
  id?: string;
  _id?: string;
  userId?: string;
  token?: string;
  accessToken?: string;
};

type AuthStateLike = {
  user?: StoreUser;
  token?: string;
  accessToken?: string;
  jwt?: string;
  userId?: string;
};

const emptyAddress = (): AddressForm => ({
  state: "",
  pincode: "",
  landmark: "",
});

const emptyForm: ProfileForm = {
  fname: "",
  lname: "",
  email: "",
  role: "CUSTOMER",
  address: [emptyAddress()],
  mobileNumbers: [""],
};

function readSavedDeliveryAddress(): AddressForm | null {
  try {
    const raw = localStorage.getItem(DELIVERY_LOCATION_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw) as SavedDeliveryLocation;
    if (!saved.label && !saved.pincode) return null;

    const labelParts = (saved.label || "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    return {
      state: labelParts.length > 1 ? labelParts[labelParts.length - 2] : "",
      pincode: saved.pincode || "",
      landmark: saved.label || "",
    };
  } catch {
    return null;
  }
}

function normalizeAddresses(addresses: AddressForm[] | undefined) {
  if (Array.isArray(addresses) && addresses.length > 0) {
    return addresses.map((address) => ({
      state: address?.state || "",
      pincode: address?.pincode || "",
      landmark: address?.landmark || "",
    }));
  }

  const savedAddress = readSavedDeliveryAddress();
  return [savedAddress || emptyAddress()];
}

function normalizeMobileNumbers(mobileNumbers: string[] | undefined) {
  if (Array.isArray(mobileNumbers) && mobileNumbers.length > 0) {
    return mobileNumbers.map((mobile) => String(mobile || ""));
  }

  return [""];
}

export default function ProfileSettings() {
  const authState = useSelector(
    (state: RootState) => state.auth,
  ) as AuthStateLike;
  const user = authState?.user;
  const token =
    authState?.token ||
    authState?.accessToken ||
    authState?.jwt ||
    user?.token ||
    user?.accessToken;
  const userId = user?.id || user?._id || user?.userId || authState?.userId;

  const initialForm = useMemo<ProfileForm>(
    () => ({
      fname: user?.fname || "",
      lname: user?.lname || "",
      email: user?.email || "",
      role: user?.role || "CUSTOMER",
      address: normalizeAddresses(user?.address),
      mobileNumbers: normalizeMobileNumbers(user?.mobileNumbers),
    }),
    [user],
  );

  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const updateAddress = (
    index: number,
    field: keyof AddressForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      address: current.address.map((address, i) =>
        i === index ? { ...address, [field]: value } : address,
      ),
    }));
  };

  const updateMobile = (index: number, value: string) => {
    setForm((current) => ({
      ...current,
      mobileNumbers: current.mobileNumbers.map((mobile, i) =>
        i === index ? value.replace(/\D/g, "").slice(0, 10) : mobile,
      ),
    }));
  };

  const addAddress = () => {
    setForm((current) => ({
      ...current,
      address: [...current.address, emptyAddress()],
    }));
  };

  const removeAddress = (index: number) => {
    setForm((current) => ({
      ...current,
      address:
        current.address.length > 1
          ? current.address.filter((_, i) => i !== index)
          : current.address,
    }));
  };

  const addMobile = () => {
    setForm((current) => ({
      ...current,
      mobileNumbers: [...current.mobileNumbers, ""],
    }));
  };

  const removeMobile = (index: number) => {
    setForm((current) => ({
      ...current,
      mobileNumbers:
        current.mobileNumbers.length > 1
          ? current.mobileNumbers.filter((_, i) => i !== index)
          : current.mobileNumbers,
    }));
  };

  const applySavedLocation = () => {
    const savedAddress = readSavedDeliveryAddress();
    if (!savedAddress) {
      toast.error("No saved delivery location found.");
      return;
    }

    setForm((current) => ({
      ...current,
      address: current.address.length
        ? [savedAddress, ...current.address.slice(1)]
        : [savedAddress],
    }));
    toast.success("Saved delivery location added as default address.");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Could not find logged-in user id.");
      return;
    }

    const payload: ProfileForm = {
      fname: form.fname.trim(),
      lname: form.lname.trim(),
      email: form.email.trim(),
      role: form.role,
      address: form.address.map((address) => ({
        state: address.state.trim(),
        pincode: address.pincode.trim(),
        landmark: address.landmark.trim(),
      })),
      mobileNumbers: form.mobileNumbers
        .map((mobile) => mobile.trim())
        .filter(Boolean),
    };

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Profile update failed");

      toast.success("Profile settings updated.");
    } catch {
      toast.error("Could not update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <form
        onSubmit={submit}
        className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[320px_1fr]"
      >
        <aside className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <User className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-gray-900">
                Profile Settings
              </h1>
              <p className="truncate text-sm text-gray-500">{form.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <InfoRow icon={<ShieldCheck />} label="Role" value={form.role} />
            <InfoRow
              icon={<MapPin />}
              label="Saved addresses"
              value={String(form.address.length)}
            />
            <InfoRow
              icon={<Phone />}
              label="Mobile numbers"
              value={String(form.mobileNumbers.filter(Boolean).length)}
            />
          </div>

          <button
            type="button"
            onClick={applySavedLocation}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <MapPin className="h-4 w-4" />
            Use saved delivery location
          </button>
        </aside>

        <section className="space-y-5">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">
                Personal details
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <input
                  value={form.fname}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      fname: e.target.value,
                    }))
                  }
                  className="field-input"
                />
              </Field>
              <Field label="Last name">
                <input
                  value={form.lname}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      lname: e.target.value,
                    }))
                  }
                  className="field-input"
                />
              </Field>
              <Field label="Email">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        email: e.target.value,
                      }))
                    }
                    className="field-input pl-9"
                  />
                </div>
              </Field>
              <Field label="Role">
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      role: e.target.value,
                    }))
                  }
                  className="field-input"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900">Addresses</h2>
              </div>
              <button
                type="button"
                onClick={addAddress}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                Add address
              </button>
            </div>

            <div className="space-y-4">
              {form.address.map((address, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-gray-700">
                      Address {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAddress(index)}
                      disabled={form.address.length === 1}
                      className="rounded-md p-2 text-gray-400 hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Remove address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="State">
                      <input
                        value={address.state}
                        onChange={(e) =>
                          updateAddress(index, "state", e.target.value)
                        }
                        className="field-input bg-white"
                        placeholder="Delhi"
                      />
                    </Field>
                    <Field label="Pincode">
                      <input
                        inputMode="numeric"
                        maxLength={6}
                        value={address.pincode}
                        onChange={(e) =>
                          updateAddress(
                            index,
                            "pincode",
                            e.target.value.replace(/\D/g, ""),
                          )
                        }
                        className="field-input bg-white"
                        placeholder="110001"
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Landmark / full address">
                        <textarea
                          rows={3}
                          value={address.landmark}
                          onChange={(e) =>
                            updateAddress(index, "landmark", e.target.value)
                          }
                          className="field-input resize-none bg-white"
                          placeholder="Gali no, block, street, landmark"
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900">
                  Mobile numbers
                </h2>
              </div>
              <button
                type="button"
                onClick={addMobile}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                Add number
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {form.mobileNumbers.map((mobile, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => updateMobile(index, e.target.value)}
                    className="field-input"
                    placeholder="9876543210"
                  />
                  <button
                    type="button"
                    onClick={() => removeMobile(index)}
                    disabled={form.mobileNumbers.length === 1}
                    className="rounded-lg border border-gray-200 px-3 text-gray-400 hover:bg-gray-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Remove mobile number"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-lg sm:border sm:px-5">
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:ml-auto sm:w-auto"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </section>
      </form>

      <style>{`
        .field-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: #111827;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .field-input:focus {
          border-color: #e11d48;
          box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.12);
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactElement<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2 text-gray-500">
        {cloneElement(icon, { className: "h-4 w-4 shrink-0" })}
        <span className="truncate">{label}</span>
      </div>
      <span className="shrink-0 font-bold text-gray-900">{value}</span>
    </div>
  );
}
