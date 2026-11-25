import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// =====================================================
// REUSABLE SEARCH BAR
// IMPORTANT: Keep this component outside AdminDashboard.
// This prevents the input from losing focus while typing.
// =====================================================

function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder,
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
      className="flex w-full flex-col gap-3 sm:flex-row"
    >
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
        className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
      />

      <button
        type="submit"
        className="rounded-xl bg-purple-600 px-7 py-3 font-semibold text-white transition hover:bg-purple-700"
      >
        Search
      </button>

      <button
        type="button"
        onClick={onClear}
        className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
      >
        Clear
      </button>
    </form>
  );
}

// =====================================================
// ADMIN DASHBOARD
// =====================================================

function AdminDashboard() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [workers, setWorkers] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [activeTab, setActiveTab] = useState("workers");

  // Search input values
  const [workerSearch, setWorkerSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  // Applied search values
  const [appliedWorkerSearch, setAppliedWorkerSearch] =
    useState("");

  const [appliedCustomerSearch, setAppliedCustomerSearch] =
    useState("");

  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/");
  };

  // =====================================================
  // FETCH WORKERS
  // =====================================================

  const fetchWorkers = async () => {
    try {
      const response = await API.get("/auth/workers");

      setWorkers(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Error fetching workers:", error);
      setWorkers([]);
    }
  };

  // =====================================================
  // FETCH CUSTOMERS
  // =====================================================

  const fetchCustomers = async () => {
    try {
      const response = await API.get("/auth/customers");

      setCustomers(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    }
  };

  // =====================================================
  // LOAD ALL USERS
  // =====================================================

  const loadUsers = async () => {
    setLoading(true);

    try {
      await Promise.all([
        fetchWorkers(),
        fetchCustomers(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REMOVE USER
  // =====================================================

  const removeUser = async (userId, userName, role) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${role} "${userName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/auth/users/${userId}`);

      alert(`${role} removed successfully`);

      await loadUsers();
    } catch (error) {
      console.error("Delete user error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to remove user"
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadUsers();
  }, []);

  // =====================================================
  // FILTER WORKERS
  // =====================================================

  const workerSearchTerm = appliedWorkerSearch
    .trim()
    .toLowerCase();

  const filteredWorkers = workers.filter((worker) => {
    const name = (worker.name || "").toLowerCase();
    const email = (worker.email || "").toLowerCase();

    const phone = String(
      worker.phone || ""
    ).toLowerCase();

    const skills = Array.isArray(worker.skills)
      ? worker.skills.join(" ").toLowerCase()
      : String(worker.skills || "").toLowerCase();

    return (
      name.includes(workerSearchTerm) ||
      email.includes(workerSearchTerm) ||
      phone.includes(workerSearchTerm) ||
      skills.includes(workerSearchTerm)
    );
  });

  // =====================================================
  // FILTER CUSTOMERS
  // =====================================================

  const customerSearchTerm = appliedCustomerSearch
    .trim()
    .toLowerCase();

  const filteredCustomers = customers.filter((customer) => {
    const name = (customer.name || "").toLowerCase();
    const email = (customer.email || "").toLowerCase();

    const phone = String(
      customer.phone || ""
    ).toLowerCase();

    return (
      name.includes(customerSearchTerm) ||
      email.includes(customerSearchTerm) ||
      phone.includes(customerSearchTerm)
    );
  });

  // =====================================================
  // WORKER CARD
  // =====================================================

  const renderWorkerCard = (worker) => (
    <article
      key={worker._id}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="break-words text-xl font-bold text-gray-900">
            {worker.name}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Registered Worker
          </p>
        </div>

        <span
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
            worker.isAvailable
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {worker.isAvailable ? "Available" : "Busy"}
        </span>
      </div>

      <div className="space-y-2 break-words text-sm text-gray-700">
        <p>
          <strong>Email:</strong>{" "}
          {worker.email || "Not provided"}
        </p>

        <p>
          <strong>Phone:</strong>{" "}
          {worker.phone || "Not provided"}
        </p>

        <p>
          <strong>Skills:</strong>{" "}
          {Array.isArray(worker.skills) &&
          worker.skills.length > 0
            ? worker.skills.join(", ")
            : "Not specified"}
        </p>

        <p>
          <strong>Experience:</strong>{" "}
          {worker.experience || 0} years
        </p>

        <p>
          <strong>Rating:</strong>{" "}
          ⭐ {worker.rating ?? 0}
        </p>

        <p>
          <strong>Completed Jobs:</strong>{" "}
          {worker.completedJobs || 0}
        </p>
      </div>

      <button
        onClick={() =>
          removeUser(
            worker._id,
            worker.name,
            "worker"
          )
        }
        className="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
      >
        Remove Worker
      </button>
    </article>
  );

  // =====================================================
  // WORKER DISTRIBUTION BY PRIMARY SKILL
  // Each worker is counted once, using their first skill.
  // =====================================================

  const skillCounts = workers.reduce((counts, worker) => {
    const skills = Array.isArray(worker.skills) ? worker.skills : [];
    const rawSkill = skills.find(
      (skill) => typeof skill === "string" && skill.trim()
    );
    const skill = rawSkill
      ? rawSkill.trim().replace(/\s+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
      : "Not specified";

    counts[skill] = (counts[skill] || 0) + 1;
    return counts;
  }, {});

  const workerSkillStats = Object.entries(skillCounts)
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: workers.length ? (count / workers.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const chartColors = [
    "#9333ea",
    "#2563eb",
    "#059669",
    "#f59e0b",
    "#ef4444",
    "#0891b2",
    "#db2777",
    "#64748b",
    "#84cc16",
    "#7c3aed",
  ];

  // =====================================================
  // CUSTOMER CARD
  // =====================================================

  const renderCustomerCard = (customer) => (
    <article
      key={customer._id}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-5">
        <h3 className="break-words text-xl font-bold text-gray-900">
          {customer.name}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Registered Customer
        </p>
      </div>

      <div className="space-y-2 break-words text-sm text-gray-700">
        <p>
          <strong>Email:</strong>{" "}
          {customer.email || "Not provided"}
        </p>

        <p>
          <strong>Phone:</strong>{" "}
          {customer.phone || "Not provided"}
        </p>

        <p>
          <strong>Role:</strong> Customer
        </p>

        <p>
          <strong>Registered:</strong>{" "}
          {customer.createdAt
            ? new Date(
                customer.createdAt
              ).toLocaleDateString("en-IN")
            : "Not available"}
        </p>
      </div>

      <button
        onClick={() =>
          removeUser(
            customer._id,
            customer.name,
            "customer"
          )
        }
        className="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
      >
        Remove Customer
      </button>
    </article>
  );

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100">
      {/* =================================================
          TOP NAVBAR
      ================================================= */}

      <header className="sticky top-0 z-40 bg-purple-600 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div>
            <h1 className="text-2xl font-bold">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-purple-100">
              Manage registered workers and customers
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg bg-red-500 px-5 py-3 font-semibold transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* =================================================
            TOP MENU
        ================================================= */}

        <nav className="flex gap-2 overflow-x-auto border-t border-purple-400 px-5 pt-3 md:px-8">
          <button
            type="button"
            onClick={() => setActiveTab("workers")}
            className={`whitespace-nowrap border-b-4 px-5 py-3 font-semibold transition ${
              activeTab === "workers"
                ? "border-white bg-purple-700 text-white"
                : "border-transparent text-purple-100 hover:bg-purple-500"
            }`}
          >
            Workers ({workers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`whitespace-nowrap border-b-4 px-5 py-3 font-semibold transition ${
              activeTab === "customers"
                ? "border-white bg-purple-700 text-white"
                : "border-transparent text-purple-100 hover:bg-purple-500"
            }`}
          >
            Customers ({customers.length})
          </button>
        </nav>
      </header>

      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-700">
              Loading users...
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                WORKERS TAB
            ================================================= */}

            {activeTab === "workers" && (
              <section>
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                      Workforce Management
                    </p>

                    <h2 className="mt-1 text-3xl font-bold text-gray-900">
                      Registered Workers
                    </h2>

                    <p className="mt-2 text-gray-500">
                      Enter your search and click Search to find workers.
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-100 bg-white px-5 py-3 shadow-sm">
                    <p className="text-sm text-gray-500">
                      Total Workers
                    </p>

                    <p className="text-2xl font-bold text-purple-700">
                      {workers.length}
                    </p>
                  </div>
                </div>

                {/* WORKER DISTRIBUTION PIE CHART */}
                <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                  <div className="mb-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                      Workforce Analytics
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-gray-900">
                      Workers by Profession
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Percentage of registered workers by their primary skill.
                    </p>
                  </div>

                  {workers.length === 0 ? (
                    <p className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">
                      No worker data is available to display yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2">
                      <div className="h-72 min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={workerSkillStats}
                              dataKey="count"
                              nameKey="skill"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              innerRadius={48}
                              paddingAngle={2}
                              label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                              labelLine={false}
                            >
                              {workerSkillStats.map((entry, index) => (
                                <Cell
                                  key={`skill-${entry.skill}`}
                                  fill={chartColors[index % chartColors.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, _name, item) => [
                                `${value} worker${Number(value) === 1 ? "" : "s"} (${item.payload.percentage.toFixed(1)}%)`,
                                item.payload.skill,
                              ]}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-3">
                        <div className="mb-3 rounded-xl bg-purple-50 p-4">
                          <p className="text-sm text-purple-700">Total registered workers</p>
                          <p className="text-3xl font-bold text-purple-800">{workers.length}</p>
                        </div>
                        {workerSkillStats.map((item, index) => (
                          <div key={item.skill} className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: chartColors[index % chartColors.length] }}
                              />
                              <span className="truncate text-sm font-medium text-gray-700">
                                {item.skill}
                              </span>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="font-semibold text-gray-900">{item.count}</span>
                              <span className="ml-2 text-sm text-gray-500">
                                {item.percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* WORKER SEARCH */}

                <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <SearchBar
                    value={workerSearch}
                    onChange={setWorkerSearch}
                    onSearch={() =>
                      setAppliedWorkerSearch(workerSearch)
                    }
                    onClear={() => {
                      setWorkerSearch("");
                      setAppliedWorkerSearch("");
                    }}
                    placeholder="Search by name, email, phone or skill..."
                  />

                  <p className="mt-3 text-sm text-gray-500">
                    Showing{" "}
                    <strong className="text-gray-900">
                      {filteredWorkers.length}
                    </strong>{" "}
                    of {workers.length} workers
                  </p>
                </div>

                {/* WORKER RESULTS */}

                {filteredWorkers.length === 0 ? (
                  <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800">
                      {workers.length === 0
                        ? "No workers registered"
                        : "No matching workers found"}
                    </h3>

                    <p className="mt-2 text-gray-500">
                      Try a different name, email, phone number or skill.
                    </p>

                    {appliedWorkerSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setWorkerSearch("");
                          setAppliedWorkerSearch("");
                        }}
                        className="mt-4 rounded-lg bg-purple-600 px-5 py-2 text-white hover:bg-purple-700"
                      >
                        Show All Workers
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredWorkers.map(renderWorkerCard)}
                  </div>
                )}
              </section>
            )}

            {/* =================================================
                CUSTOMERS TAB
            ================================================= */}

            {activeTab === "customers" && (
              <section>
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Customer Management
                    </p>

                    <h2 className="mt-1 text-3xl font-bold text-gray-900">
                      Registered Customers
                    </h2>

                    <p className="mt-2 text-gray-500">
                      Enter your search and click Search to find customers.
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-white px-5 py-3 shadow-sm">
                    <p className="text-sm text-gray-500">
                      Total Customers
                    </p>

                    <p className="text-2xl font-bold text-blue-700">
                      {customers.length}
                    </p>
                  </div>
                </div>

                {/* CUSTOMER SEARCH */}

                <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <SearchBar
                    value={customerSearch}
                    onChange={setCustomerSearch}
                    onSearch={() =>
                      setAppliedCustomerSearch(customerSearch)
                    }
                    onClear={() => {
                      setCustomerSearch("");
                      setAppliedCustomerSearch("");
                    }}
                    placeholder="Search by customer name, email or phone..."
                  />

                  <p className="mt-3 text-sm text-gray-500">
                    Showing{" "}
                    <strong className="text-gray-900">
                      {filteredCustomers.length}
                    </strong>{" "}
                    of {customers.length} customers
                  </p>
                </div>

                {/* CUSTOMER RESULTS */}

                {filteredCustomers.length === 0 ? (
                  <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800">
                      {customers.length === 0
                        ? "No customers registered"
                        : "No matching customers found"}
                    </h3>

                    <p className="mt-2 text-gray-500">
                      Try a different name, email or phone number.
                    </p>

                    {appliedCustomerSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerSearch("");
                          setAppliedCustomerSearch("");
                        }}
                        className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                      >
                        Show All Customers
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCustomers.map(renderCustomerCard)}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;