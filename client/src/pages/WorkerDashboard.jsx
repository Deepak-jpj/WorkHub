import { useEffect, useState } from "react";
import API from "../services/api";
import Chatbot from "../components/Chatbot";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMapEvents
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    }
  });

  return null;
}

function WorkerDashboard() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [processingJob, setProcessingJob] = useState(null);
  const [paymentJob, setPaymentJob] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [workLocation, setWorkLocation] = useState(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [locationSaving, setLocationSaving] = useState(false);

  const loadUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getWorkerJobs = async () => {
    try {
      const response = await API.get("/job/worker-jobs");
      setJobs(response.data);
    } catch (error) {
      console.error("Error loading worker jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await API.put(`/notifications/read/${id}`, {});
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notification:", error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await API.put("/notifications/read-all", {});
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notifications:", error);
    }
  };

  const acceptJob = async (id) => {
    try {
      setProcessingJob(id);

      await API.put(`/job/accept/${id}`, {});

      await getWorkerJobs();
      await fetchNotifications();

      alert("Job accepted successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to accept job."
      );
    } finally {
      setProcessingJob(null);
    }
  };

  const rejectJob = async (id) => {
    if (!window.confirm("Are you sure you want to reject this job?")) {
      return;
    }

    try {
      setProcessingJob(id);

      await API.put(`/job/reject/${id}`, {});

      await getWorkerJobs();
      await fetchNotifications();

      alert("Job rejected successfully.");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to reject job."
      );
    } finally {
      setProcessingJob(null);
    }
  };

  const startJob = async (id) => {
    try {
      setProcessingJob(id);

      await API.put(`/job/start/${id}`, {});

      await getWorkerJobs();
      await fetchNotifications();

      alert("Job started successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to start job."
      );
    } finally {
      setProcessingJob(null);
    }
  };

  const completeJob = async (id) => {
    try {
      setProcessingJob(id);

      await API.put(`/job/complete/${id}`, {});

      await getWorkerJobs();
      await fetchNotifications();

      alert("Job completed! You can now request payment.");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to complete job."
      );
    } finally {
      setProcessingJob(null);
    }
  };

  const requestPayment = async (id) => {
    if (!upiId.trim()) {
      alert("Enter your UPI ID");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid payment amount");
      return;
    }

    try {
      setProcessingJob(id);

      await API.put(`/job/request-payment/${id}`, {
        upiId,
        amount: Number(amount)
      });

      setPaymentJob(null);
      setUpiId("");
      setAmount("");

      await getWorkerJobs();
      await fetchNotifications();

      alert("Payment request sent to customer!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to request payment"
      );
    } finally {
      setProcessingJob(null);
    }
  };

  // =====================================================
  // CHANGE WORKER AVAILABILITY
  // =====================================================

  const toggleAvailability = async () => {
    try {
      const res = await API.put("/auth/availability");

      const updatedUser = {
        ...user,
        isAvailable: res.data.isAvailable
      };

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      alert(res.data.message);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to update availability"
      );
    }
  };

  const openLocationPicker = () => {
    const saved = user?.location?.coordinates;

    if (Array.isArray(saved) && saved.length === 2) {
      setWorkLocation([Number(saved[1]), Number(saved[0])]);
    } else {
      setWorkLocation([20.5937, 78.9629]);
    }

    setSelectedPlace("");
    setLocationSearch("");
    setShowLocationPicker(true);
  };

  const searchWorkLocation = async () => {
    if (!locationSearch.trim()) {
      alert("Enter a place, area or PIN Code.");
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(locationSearch)}`
      );

      const data = await response.json();

      if (!data.length) {
        alert("Location not found. Try another place or PIN Code.");
        return;
      }

      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);

      setWorkLocation([lat, lng]);
      setSelectedPlace(data[0].display_name);
    } catch (error) {
      console.error("Location search error:", error);
      alert("Unable to search this location.");
    }
  };

  const reverseGeocode = async ([lat, lng]) => {
    setWorkLocation([lat, lng]);
    setSelectedPlace(
      `Selected location (${lat.toFixed(6)}, ${lng.toFixed(6)})`
    );

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );

      const data = await response.json();

      if (data?.display_name) {
        setSelectedPlace(data.display_name);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  const saveWorkLocation = async () => {
    if (!workLocation) {
      alert("Please select your work location on the map.");
      return;
    }

    try {
      setLocationSaving(true);

      const [lat, lng] = workLocation;

      const response = await API.put("/auth/location", {
        lat,
        lng
      });

      const updatedUser = {
        ...user,
        location: response.data.location
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowLocationPicker(false);

      alert("📍 Work location saved successfully!");
    } catch (error) {
      console.error("SAVE WORK LOCATION ERROR:", error);

      alert(
        error.response?.data?.message ||
        "Failed to save work location."
      );
    } finally {
      setLocationSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    loadUser();
    getWorkerJobs();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getWorkerJobs();
      fetchNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSkills = () => {
    if (!user) return "Not specified";

    if (
      Array.isArray(user.skills) &&
      user.skills.length
    ) {
      return user.skills
        .map(
          (s) =>
            s.charAt(0).toUpperCase() +
            s.slice(1)
        )
        .join(", ");
    }

    return user.skill || "Not specified";
  };

  const paidJobs = jobs.filter(
    (job) => job.paymentStatus === "paid"
  );

  const requestedJobs = jobs.filter(
    (job) => job.paymentStatus === "requested"
  );

  const totalEarned = paidJobs.reduce(
    (total, job) =>
      total + Number(job.payment || 0),
    0
  );

  const totalPending = requestedJobs.reduce(
    (total, job) =>
      total + Number(job.payment || 0),
    0
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  if (!user) {
    return (
      <div style={{ padding: "40px" }}>
        Loading worker profile...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        fontFamily: "Arial"
      }}
    >
      {/* HEADER */}

      <div
        style={{
          background: "#2563eb",
          color: "white",
          padding: "25px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h1>Worker Dashboard</h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >
          {/* NOTIFICATION */}

          <div style={{ position: "relative" }}>
            <button
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              style={{
                background: "#1d4ed8",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: "6px",
                fontSize: "20px",
                cursor: "pointer",
                position: "relative"
              }}
            >
              🔔

              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "#ef4444",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                    borderRadius: "50%",
                    minWidth: "22px",
                    height: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "50px",
                  width: "320px",
                  background: "white",
                  color: "black",
                  borderRadius: "10px",
                  boxShadow:
                    "0 5px 20px rgba(0,0,0,0.2)",
                  zIndex: 100
                }}
              >
                <div
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #ddd",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    Notifications
                  </h3>

                  {unreadCount > 0 && (
                    <button
                      onClick={
                        markAllNotificationsRead
                      }
                      style={{
                        border: "none",
                        background: "none",
                        color: "#2563eb",
                        cursor: "pointer",
                        fontSize: "13px"
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div
                  style={{
                    maxHeight: "320px",
                    overflowY: "auto"
                  }}
                >
                  {notifications.length === 0 ? (
                    <p
                      style={{
                        padding: "20px",
                        color: "#777"
                      }}
                    >
                      No notifications
                    </p>
                  ) : (
                    notifications.map(
                      (notification) => (
                        <div
                          key={notification._id}
                          onClick={() =>
                            !notification.isRead &&
                            markNotificationRead(
                              notification._id
                            )
                          }
                          style={{
                            padding: "15px",
                            borderBottom:
                              "1px solid #eee",
                            background:
                              notification.isRead
                                ? "white"
                                : "#eff6ff",
                            cursor: "pointer"
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontWeight:
                                notification.isRead
                                  ? "normal"
                                  : "bold"
                            }}
                          >
                            {notification.message}
                          </p>

                          <p
                            style={{
                              margin: "5px 0 0",
                              fontSize: "12px",
                              color: "#777"
                            }}
                          >
                            {formatDate(
                              notification.createdAt
                            )}
                          </p>

                          {!notification.isRead && (
                            <span
                              style={{
                                color: "#2563eb",
                                fontSize: "12px"
                              }}
                            >
                              New
                            </span>
                          )}
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            style={{
              background: "black",
              color: "white",
              border: "none",
              padding: "12px 22px",
              borderRadius: "6px"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "40px",
          maxWidth: "1200px",
          margin: "auto"
        }}
      >
        {/* PROFILE */}

        <h2>Your Profile</h2>

        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "10px"
          }}
        >
          <h2>{user.name}</h2>

          <p>
            <b>Email:</b> {user.email}
          </p>

          <p>
            <b>Phone:</b>{" "}
            {user.phone || "Not provided"}
          </p>

          <p>
            <b>Skill:</b> {getSkills()}
          </p>

          <p>
            <b>Experience:</b>{" "}
            {user.experience || 0} years
          </p>

          <p>
            <b>Rating:</b>{" "}
            ⭐ {user.rating || 0}
          </p>

          <p>
            <b>Completed Jobs:</b>{" "}
            {user.completedJobs || 0}
          </p>

          <p>
            <b>Status:</b>{" "}
            {user.isAvailable
              ? "Available"
              : "Not Available"}
          </p>

          {/* AVAILABILITY BUTTON */}

          <button
            onClick={toggleAvailability}
            style={{
  background: user.isAvailable ? "#dc2626" : "#16a34a",
  color: "white",
  border: "none",
  padding: "7px 12px",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  marginTop: "5px"
}}
          >
            {user.isAvailable
              ? "🔴 Go Unavailable"
              : "🟢 Go Available"}
          </button>

          <button
            onClick={openLocationPicker}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "7px 12px",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              marginTop: "8px",
              marginLeft: "8px"
            }}
          >
            📍 {user?.location?.coordinates?.length
              ? "Change Work Location"
              : "Set Work Location"}
          </button>

          {user?.location?.coordinates?.length === 2 && (
            <p
              style={{
                marginTop: "12px",
                color: "#475569",
                fontSize: "13px"
              }}
            >
              📍 Work location set
            </p>
          )}
        </div>

        {/* LOCATION PICKER MODAL */}

        {showLocationPicker && (
          <div
            onClick={() => setShowLocationPicker(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px"
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                width: "min(900px, 100%)",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 10px 35px rgba(0,0,0,0.25)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px"
                }}
              >
                <h2 style={{ margin: 0 }}>
                  📍 Select Work Location
                </h2>

                <button
                  onClick={() => setShowLocationPicker(false)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "26px",
                    cursor: "pointer"
                  }}
                >
                  ×
                </button>
              </div>

              <p style={{ color: "#64748b" }}>
                Search Hassan, Bangalore, a PIN Code, or click the
                exact place on the map.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "12px"
                }}
              >
                <input
                  value={locationSearch}
                  onChange={(e) =>
                    setLocationSearch(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchWorkLocation();
                    }
                  }}
                  placeholder="Search place or PIN Code"
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px"
                  }}
                />

                <button
                  onClick={searchWorkLocation}
                  style={{
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Search
                </button>
              </div>

              <div
                style={{
                  height: "420px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #cbd5e1"
                }}
              >
                <MapContainer
  key={
    workLocation
      ? workLocation.join(",")
      : "bengaluru-default"
  }

  center={
    workLocation || [12.9716, 77.5946]
  }

  zoom={
    workLocation
      ? 15
      : 12
  }

  minZoom={10}
  maxZoom={18}

  style={{
    height: "100%",
    width: "100%"
  }}

  scrollWheelZoom={true}
>
  <TileLayer
    attribution='&copy; OpenStreetMap contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

  <LocationPicker
    onSelect={reverseGeocode}
  />

  {workLocation && (
    <CircleMarker
      center={workLocation}
      radius={10}
      pathOptions={{
        color: "#dc2626",
        fillColor: "#ef4444",
        fillOpacity: 0.9
      }}
    />
  )}
</MapContainer>
              </div>

              <div
                style={{
                  marginTop: "12px",
                  padding: "10px",
                  background: "#f1f5f9",
                  borderRadius: "6px"
                }}
              >
                <b>Selected:</b>{" "}
                {selectedPlace ||
                  (workLocation
                    ? `${workLocation[0].toFixed(6)}, ${workLocation[1].toFixed(6)}`
                    : "Click the map to select a location")}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "15px"
                }}
              >
                <button
                  onClick={() => setShowLocationPicker(false)}
                  style={{
                    background: "#64748b",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={saveWorkLocation}
                  disabled={locationSaving || !workLocation}
                  style={{
                    background:
                      locationSaving || !workLocation
                        ? "#94a3b8"
                        : "#16a34a",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    cursor:
                      locationSaving || !workLocation
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: "bold"
                  }}
                >
                  {locationSaving
                    ? "Saving..."
                    : "💾 Save Work Location"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EARNINGS SUMMARY */}

        <h2 style={{ marginTop: "40px" }}>
          💰 Earnings Summary
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginTop: "20px"
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px",
              borderLeft: "5px solid #16a34a"
            }}
          >
            <h3>Total Earned</h3>

            <p
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#16a34a"
              }}
            >
              ₹{totalEarned}
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px",
              borderLeft: "5px solid #f59e0b"
            }}
          >
            <h3>Pending Payment</h3>

            <p
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#d97706"
              }}
            >
              ₹{totalPending}
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px"
            }}
          >
            <h3>Paid Jobs</h3>

            <p
              style={{
                fontSize: "28px",
                fontWeight: "bold"
              }}
            >
              {paidJobs.length}
            </p>
          </div>
        </div>

        {/* HIRE REQUESTS */}

        <h2 style={{ marginTop: "50px" }}>
          Hire Requests
        </h2>

        {loadingJobs ? (
          <p>Loading hire requests...</p>
        ) : jobs.length === 0 ? (
          <p>No hire requests yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(300px,1fr))",
              gap: "20px"
            }}
          >
            {jobs.map((job) => (
              <div
                key={job._id}
                style={{
                  background: "white",
                  padding: "25px",
                  borderRadius: "10px"
                }}
              >
                <h3>{job.title}</h3>

                <p>{job.description}</p>

                <p>
                  <b>Customer:</b>{" "}
                  {job.customer?.name || "Customer"}
                </p>

                <p>
                  <b>Category:</b>{" "}
                  {job.category}
                </p>

                <p>
                  <b>Payment:</b>{" "}
                  ₹{job.payment || 0}
                </p>

                <p>
                  <b>Status:</b>{" "}
                  <strong>{job.status}</strong>
                </p>

                {/* ACCEPT / REJECT */}

                {job.status === "pending" && (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "15px"
                    }}
                  >
                    <button
                      onClick={() =>
                        acceptJob(job._id)
                      }
                      disabled={
                        processingJob ===
                        job._id
                      }
                      style={{
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        padding: "12px",
                        borderRadius: "6px"
                      }}
                    >
                      {processingJob === job._id
                        ? "Processing..."
                        : "Accept Job"}
                    </button>

                    <button
                      onClick={() =>
                        rejectJob(job._id)
                      }
                      disabled={
                        processingJob ===
                        job._id
                      }
                      style={{
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        padding: "12px",
                        borderRadius: "6px"
                      }}
                    >
                      Reject Job
                    </button>
                  </div>
                )}

                {/* START */}

                {job.status === "accepted" && (
                  <button
                    onClick={() =>
                      startJob(job._id)
                    }
                    disabled={
                      processingJob ===
                      job._id
                    }
                    style={{
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      padding: "12px 22px",
                      borderRadius: "6px",
                      marginTop: "15px"
                    }}
                  >
                    {processingJob === job._id
                      ? "Starting..."
                      : "Start Job"}
                  </button>
                )}

                {/* COMPLETE */}

                {job.status === "in-progress" && (
                  <button
                    onClick={() =>
                      completeJob(job._id)
                    }
                    disabled={
                      processingJob ===
                      job._id
                    }
                    style={{
                      background: "#16a34a",
                      color: "white",
                      border: "none",
                      padding: "12px 22px",
                      borderRadius: "6px",
                      marginTop: "15px"
                    }}
                  >
                    {processingJob === job._id
                      ? "Completing..."
                      : "Mark Job Completed"}
                  </button>
                )}

                {/* REQUEST PAYMENT */}

                {job.status === "completed" &&
                  job.paymentStatus ===
                    "not_requested" && (
                    <div
                      style={{
                        marginTop: "15px"
                      }}
                    >
                      <button
                        onClick={() =>
                          setPaymentJob(
                            job._id
                          )
                        }
                        style={{
                          background: "#7c3aed",
                          color: "white",
                          border: "none",
                          padding: "12px 20px",
                          borderRadius: "6px"
                        }}
                      >
                        Request Payment
                      </button>

                      {paymentJob ===
                        job._id && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "15px",
                            background: "#f5f3ff",
                            borderRadius: "8px"
                          }}
                        >
                          <input
                            placeholder="UPI ID (example@upi)"
                            value={upiId}
                            onChange={(e) =>
                              setUpiId(
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "10px",
                              marginBottom:
                                "8px"
                            }}
                          />

                          <input
                            type="number"
                            placeholder="Amount ₹"
                            value={amount}
                            onChange={(e) =>
                              setAmount(
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "10px",
                              marginBottom:
                                "8px"
                            }}
                          />

                          <button
                            onClick={() =>
                              requestPayment(
                                job._id
                              )
                            }
                            disabled={
                              processingJob ===
                              job._id
                            }
                            style={{
                              background: "#16a34a",
                              color: "white",
                              border: "none",
                              padding:
                                "10px 15px",
                              borderRadius:
                                "6px"
                            }}
                          >
                            Send Payment Request
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                {/* PAYMENT REQUESTED */}

                {job.paymentStatus ===
                  "requested" && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "12px",
                      background: "#fef3c7",
                      color: "#92400e",
                      borderRadius: "6px",
                      fontWeight: "bold"
                    }}
                  >
                    ₹{job.payment} payment
                    requested
                    <br />
                    UPI: {job.paymentUpiId}
                    <br />
                    Waiting for customer payment
                  </div>
                )}

                {/* PAYMENT PAID */}

                {job.paymentStatus === "paid" && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "12px",
                      background: "#dcfce7",
                      color: "#166534",
                      borderRadius: "6px",
                      fontWeight: "bold"
                    }}
                  >
                    ✓ Payment Completed:
                    ₹{job.payment}
                  </div>
                )}

                {/* REJECTED */}

                {job.status === "rejected" && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "10px",
                      background: "#fee2e2",
                      color: "#991b1b",
                      borderRadius: "6px"
                    }}
                  >
                    ✕ Job Rejected
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PAYMENT HISTORY */}

        <h2 style={{ marginTop: "50px" }}>
          📋 Payment History
        </h2>

        {paidJobs.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px",
              marginTop: "20px"
            }}
          >
            No completed payments yet.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              marginTop: "20px"
            }}
          >
            {paidJobs.map((job) => (
              <div
                key={job._id}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "15px"
                }}
              >
                <div>
                  <h3>{job.title}</h3>

                  <p>
                    <b>Customer:</b>{" "}
                    {job.customer?.name ||
                      "Customer"}
                  </p>

                  <p>
                    <b>UPI:</b>{" "}
                    {job.paymentUpiId ||
                      "Not available"}
                  </p>

                  <p>
                    <b>Date:</b>{" "}
                    {formatDate(
                      job.paymentPaidAt
                    )}
                  </p>
                </div>

                <div
                  style={{
                    textAlign: "right"
                  }}
                >
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#16a34a"
                    }}
                  >
                    ₹{job.payment}
                  </p>

                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#166534",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontWeight: "bold"
                    }}
                  >
                    ✓ Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Chatbot role="worker" />
    </div>
  );
}

export default WorkerDashboard;