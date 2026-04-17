import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppContext } from "../app/AppContext";
import { LoginForm } from "../components/forms/LoginForm";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (credentials) => {
    try {
      setError("");
      setIsSubmitting(true);
      const user = await login(credentials);

      if (user.role === "Admin") {
        navigate("/admin");
        return;
      }

      if (user.role === "Team Leader") {
        navigate("/team-leader");
        return;
      }

      navigate("/employee");
    } catch (loginError) {
      setError(loginError.message || "Unable to log in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginForm
      error={error}
      isSubmitting={isSubmitting}
      onLogin={handleLogin}
    />
  );
};
