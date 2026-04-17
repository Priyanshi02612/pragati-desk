import { Navigate, Route, Routes } from "react-router-dom";
import { AppContext } from "./AppContext";
import { Loader } from "../components/ui/Loader";
import { useDashboardData } from "../hooks/useDashboardData";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";
import { AdminEmployeesPage } from "../pages/AdminEmployeesPage";
import { AdminTicketsPage } from "../pages/AdminTicketsPage";
import { EmployeeDashboardPage } from "../pages/EmployeeDashboardPage";
import { LeaderboardPage } from "../pages/LeaderboardPage";
import { LoginPage } from "../pages/LoginPage";
import { PerformancePage } from "../pages/PerformancePage";
import { TeamLeaderDashboardPage } from "../pages/TeamLeaderDashboardPage";
import { TeamLeaderTasksPage } from "../pages/TeamLeaderTasksPage";

const ProtectedRoute = ({ children, allowedRoles, currentUser }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    const destinations = {
      Admin: "/admin",
      "Team Leader": "/team-leader",
      Employee: "/employee",
    };

    return <Navigate to={destinations[currentUser.role]} replace />;
  }

  return children;
};

const HomeRedirect = ({ currentUser }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role === "Admin") {
    return <Navigate to="/admin" replace />;
  }

  if (currentUser.role === "Team Leader") {
    return <Navigate to="/team-leader" replace />;
  }

  return <Navigate to="/employee" replace />;
};

function App() {
  const state = useDashboardData();

  if (!state) {
    return <Loader />;
  }

  return (
    <AppContext.Provider value={state}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={<HomeRedirect currentUser={state.currentUser} />}
        />
        <Route
          element={
            <ProtectedRoute
              currentUser={state.currentUser}
              allowedRoles={["Admin", "Team Leader", "Employee"]}
            >
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                currentUser={state.currentUser}
                allowedRoles={["Admin"]}
              >
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute
                currentUser={state.currentUser}
                allowedRoles={["Admin"]}
              >
                <AdminEmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute
                currentUser={state.currentUser}
                allowedRoles={["Admin"]}
              >
                <AdminTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-leader"
            element={
              <ProtectedRoute
                currentUser={state.currentUser}
                allowedRoles={["Team Leader"]}
              >
                <TeamLeaderDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-leader/tasks"
            element={
              <ProtectedRoute
                currentUser={state.currentUser}
                allowedRoles={["Team Leader"]}
              >
                <TeamLeaderTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee"
            element={
              <ProtectedRoute
                currentUser={state.currentUser}
                allowedRoles={["Employee"]}
              >
                <EmployeeDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default App;
