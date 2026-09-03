import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import WorkerRegister from "./pages/WorkerRegister";
import CustomerDashboard from "./pages/CustomerDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RequestHistory from "./pages/RequestHistory";
import Home from "./pages/Home";


function ProtectedRoute({ role, children }) {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {

    if (user.role === "admin") {
      return (
        <Navigate
          to="/admin-dashboard"
          replace
        />
      );
    }

    if (user.role === "worker") {
      return (
        <Navigate
          to="/worker-dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/customer-dashboard"
        replace
      />
    );
  }

  return children;
}


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =========================
            HOME
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =========================
            LOGIN
        ========================= */}

        {/* General login
            Shows Customer + Worker */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* Customer-only login */}

        <Route
          path="/customer-login"
          element={
            <Navigate
              to="/login?role=customer"
              replace
            />
          }
        />


        {/* Worker-only login */}

        <Route
          path="/worker-login"
          element={
            <Navigate
              to="/login?role=worker"
              replace
            />
          }
        />


        {/* =========================
            REGISTRATION
        ========================= */}

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/worker-register"
          element={<WorkerRegister />}
        />


        {/* =========================
            CUSTOMER DASHBOARD
        ========================= */}

        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute role="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================
            WORKER DASHBOARD
        ========================= */}

        <Route
          path="/worker-dashboard"
          element={
            <ProtectedRoute role="worker">
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================
            REQUEST HISTORY
        ========================= */}

        <Route
          path="/request-history"
          element={<RequestHistory />}
        />


        {/* =========================
            ADMIN DASHBOARD
        ========================= */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================
            UNKNOWN URL
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;