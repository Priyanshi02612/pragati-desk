import { Camera, KeyRound, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "../app/AppContext";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { DEPARTMENT_OPTIONS } from "../constants/departments";
import { uploadImageToCloudinary } from "../services/cloudinaryApi";

const buildInitialForm = (currentUser) => ({
  name: currentUser?.name || "",
  department: currentUser?.department || "",
  avatar: currentUser?.avatar || "",
  avatarFile: null,
  currentPassword: "",
  newPassword: "",
});

export const EmployeeProfileSettingsPage = () => {
  const { currentUser, updateProfile } = useAppContext();
  const [form, setForm] = useState(() => buildInitialForm(currentUser));
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(buildInitialForm(currentUser));
  }, [currentUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      let avatar = form.avatar;

      if (form.avatarFile) {
        avatar = await uploadImageToCloudinary(form.avatarFile);
      }

      await updateProfile({
        name: form.name,
        department: form.department,
        avatar,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setForm((current) => ({
        ...current,
        avatar,
        avatarFile: null,
        currentPassword: "",
        newPassword: "",
      }));
      setSuccessMessage("Profile settings updated successfully.");
    } catch (submitError) {
      setError(submitError.message || "Unable to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasPasswordChange = Boolean(form.currentPassword || form.newPassword);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-sm font-medium text-white/70">Profile settings</p>
            <h2 className="mt-2 text-2xl font-semibold">Keep your account up to date</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Update the identity your teammates see across assignments, notifications,
              and dashboards. Password changes stay optional and only apply when you
              fill both password fields.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <Avatar src={form.avatar || currentUser.avatar} name={form.name || currentUser.name} size="lg" />
              <div>
                <p className="text-base font-semibold">{form.name || currentUser.name}</p>
                <p className="text-sm text-white/70">
                  {currentUser.role} • {form.department || currentUser.department}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <Card>
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        </Card>
      ) : null}

      {successMessage ? (
        <Card>
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        </Card>
      ) : null}

      <form className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-2xl bg-blue-50 p-3 text-brand-secondary">
                <UserRound size={18} />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-brand-text">Personal details</h3>
                <p className="text-sm text-brand-muted">
                  Adjust the profile details shown in your workspace.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Full name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Enter your full name"
              />
              <InputField label="Work email" value={currentUser.email} readOnly />
              <InputField
                label="Department"
                as="select"
                value={form.department}
                options={DEPARTMENT_OPTIONS.map((department) => ({
                  value: department,
                  label: department,
                }))}
                onChange={(event) =>
                  setForm((current) => ({ ...current, department: event.target.value }))
                }
              />
              <InputField label="Role" value={currentUser.role} readOnly />
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-2xl bg-emerald-50 p-3 text-brand-primary">
                <Camera size={18} />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-brand-text">Avatar</h3>
                <p className="text-sm text-brand-muted">
                  Upload a fresh profile photo or keep your current image.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-slate-50 p-5">
              <Avatar src={form.avatar || currentUser.avatar} name={form.name || currentUser.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-brand-text">Visible in tasks and notifications</p>
                <p className="mt-1 text-sm text-brand-muted">
                  {form.avatarFile ? `Selected image: ${form.avatarFile.name}` : "No new file selected."}
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-text shadow-sm transition hover:bg-slate-100">
                Choose image
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      avatarFile: event.target.files?.[0] || null,
                    }))
                  }
                />
              </label>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-2xl bg-amber-50 p-3 text-brand-accent">
                <KeyRound size={18} />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-brand-text">Security</h3>
                <p className="text-sm text-brand-muted">
                  Leave the password fields empty if you only want to update profile details.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <InputField
                label="Current password"
                type="password"
                value={form.currentPassword}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                placeholder="Required only when changing password"
              />
              <InputField
                label="New password"
                type="password"
                value={form.newPassword}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                placeholder="Enter a new password"
              />
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-2xl bg-slate-100 p-3 text-brand-text">
                <ShieldCheck size={18} />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-brand-text">Account summary</h3>
                <p className="text-sm text-brand-muted">
                  A quick check before you save your changes.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
                  Contact
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm text-brand-text">
                  <Mail size={16} className="text-brand-muted" />
                  {currentUser.email}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-brand-muted">
                {hasPasswordChange
                  ? "Password will be updated when you save."
                  : "Password will remain unchanged."}
              </div>
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={
                  isSaving ||
                  !form.name.trim() ||
                  !form.department.trim() ||
                  (form.newPassword && !form.currentPassword)
                }
              >
                <Save size={16} />
                {isSaving ? "Saving changes..." : "Save settings"}
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
