import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminDashboard() {

  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [customers, setCustomers] = useState([]);

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

      const res = await API.get("/auth/workers");

      setWorkers(res.data);

    } catch (error) {

      console.error(
        "Error fetching workers:",
        error
      );

    }

  };


  // =====================================================
  // FETCH CUSTOMERS
  // =====================================================

  const fetchCustomers = async () => {

    try {

      const res = await API.get("/auth/customers");

      setCustomers(res.data);

    } catch (error) {

      console.error(
        "Error fetching customers:",
        error
      );

    }

  };


  // =====================================================
  // LOAD ALL USERS
  // =====================================================

  const loadUsers = async () => {

    setLoading(true);

    await Promise.all([
      fetchWorkers(),
      fetchCustomers()
    ]);

    setLoading(false);

  };


  // =====================================================
  // DELETE USER
  // =====================================================

  const removeUser = async (userId, userName, role) => {

    const confirmed = window.confirm(
      `Are you sure you want to remove ${role} "${userName}"?`
    );

    if (!confirmed) {
      return;
    }


    try {

      await API.delete(
        `/auth/users/${userId}`
      );


      alert(
        `${role} removed successfully`
      );


      // Refresh dashboard
      await loadUsers();


    } catch (error) {

      console.error(
        "Delete user error:",
        error
      );


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
  // UI
  // =====================================================

  return (

    <div className="min-h-screen bg-gray-100">


      {/* =================================================
          NAVBAR
      ================================================= */}

      <div className="bg-purple-600 text-white flex justify-between items-center p-5">

        <h1 className="text-xl font-bold">
          Admin Dashboard
        </h1>


        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>

      </div>



      <div className="p-10">


        {loading ? (

          <p className="text-lg">
            Loading users...
          </p>

        ) : (

          <>


            {/* =================================================
                WORKERS
            ================================================= */}

            <h2 className="text-2xl font-bold mb-6">
              Registered Workers
            </h2>


            {workers.length === 0 ? (

              <p className="mb-10">
                No workers registered.
              </p>

            ) : (

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">


                {workers.map((worker) => (

                  <div
                    key={worker._id}
                    className="bg-white p-6 rounded shadow"
                  >


                    <h3 className="text-xl font-bold mb-3">
                      {worker.name}
                    </h3>


                    <p>
                      <b>Email:</b>{" "}
                      {worker.email}
                    </p>


                    <p>
                      <b>Phone:</b>{" "}
                      {worker.phone || "Not provided"}
                    </p>


                    <p>
                      <b>Skills:</b>{" "}

                      {worker.skills &&
                      worker.skills.length > 0
                        ? worker.skills.join(", ")
                        : "Not specified"}

                    </p>


                    <p>
                      <b>Experience:</b>{" "}

                      {worker.experience || 0}
                      {" "}years

                    </p>


                    <p>
                      <b>Rating:</b>{" "}
                      ⭐ {worker.rating || 4}
                    </p>


                    <p>
                      <b>Completed Jobs:</b>{" "}

                      {worker.completedJobs || 0}

                    </p>


                    <p className="mb-4">
                      <b>Status:</b>{" "}

                      {worker.isAvailable
                        ? "Available"
                        : "Busy"}

                    </p>


                    <button
                      onClick={() =>
                        removeUser(
                          worker._id,
                          worker.name,
                          "worker"
                        )
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Remove Worker
                    </button>


                  </div>

                ))}

              </div>

            )}



            {/* =================================================
                CUSTOMERS
            ================================================= */}

            <h2 className="text-2xl font-bold mb-6">
              Registered Customers
            </h2>


            {customers.length === 0 ? (

              <p>
                No customers registered.
              </p>

            ) : (

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">


                {customers.map((customer) => (

                  <div
                    key={customer._id}
                    className="bg-white p-6 rounded shadow"
                  >


                    <h3 className="text-xl font-bold mb-3">
                      {customer.name}
                    </h3>


                    <p>
                      <b>Email:</b>{" "}
                      {customer.email}
                    </p>


                    <p>
                      <b>Phone:</b>{" "}

                      {customer.phone ||
                        "Not provided"}

                    </p>


                    <p>
                      <b>Role:</b>{" "}
                      Customer
                    </p>


                    <p className="mb-4">
                      <b>Registered:</b>{" "}

                      {customer.createdAt
                        ? new Date(
                            customer.createdAt
                          ).toLocaleDateString()
                        : "Not available"}

                    </p>


                    <button
                      onClick={() =>
                        removeUser(
                          customer._id,
                          customer.name,
                          "customer"
                        )
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Remove Customer
                    </button>


                  </div>

                ))}

              </div>

            )}

          </>

        )}

      </div>

    </div>

  );

}

export default AdminDashboard;