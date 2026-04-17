import { useState } from "react";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { roles } from "../../data/mockData";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { InputField } from "../ui/InputField";

export const LoginForm = ({ onLogin }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "Admin",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    if (!form.role) {
      nextErrors.role = "Please select a role.";
    }

    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onLogin(form.role);
  };

  return (
    <div className="grid min-h-screen bg-glow px-4 py-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden rounded-[2rem] bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(22,163,74,0.35),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(29,78,216,0.35),transparent_32%)]" />
        <div className="relative">
          <div className="inline-flex rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold">
            PragatiDesk
          </div>
          <h1 className="mt-10 max-w-xl text-5xl font-bold leading-tight">
            Stay aligned on tickets, tasks, and performance from one calm
            workspace.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/75">
            A focused SaaS dashboard for admins, team leaders, and employees to
            move work forward with better visibility and faster decisions.
          </p>
        </div>

        <div className="relative grid gap-4 md:grid-cols-3">
          {["Role-based views", "Task timers", "Performance insights"].map(
            (item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-medium text-white/70">Feature</p>
                <p className="mt-2 text-lg font-semibold">{item}</p>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="flex items-center justify-center px-0 py-6 lg:px-10">
        <Card className="w-full max-w-xl border-white/80 p-8 sm:p-10">
          <div className="mb-8">
            <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-brand-primary">
              <BriefcaseBusiness size={22} />
            </div>
            <h2 className="mt-5 text-3xl font-bold text-brand-text">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-brand-muted">
              Sign in with a role to preview the full PragatiDesk experience.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <InputField
              label="Work email"
              placeholder="you@pragatidesk.com"
              value={form.email}
              error={errors.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
            <InputField
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              error={errors.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
            <InputField
              label="Login as"
              as="select"
              value={form.role}
              error={errors.role}
              options={roles.map((role) => ({ value: role, label: role }))}
              onChange={(event) =>
                setForm((current) => ({ ...current, role: event.target.value }))
              }
            />

            <Button className="w-full justify-between px-5 py-3" type="submit">
              Continue to dashboard
              <ArrowRight size={18} />
            </Button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-brand-muted">
            Demo access works with any email/password pair. Role selection
            controls the dashboard view.
          </div>
        </Card>
      </section>
    </div>
  );
};
