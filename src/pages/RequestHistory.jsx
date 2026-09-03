import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function RequestHistory() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("User loading error:", error);
    }
  }, []);

  // =====================================================
  // LOAD REQUESTS
  // =====================================================

  const loadRequests = async () => {
    try {
      setLoading(true);

      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        navigate("/");
        return;
      }

      const currentUser =
        JSON.parse(storedUser);

      setUser(currentUser);

      let response;

      if (currentUser.role === "customer") {
        response =
          await API.get("/job/my-jobs");
      } else if (currentUser.role === "worker") {
        response =
          await API.get("/job/worker-jobs");
      } else {
        response = {
          data: []
        };
      }

      setJobs(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {
      console.error(
        "Request history error:",
        error
      );

      setJobs([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();

    const interval =
      setInterval(() => {
        loadRequests();
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatus = (job) => {
    return (
      job.status ||
      "pending"
    ).toLowerCase();
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Request Sent";

      case "accepted":
        return "Accepted";

      case "in-progress":
        return "In Progress";

      case "completed":
        return "Completed";

      case "rejected":
        return "Rejected";

      default:
        return status;
    }
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return {
          background: "#fef3c7",
          color: "#92400e",
          icon: "⏳"
        };

      case "accepted":
        return {
          background: "#dbeafe",
          color: "#1d4ed8",
          icon: "✓"
        };

      case "in-progress":
        return {
          background: "#ede9fe",
          color: "#6d28d9",
          icon: "⚙"
        };

      case "completed":
        return {
          background: "#dcfce7",
          color: "#166534",
          icon: "✓"
        };

      case "rejected":
        return {
          background: "#fee2e2",
          color: "#991b1b",
          icon: "✕"
        };

      default:
        return {
          background: "#f1f5f9",
          color: "#475569",
          icon: "•"
        };
    }
  };

  // =====================================================
  // PAYMENT STATUS
  // =====================================================

  const getPaymentStatus = (job) => {
    if (
      job.paymentStatus === "paid"
    ) {
      return {
        label: "Paid",
        color: "#166534",
        background: "#dcfce7",
        icon: "✓"
      };
    }

    if (
      job.paymentStatus === "requested"
    ) {
      return {
        label: "Payment Requested",
        color: "#7e22ce",
        background: "#f3e8ff",
        icon: "₹"
      };
    }

    if (
      job.status === "completed"
    ) {
      return {
        label: "Payment Pending",
        color: "#92400e",
        background: "#fef3c7",
        icon: "₹"
      };
    }

    return {
      label: "Not Applicable",
      color: "#64748b",
      background: "#f1f5f9",
      icon: "—"
    };
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredJobs = useMemo(() => {
    if (activeFilter === "all") {
      return jobs;
    }

    return jobs.filter(
      (job) =>
        getStatus(job) === activeFilter
    );
  }, [jobs, activeFilter]);

  // =====================================================
  // COUNTS
  // =====================================================

  const counts = {
    all: jobs.length,

    pending:
      jobs.filter(
        (job) =>
          getStatus(job) === "pending"
      ).length,

    accepted:
      jobs.filter(
        (job) =>
          getStatus(job) === "accepted"
      ).length,

    "in-progress":
      jobs.filter(
        (job) =>
          getStatus(job) === "in-progress"
      ).length,

    completed:
      jobs.filter(
        (job) =>
          getStatus(job) === "completed"
      ).length,

    rejected:
      jobs.filter(
        (job) =>
          getStatus(job) === "rejected"
      ).length
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/");
  };

  // =====================================================
  // BACK TO DASHBOARD
  // =====================================================

  const goBack = () => {
    if (user?.role === "worker") {
      navigate("/worker-dashboard");
    } else {
      navigate("/customer-dashboard");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading && !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          fontFamily:
            "Inter, Arial, sans-serif"
        }}
      >
        <div
          style={{
            background: "white",
            padding: "35px",
            borderRadius: "16px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08)",
            textAlign: "center"
          }}
        >
          <div
            style={{
              fontSize: "35px",
              marginBottom: "10px"
            }}
          >
            ⏳
          </div>

          <h2
            style={{
              margin: 0,
              color: "#0f172a"
            }}
          >
            Loading requests...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)",
        fontFamily:
          "Inter, Arial, sans-serif",
        color: "#0f172a"
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <header
        style={{
          background:
            "linear-gradient(135deg,#2563eb,#1d4ed8)",
          color: "white",
          padding:
            "18px 5%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow:
            "0 4px 20px rgba(37,99,235,0.20)",
          position: "sticky",
          top: 0,
          zIndex: 20
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px"
          }}
        >

          <button
            onClick={goBack}
            style={{
              border: "1px solid rgba(255,255,255,0.3)",
              background:
                "rgba(255,255,255,0.12)",
              color: "white",
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              fontSize: "20px",
              cursor: "pointer"
            }}
          >
            ←
          </button>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: "700"
              }}
            >
              📋 Request History
            </h1>

            <p
              style={{
                margin:
                  "3px 0 0",
                opacity: 0.85,
                fontSize: "13px"
              }}
            >
              Track all your job requests and
              payment activity
            </p>
          </div>

        </div>

        <button
          onClick={logout}
          style={{
            background: "#ef4444",
            border: "none",
            color: "white",
            padding:
              "10px 18px",
            borderRadius: "9px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Logout
        </button>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
          padding:
            "35px 20px 60px"
        }}
      >

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(170px,1fr))",
            gap: "16px",
            marginBottom: "30px"
          }}
        >

          <SummaryCard
            title="Total Requests"
            value={counts.all}
            icon="📋"
          />

          <SummaryCard
            title="Pending"
            value={counts.pending}
            icon="⏳"
          />

          <SummaryCard
            title="Accepted"
            value={counts.accepted}
            icon="✓"
          />

          <SummaryCard
            title="In Progress"
            value={counts["in-progress"]}
            icon="⚙"
          />

          <SummaryCard
            title="Completed"
            value={counts.completed}
            icon="🏆"
          />

        </section>


        {/* =================================================
            FILTER BAR
        ================================================= */}

        <section
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "20px",
            boxShadow:
              "0 8px 30px rgba(15,23,42,0.07)",
            marginBottom: "25px"
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
              marginBottom: "18px"
            }}
          >

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px"
                }}
              >
                {user?.role === "worker"
                  ? "My Job Requests"
                  : "My Requests"}
              </h2>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color: "#64748b",
                  fontSize: "14px"
                }}
              >
                View the complete journey of
                every request.
              </p>
            </div>

            <button
              onClick={loadRequests}
              style={{
                background: "#eff6ff",
                color: "#2563eb",
                border:
                  "1px solid #bfdbfe",
                padding:
                  "9px 15px",
                borderRadius: "9px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              ↻ Refresh
            </button>

          </div>


          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap"
            }}
          >

            <FilterButton
              label="All"
              value="all"
              active={activeFilter}
              setActive={setActiveFilter}
              count={counts.all}
            />

            <FilterButton
              label="Request Sent"
              value="pending"
              active={activeFilter}
              setActive={setActiveFilter}
              count={counts.pending}
            />

            <FilterButton
              label="Accepted"
              value="accepted"
              active={activeFilter}
              setActive={setActiveFilter}
              count={counts.accepted}
            />

            <FilterButton
              label="In Progress"
              value="in-progress"
              active={activeFilter}
              setActive={setActiveFilter}
              count={counts["in-progress"]}
            />

            <FilterButton
              label="Completed"
              value="completed"
              active={activeFilter}
              setActive={setActiveFilter}
              count={counts.completed}
            />

            <FilterButton
              label="Rejected"
              value="rejected"
              active={activeFilter}
              setActive={setActiveFilter}
              count={counts.rejected}
            />

          </div>

        </section>


        {/* =================================================
            REQUEST LIST
        ================================================= */}

        {loading ? (

          <div
            style={{
              background: "white",
              padding: "50px",
              borderRadius: "18px",
              textAlign: "center"
            }}
          >
            Loading requests...
          </div>

        ) : filteredJobs.length === 0 ? (

          <div
            style={{
              background: "white",
              padding: "60px 30px",
              borderRadius: "18px",
              textAlign: "center",
              boxShadow:
                "0 8px 30px rgba(15,23,42,0.07)"
            }}
          >

            <div
              style={{
                fontSize: "50px",
                marginBottom: "15px"
              }}
            >
              📭
            </div>

            <h2
              style={{
                margin:
                  "0 0 8px"
              }}
            >
              No requests found
            </h2>

            <p
              style={{
                color: "#64748b",
                margin: 0
              }}
            >
              {activeFilter === "all"
                ? "You haven't created any job requests yet."
                : "There are no requests with this status."}
            </p>

          </div>

        ) : (

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >

            {filteredJobs.map(
              (job, index) => {

                const status =
                  getStatus(job);

                const statusStyle =
                  getStatusStyle(status);

                const payment =
                  getPaymentStatus(job);

                const otherPerson =
                  user?.role === "customer"
                    ? job.worker
                    : job.customer;

                return (
                  <article
                    key={
                      job._id ||
                      index
                    }
                    style={{
                      background: "white",
                      borderRadius: "18px",
                      padding: "24px",
                      boxShadow:
                        "0 8px 30px rgba(15,23,42,0.07)",
                      border:
                        "1px solid #e2e8f0"
                    }}
                  >

                    {/* TOP */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        flexWrap: "wrap",
                        gap: "15px"
                      }}
                    >

                      <div>

                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: "10px",
                            flexWrap: "wrap"
                          }}
                        >

                          <h2
                            style={{
                              margin: 0,
                              fontSize: "19px"
                            }}
                          >
                            {job.title ||
                              "Job Request"}
                          </h2>

                          <span
                            style={{
                              background:
                                statusStyle.background,
                              color:
                                statusStyle.color,
                              padding:
                                "6px 11px",
                              borderRadius:
                                "20px",
                              fontSize:
                                "12px",
                              fontWeight:
                                "700"
                            }}
                          >
                            {statusStyle.icon}{" "}
                            {getStatusLabel(
                              status
                            )}
                          </span>

                        </div>

                        <p
                          style={{
                            color: "#64748b",
                            margin:
                              "7px 0 0",
                            fontSize: "13px"
                          }}
                        >
                          Request ID:{" "}
                          {job._id}
                        </p>

                      </div>


                      <div
                        style={{
                          textAlign:
                            "right"
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "22px",
                            fontWeight:
                              "800"
                          }}
                        >
                          ₹
                          {Number(
                            job.payment || 0
                          )}
                        </div>

                        <span
                          style={{
                            display:
                              "inline-block",
                            marginTop:
                              "5px",
                            background:
                              payment.background,
                            color:
                              payment.color,
                            padding:
                              "5px 9px",
                            borderRadius:
                              "15px",
                            fontSize:
                              "11px",
                            fontWeight:
                              "700"
                          }}
                        >
                          {payment.icon}{" "}
                          {payment.label}
                        </span>

                      </div>

                    </div>


                    {/* DIVIDER */}

                    <div
                      style={{
                        height: "1px",
                        background:
                          "#e2e8f0",
                        margin:
                          "20px 0"
                      }}
                    />


                    {/* DETAILS */}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit,minmax(180px,1fr))",
                        gap: "15px"
                      }}
                    >

                      <InfoItem
                        label={
                          user?.role ===
                          "customer"
                            ? "Worker"
                            : "Customer"
                        }
                        value={
                          otherPerson?.name ||
                          "Not available"
                        }
                      />

                      <InfoItem
                        label="Category"
                        value={
                          job.category ||
                          "Other"
                        }
                      />

                      <InfoItem
                        label="Created"
                        value={formatDate(
                          job.createdAt
                        )}
                      />

                      <InfoItem
                        label="Scheduled"
                        value={
                          job.scheduledDate
                            ? formatDate(
                                job.scheduledDate
                              )
                            : "Not scheduled"
                        }
                      />

                    </div>


                    {/* DESCRIPTION */}

                    {job.description && (
                      <div
                        style={{
                          marginTop:
                            "18px",
                          background:
                            "#f8fafc",
                          borderRadius:
                            "10px",
                          padding:
                            "13px 15px"
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "11px",
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "0.05em",
                            color:
                              "#64748b",
                            fontWeight:
                              "700",
                            marginBottom:
                              "5px"
                          }}
                        >
                          Job Description
                        </div>

                        <div
                          style={{
                            color:
                              "#334155",
                            lineHeight:
                              "1.5"
                          }}
                        >
                          {job.description}
                        </div>

                      </div>
                    )}


                    {/* =================================================
                        TIMELINE
                    ================================================= */}

                    <div
                      style={{
                        marginTop:
                          "22px"
                      }}
                    >

                      <div
                        style={{
                          fontWeight:
                            "700",
                          fontSize:
                            "14px",
                          marginBottom:
                            "12px"
                        }}
                      >
                        Request Progress
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          overflowX:
                            "auto",
                          paddingBottom:
                            "5px"
                        }}
                      >

                        <TimelineStep
                          label="Sent"
                          active={
                            [
                              "pending",
                              "accepted",
                              "in-progress",
                              "completed"
                            ].includes(
                              status
                            )
                          }
                          icon="📨"
                        />

                        <TimelineLine
                          active={[
                            "accepted",
                            "in-progress",
                            "completed"
                          ].includes(
                            status
                          )}
                        />

                        <TimelineStep
                          label="Accepted"
                          active={[
                            "accepted",
                            "in-progress",
                            "completed"
                          ].includes(
                            status
                          )}
                          icon="✓"
                        />

                        <TimelineLine
                          active={[
                            "in-progress",
                            "completed"
                          ].includes(
                            status
                          )}
                        />

                        <TimelineStep
                          label="In Progress"
                          active={[
                            "in-progress",
                            "completed"
                          ].includes(
                            status
                          )}
                          icon="⚙"
                        />

                        <TimelineLine
                          active={
                            status ===
                            "completed"
                          }
                        />

                        <TimelineStep
                          label="Completed"
                          active={
                            status ===
                            "completed"
                          }
                          icon="🏆"
                        />

                      </div>

                    </div>


                    {/* REJECTED */}

                    {status ===
                      "rejected" && (
                      <div
                        style={{
                          marginTop:
                            "18px",
                          background:
                            "#fef2f2",
                          border:
                            "1px solid #fecaca",
                          color:
                            "#991b1b",
                          padding:
                            "12px 15px",
                          borderRadius:
                            "10px",
                          fontWeight:
                            "600"
                        }}
                      >
                        ✕ This request was
                        rejected.
                      </div>
                    )}


                    {/* PAYMENT */}

                    {job.paymentStatus ===
                      "requested" && (
                      <div
                        style={{
                          marginTop:
                            "18px",
                          background:
                            "#faf5ff",
                          border:
                            "1px solid #e9d5ff",
                          color:
                            "#6b21a8",
                          padding:
                            "14px 16px",
                          borderRadius:
                            "10px"
                        }}
                      >
                        <strong>
                          💰 Payment Request
                        </strong>

                        <div
                          style={{
                            marginTop:
                              "5px"
                          }}
                        >
                          Worker has requested
                          payment of ₹
                          {job.payment}.
                        </div>
                      </div>
                    )}


                    {job.paymentStatus ===
                      "paid" && (
                      <div
                        style={{
                          marginTop:
                            "18px",
                          background:
                            "#f0fdf4",
                          border:
                            "1px solid #bbf7d0",
                          color:
                            "#166534",
                          padding:
                            "14px 16px",
                          borderRadius:
                            "10px",
                          fontWeight:
                            "600"
                        }}
                      >
                        ✓ Payment completed
                        successfully.
                      </div>
                    )}

                  </article>
                );
              }
            )}

          </div>

        )}

      </main>

    </div>
  );
}


// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  title,
  value,
  icon
}) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "16px",
        boxShadow:
          "0 8px 25px rgba(15,23,42,0.06)",
        border:
          "1px solid #e2e8f0"
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center"
        }}
      >

        <div>
          <div
            style={{
              color: "#64748b",
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: "30px",
              fontWeight: "800",
              marginTop: "5px"
            }}
          >
            {value}
          </div>
        </div>

        <div
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "12px",
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "21px"
          }}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


// =====================================================
// FILTER BUTTON
// =====================================================

function FilterButton({
  label,
  value,
  active,
  setActive,
  count
}) {
  const isActive =
    active === value;

  return (
    <button
      onClick={() =>
        setActive(value)
      }
      style={{
        border:
          isActive
            ? "1px solid #2563eb"
            : "1px solid #e2e8f0",
        background:
          isActive
            ? "#2563eb"
            : "white",
        color:
          isActive
            ? "white"
            : "#334155",
        padding:
          "9px 13px",
        borderRadius:
          "9px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px"
      }}
    >
      {label}

      <span
        style={{
          marginLeft: "6px",
          opacity: 0.8
        }}
      >
        {count}
      </span>
    </button>
  );
}


// =====================================================
// INFO ITEM
// =====================================================

function InfoItem({
  label,
  value
}) {
  return (
    <div>
      <div
        style={{
          color: "#94a3b8",
          fontSize: "11px",
          fontWeight: "700",
          textTransform:
            "uppercase",
          marginBottom: "4px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: "600",
          color: "#334155"
        }}
      >
        {value}
      </div>
    </div>
  );
}


// =====================================================
// TIMELINE STEP
// =====================================================

function TimelineStep({
  label,
  active,
  icon
}) {
  return (
    <div
      style={{
        minWidth: "90px",
        textAlign: "center"
      }}
    >

      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          margin: "0 auto 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            active
              ? "#2563eb"
              : "#e2e8f0",
          color:
            active
              ? "white"
              : "#94a3b8",
          fontSize: "14px",
          fontWeight: "700"
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: "11px",
          fontWeight: "700",
          color:
            active
              ? "#2563eb"
              : "#94a3b8"
        }}
      >
        {label}
      </div>

    </div>
  );
}


// =====================================================
// TIMELINE LINE
// =====================================================

function TimelineLine({
  active
}) {
  return (
    <div
      style={{
        height: "3px",
        minWidth: "45px",
        background:
          active
            ? "#2563eb"
            : "#e2e8f0",
        marginBottom:
          "25px"
      }}
    />
  );
}


export default RequestHistory;