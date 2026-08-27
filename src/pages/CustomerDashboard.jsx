import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import Chatbot from "../components/Chatbot";
import Map from "../components/Map";
import UPIPaymentQR from "../components/UPIPaymentQR";
function CustomerDashboard() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] =
    useState(false);
  const [loading, setLoading] =
    useState(true);
  const [sendingRequest, setSendingRequest] =
    useState(null);
  const [confirmingPayment, setConfirmingPayment] =
    useState(null);
  const [rating, setRating] =
    useState(0);
  const [review, setReview] =
    useState("");
  const [submittingReview, setSubmittingReview] =
    useState(null);
  const [aiTitle, setAiTitle] =
    useState("");
  const [aiDescription, setAiDescription] =
    useState("");
  const [aiCategory, setAiCategory] =
    useState("other");
  const [aiPayment, setAiPayment] =
    useState("");
  const [aiDate, setAiDate] =
    useState("");
  const [aiTime, setAiTime] =
    useState("");
  const [aiWorkers, setAiWorkers] =
    useState([]);
  const [bestAIWorker, setBestAIWorker] =
    useState(null);
  const [aiLoading, setAiLoading] =
    useState(false);
  const [autoAssigning, setAutoAssigning] =
    useState(false);
  const [showAIResults, setShowAIResults] =
    useState(false);
  const fetchWorkers = async () => {
    try {
      const res =
        await API.get("/auth/workers");
      setWorkers(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching workers:",
        error
      );
    }
  };
  const fetchCustomerJobs = async () => {
    try {
      const res =
        await API.get("/job/my-jobs");
      setJobs(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching customer jobs:",
        error
      );
    }
  };
  const fetchNotifications = async () => {
    try {
      const res =
        await API.get("/notifications");
      setNotifications(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching notifications:",
        error
      );
    }
  };
  const markNotificationRead = async (id) => {
    try {
      await API.put(
        `/notifications/read/${id}`,
        {}
      );
      await fetchNotifications();
    } catch (error) {
      console.error(
        "Error marking notification:",
        error
      );
    }
  };
  const markAllNotificationsRead = async () => {
    try {
      await API.put(
        "/notifications/read-all",
        {}
      );
      await fetchNotifications();
    } catch (error) {
      console.error(
        "Error marking notifications:",
        error
      );
    }
  };
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchWorkers(),
        fetchCustomerJobs(),
        fetchNotifications()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);
  useEffect(() => {
    const interval =
      setInterval(() => {
        fetchCustomerJobs();
        fetchNotifications();
      }, 3000);
    return () =>
      clearInterval(interval);
  }, []);
  const handleHire = async (worker) => {
    if (!worker?._id) {
      alert("Invalid worker selected.");
      return;
    }
    if (worker.isAvailable === false) {
      alert(`${worker.name || "This worker"} is currently busy.`);
      return;
    }
    const title =
      aiTitle.trim() ||
      worker.skills?.[0] ||
      "Worker Service";
    const description =
      aiDescription.trim() ||
      `Request for ${worker.name || "worker"} service.`;
    const validCategories = [
      "construction",
      "electrician",
      "plumber",
      "cleaning",
      "other"
    ];
    const category = validCategories.includes(aiCategory)
      ? aiCategory
      : "other";
    const confirmed = window.confirm(
      `Send hire request to ${worker.name}?\n\n` +
      `Service: ${title}\n` +
      `Category: ${category}\n` +
      `Payment: ₹${Number(aiPayment) || 0}`
    );
    if (!confirmed) {
      return;
    }
    try {
      setSendingRequest(worker._id);
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        setSendingRequest(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log("HIRING WORKER:", worker);
            console.log("CUSTOMER LOCATION:", {
              latitude,
              longitude
            });
            const response = await API.post(
              "/job/create",
              {
                worker: worker._id,
                title,
                description,
                category,
                payment: Number(aiPayment) || 0,
                scheduledDate: aiDate || null,
                scheduledTime: aiTime || "",
                lat: latitude,
                lng: longitude
              }
            );
            console.log(
              "HIRE REQUEST RESPONSE:",
              response.data
            );
            alert(
              `Hire request sent successfully to ${worker.name}!`
            );
            await fetchCustomerJobs();
            await fetchWorkers();
            await fetchNotifications();
          } catch (error) {
            console.error("HIRE WORKER ERROR:", error);
            console.error(
              "STATUS:",
              error.response?.status
            );
            console.error(
              "SERVER RESPONSE:",
              error.response?.data
            );
            alert(
              error.response?.data?.message ||
              error.response?.data?.error ||
              `Failed to send hire request. Status: ${
                error.response?.status || "Unknown"
              }`
            );
          } finally {
            setSendingRequest(null);
          }
        },
        (error) => {
          console.error("LOCATION ERROR:", error);
          alert(
            "Please allow location access to hire a worker."
          );
          setSendingRequest(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error(
        "HIRE WORKER OUTER ERROR:",
        error
      );
      setSendingRequest(null);
    }
  };
  const analyzeWorkersWithAI = async () => {
    if (!aiTitle.trim()) {
      alert("Please enter the job title.");
      return;
    }
    try {
      setAiLoading(true);
      setShowAIResults(false);
      if (!navigator.geolocation) {
        alert(
          "Geolocation is not supported by your browser."
        );
        setAiLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response =
              await API.post(
                "/job/ai-analyze-workers",
                {
                  title:
                    aiTitle,
                  description:
                    aiDescription,
                  category:
                    aiCategory,
                  lat:
                    position.coords.latitude,
                  lng:
                    position.coords.longitude,
                  scheduledDate:
                    aiDate || null,
                  scheduledTime:
                    aiTime || ""
                }
              );
            const result =
              response.data;
            setAiWorkers(
              Array.isArray(result.workers)
                ? result.workers
                : []
            );
            setBestAIWorker(
              result.bestWorker ||
              null
            );
            setShowAIResults(true);
            if (
              !result.workers ||
              result.workers.length === 0
            ) {
              alert(
                "No suitable workers were found."
              );
            }
          } catch (error) {
            console.error(
              "AI ANALYSIS ERROR:",
              error
            );
            alert(
              error.response?.data?.message ||
              "AI worker analysis failed."
            );
          } finally {
            setAiLoading(false);
          }
        },
        () => {
          alert(
            "Please allow location access for AI worker analysis."
          );
          setAiLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error(error);
      setAiLoading(false);
    }
  };
  const autoAssignBestWorker = async () => {
    if (!aiTitle.trim()) {
      alert("Please enter the job title.");
      return;
    }
    if (
      !window.confirm(
        "AI will analyze the available workers and automatically send the job request to the best matching worker. Continue?"
      )
    ) {
      return;
    }
    try {
      setAutoAssigning(true);
      if (!navigator.geolocation) {
        alert(
          "Geolocation is not supported by your browser."
        );
        setAutoAssigning(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response =
              await API.post(
                "/job/ai-auto-assign",
                {
                  title:
                    aiTitle,
                  description:
                    aiDescription,
                  category:
                    aiCategory,
                  payment:
                    Number(aiPayment) || 0,
                  lat:
                    position.coords.latitude,
                  lng:
                    position.coords.longitude,
                  scheduledDate:
                    aiDate || null,
                  scheduledTime:
                    aiTime || ""
                }
              );
            const result =
              response.data;
            alert(
              `${result.message}\n\n` +
              `Worker: ${
                result.ai?.selectedWorker ||
                "Selected worker"
              }\n` +
              `AI Score: ${
                result.ai?.aiScore || 0
              }%\n` +
              `Distance: ${
                result.ai?.distanceKm || 0
              } km`
            );
            await fetchCustomerJobs();
            await fetchWorkers();
            await fetchNotifications();
          } catch (error) {
            console.error(
              "AI AUTO ASSIGN ERROR:",
              error
            );
            alert(
              error.response?.data?.message ||
              "AI automatic assignment failed."
            );
          } finally {
            setAutoAssigning(false);
          }
        },
        () => {
          alert(
            "Please allow location access for automatic worker assignment."
          );
          setAutoAssigning(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error(error);
      setAutoAssigning(false);
    }
  };
  const confirmPayment = async (id) => {
    if (
      !window.confirm(
        "Have you completed the UPI payment to the worker?"
      )
    ) {
      return;
    }
    try {
      setConfirmingPayment(id);
      await API.put(
        `/job/confirm-payment/${id}`,
        {}
      );
      await fetchCustomerJobs();
      await fetchNotifications();
      alert(
        "Payment marked as completed!"
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to confirm payment"
      );
    } finally {
      setConfirmingPayment(null);
    }
  };
  const submitReview = async (id) => {
    if (!rating) {
      alert(
        "Please select a rating from 1 to 5 stars."
      );
      return;
    }
    try {
      setSubmittingReview(id);
      await API.put(
        `/job/review/${id}`,
        {
          rating,
          review
        }
      );
      setRating(0);
      setReview("");
      await fetchCustomerJobs();
      await fetchWorkers();
      await fetchNotifications();
      alert(
        "Rating and review submitted successfully!"
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to submit review"
      );
    } finally {
      setSubmittingReview(null);
    }
  };
  const getWorkerJob = (workerId) =>
    jobs.find(
      (job) =>
        job.worker &&
        job.worker._id === workerId
    );
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };
  const paidJobs =
    jobs.filter(
      (job) =>
        job.paymentStatus === "paid"
    );
  const requestedPayments =
    jobs.filter(
      (job) =>
        job.paymentStatus === "requested"
    );
  const totalPaid =
    paidJobs.reduce(
      (total, job) =>
        total +
        Number(job.payment || 0),
      0
    );
  const totalPending =
    requestedPayments.reduce(
      (total, job) =>
        total +
        Number(job.payment || 0),
      0
    );
  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;
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
  const ScoreBar = ({
    label,
    value
  }) => (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium">
          {label}
        </span>
        <span>
          {Number(value || 0).toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{
            width:
              `${Math.min(
                100,
                Number(value || 0)
              )}%`
          }}
        />
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-100">
      {}
      <div className="bg-blue-600 text-white flex justify-between items-center p-5">
        <h1 className="text-xl font-bold">
          Customer Dashboard
        </h1>
        <div className="flex items-center gap-3">
          {}
          <div className="relative">
            <button
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              className="relative bg-blue-700 px-4 py-2 rounded text-xl"
            >
              🔔
              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    -top-2
                    -right-2
                    bg-red-500
                    text-white
                    text-xs
                    font-bold
                    rounded-full
                    min-w-[22px]
                    h-[22px]
                    flex
                    items-center
                    justify-center
                  "
                >
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div
                className="
                  absolute
                  right-0
                  top-12
                  w-80
                  bg-white
                  text-black
                  rounded-lg
                  shadow-xl
                  z-50
                "
              >
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-bold">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={
                        markAllNotificationsRead
                      }
                      className="text-blue-600 text-sm"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-5 text-gray-500">
                      No notifications
                    </p>
                  ) : (
                    notifications.map(
                      (notification) => (
                        <div
                          key={
                            notification._id
                          }
                          onClick={() =>
                            !notification.isRead &&
                            markNotificationRead(
                              notification._id
                            )
                          }
                          className={`p-4 border-b cursor-pointer ${
                            notification.isRead
                              ? "bg-white"
                              : "bg-blue-50"
                          }`}
                        >
                          <p className="font-medium">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(
                              notification.createdAt
                            )}
                          </p>
                          {!notification.isRead && (
                            <span className="text-xs text-blue-600">
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
            className="bg-red-500 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="p-10">
        {}
        <div className="bg-white p-6 rounded-lg shadow mb-10 border-t-4 border-blue-600">
          <div>
            <h2 className="text-2xl font-bold">
              🤖 AI Worker Scheduling
            </h2>
            <p className="text-gray-600 mt-1">
              Let AI analyze skills, availability,
              distance, rating, experience and workload.
            </p>
          </div>
          {}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {}
            <div>
              <label className="block font-semibold mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={aiTitle}
                onChange={(e) =>
                  setAiTitle(e.target.value)
                }
                placeholder="Example: Fix electrical wiring"
                className="border p-3 rounded w-full"
              />
            </div>
            {}
            <div>
              <label className="block font-semibold mb-1">
                Service Category
              </label>
              <select
                value={aiCategory}
                onChange={(e) =>
                  setAiCategory(e.target.value)
                }
                className="border p-3 rounded w-full"
              >
                <option value="construction">
                  Construction
                </option>
                <option value="electrician">
                  Electrician
                </option>
                <option value="plumber">
                  Plumber
                </option>
                <option value="cleaning">
                  Cleaning
                </option>
                <option value="other">
                  Other
                </option>
              </select>
            </div>
            {}
            <div className="md:col-span-2">
              <label className="block font-semibold mb-1">
                Job Description
              </label>
              <textarea
                value={aiDescription}
                onChange={(e) =>
                  setAiDescription(
                    e.target.value
                  )
                }
                placeholder="Describe what work you need..."
                rows="3"
                className="border p-3 rounded w-full"
              />
            </div>
            {}
            <div>
              <label className="block font-semibold mb-1">
                Payment ₹
              </label>
              <input
                type="number"
                value={aiPayment}
                onChange={(e) =>
                  setAiPayment(
                    e.target.value
                  )
                }
                placeholder="Example: 1000"
                className="border p-3 rounded w-full"
              />
            </div>
            {}
            <div>
              <label className="block font-semibold mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                value={aiDate}
                onChange={(e) =>
                  setAiDate(e.target.value)
                }
                className="border p-3 rounded w-full"
              />
            </div>
            {}
            <div>
              <label className="block font-semibold mb-1">
                Scheduled Time
              </label>
              <input
                type="time"
                value={aiTime}
                onChange={(e) =>
                  setAiTime(e.target.value)
                }
                className="border p-3 rounded w-full"
              />
            </div>
          </div>
          {}
          <div className="mt-7">
            <h3 className="font-bold text-lg mb-4">
              Choose How You Want to Find a Worker
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {}
              <button
                onClick={
                  analyzeWorkersWithAI
                }
                disabled={aiLoading}
                className="
                  bg-blue-600
                  hover:bg-blue-700
                  disabled:bg-gray-400
                  text-white
                  p-5
                  rounded-xl
                  text-left
                  transition
                  shadow
                "
              >
                <div className="text-3xl mb-2">
                  🤖
                </div>
                <h3 className="font-bold text-lg">
                  AI Worker Recommendation
                </h3>
                <p className="text-sm mt-2 text-blue-100">
                  {aiLoading
                    ? "AI is analyzing workers..."
                    : "Analyze and rank workers based on skills, distance, rating, experience and workload."
                  }
                </p>
              </button>
              {}
              <button
                onClick={
                  autoAssignBestWorker
                }
                disabled={autoAssigning}
                className="
                  bg-purple-600
                  hover:bg-purple-700
                  disabled:bg-gray-400
                  text-white
                  p-5
                  rounded-xl
                  text-left
                  transition
                  shadow
                "
              >
                <div className="text-3xl mb-2">
                  ⚡
                </div>
                <h3 className="font-bold text-lg">
                  Smart Auto-Assign
                </h3>
                <p className="text-sm mt-2 text-purple-100">
                  {autoAssigning
                    ? "AI is selecting the best worker..."
                    : "Let AI automatically select and send the job request to the best matching worker."
                  }
                </p>
              </button>
              {}
              <button
                onClick={() => {
                  const workerSection =
                    document.getElementById(
                      "available-workers"
                    );
                  if (workerSection) {
                    workerSection.scrollIntoView({
                      behavior: "smooth"
                    });
                  }
                }}
                className="
                  bg-green-600
                  hover:bg-green-700
                  text-white
                  p-5
                  rounded-xl
                  text-left
                  transition
                  shadow
                "
              >
                <div className="text-3xl mb-2">
                  👷
                </div>
                <h3 className="font-bold text-lg">
                  Manual Hire
                </h3>
                <p className="text-sm mt-2 text-green-100">
                  Choose a worker yourself from the
                  available workers list.
                </p>
              </button>
            </div>
            {}
            {showAIResults && (
              <button
                onClick={() => {
                  setShowAIResults(false);
                  setAiWorkers([]);
                  setBestAIWorker(null);
                }}
                className="
                  bg-gray-500
                  hover:bg-gray-600
                  text-white
                  px-5
                  py-2
                  rounded-lg
                  mt-4
                "
              >
                Clear AI Results
              </button>
            )}
          </div>
          {}
          {showAIResults && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  🤖 AI Analysis Results
                </h3>
                <span className="text-sm text-gray-600">
                  {aiWorkers.length} workers analyzed
                </span>
              </div>
              {}
              {bestAIWorker && (
                <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-blue-600 font-bold">
                        ⭐ AI RECOMMENDED WORKER
                      </p>
                      <h3 className="text-2xl font-bold mt-1">
                        👷{" "}
                        {bestAIWorker.worker?.name}
                      </h3>
                      <p className="text-gray-600">
                        {bestAIWorker.worker?.skills?.join(
                          ", "
                        ) ||
                          "Skills not specified"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        AI Match Score
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {bestAIWorker.aiScore}%
                      </p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-4 gap-3 mt-5">
                    <div className="bg-white p-3 rounded">
                      <p className="text-xs text-gray-500">
                        Distance
                      </p>
                      <p className="font-bold">
                        {bestAIWorker.distanceKm} km
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="text-xs text-gray-500">
                        Rating
                      </p>
                      <p className="font-bold">
                        ⭐{" "}
                        {bestAIWorker.worker?.rating || 0}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="text-xs text-gray-500">
                        Experience
                      </p>
                      <p className="font-bold">
                        {bestAIWorker.worker?.experience || 0}
                        {" "}years
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="text-xs text-gray-500">
                        Active Jobs
                      </p>
                      <p className="font-bold">
                        {bestAIWorker.activeJobs || 0}
                      </p>
                    </div>
                  </div>
                  {}
                  {bestAIWorker.scoreBreakdown && (
                    <div className="mt-5">
                      <h4 className="font-bold mb-3">
                        AI Decision Factors
                      </h4>
                      <div className="grid md:grid-cols-2 gap-x-6">
                        <ScoreBar
                          label="Skill Match"
                          value={
                            bestAIWorker.scoreBreakdown.skillMatch
                          }
                        />
                        <ScoreBar
                          label="Availability"
                          value={
                            bestAIWorker.scoreBreakdown.availability
                          }
                        />
                        <ScoreBar
                          label="Distance"
                          value={
                            bestAIWorker.scoreBreakdown.distance
                          }
                        />
                        <ScoreBar
                          label="Rating"
                          value={
                            bestAIWorker.scoreBreakdown.rating
                          }
                        />
                        <ScoreBar
                          label="Experience"
                          value={
                            bestAIWorker.scoreBreakdown.experience
                          }
                        />
                        <ScoreBar
                          label="Workload"
                          value={
                            bestAIWorker.scoreBreakdown.workload
                          }
                        />
                      </div>
                    </div>
                  )}
                  {}
                  <button
                    onClick={() =>
                      handleHire(
                        bestAIWorker.worker
                      )
                    }
                    disabled={
                      sendingRequest ===
                      bestAIWorker.worker?._id
                    }
                    className="
                      bg-green-600
                      hover:bg-green-700
                      text-white
                      px-6
                      py-3
                      rounded-lg
                      mt-5
                      font-semibold
                    "
                  >
                    {sendingRequest ===
                    bestAIWorker.worker?._id
                      ? "Sending..."
                      : "✓ Send Request to Recommended Worker"}
                  </button>
                </div>
              )}
              {}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {aiWorkers.map(
                  (item, index) => {
                    const worker =
                      item.worker;
                    return (
                      <div
                        key={
                          worker?._id ||
                          index
                        }
                        className={`bg-white p-5 rounded-xl shadow border ${
                          index === 0
                            ? "border-blue-500"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between">
                          <div>
                            <h4 className="text-lg font-bold">
                              #{index + 1}{" "}
                              {worker?.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {worker?.skills?.join(
                                ", "
                              ) ||
                                "No skills specified"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              {item.aiScore}%
                            </p>
                            <p className="text-xs">
                              AI Score
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                          <p>
                            📍 {item.distanceKm} km
                          </p>
                          <p>
                            ⭐ {worker?.rating || 0}
                          </p>
                          <p>
                            💼 {worker?.experience || 0} yrs
                          </p>
                          <p>
                            📋 {item.activeJobs || 0} active
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleHire(worker)
                          }
                          disabled={
                            !worker?.isAvailable ||
                            sendingRequest ===
                              worker?._id
                          }
                          className="
                            w-full
                            bg-green-600
                            hover:bg-green-700
                            disabled:bg-gray-400
                            text-white
                            px-4
                            py-2
                            rounded
                            mt-4
                          "
                        >
                          {sendingRequest ===
                          worker?._id
                            ? "Sending..."
                            : "Hire This Worker"}
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
        {}
        <div className="bg-white p-6 rounded-lg shadow mb-10">
          <h2 className="text-2xl font-bold mb-4">
            🗺️ Worker Location Map
          </h2>
          <p className="text-gray-600 mb-5">
            View available workers near your location.
          </p>
          <Map workers={workers} />
        </div>
        {}
        <h2 className="text-2xl font-bold mb-6">
          💳 Payment Summary
        </h2>
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-gray-600">
              Total Paid
            </p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ₹{totalPaid}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <p className="text-gray-600">
              Pending Payment
            </p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              ₹{totalPending}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">
              Completed Payments
            </p>
            <p className="text-3xl font-bold mt-2">
              {paidJobs.length}
            </p>
          </div>
        </div>
        {}
        <div id="available-workers">
          <h2 className="text-2xl font-bold mb-6">
            👷 Available Workers
          </h2>
          {loading ? (
            <p>
              Loading workers...
            </p>
          ) : workers.length === 0 ? (
            <p>
              No workers registered yet.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workers.map(
                (worker) => {
                  const job =
                    getWorkerJob(
                      worker._id
                    );
                  return (
                    <div
                      key={worker._id}
                      className="bg-white p-6 rounded shadow"
                    >
                      <h3 className="text-xl font-bold mb-2">
                        {worker.name}
                      </h3>
                      <p>
                        <b>Email:</b>{" "}
                        {worker.email}
                      </p>
                      <p>
                        <b>Phone:</b>{" "}
                        {worker.phone ||
                          "Not provided"}
                      </p>
                      <p>
                        <b>Status:</b>{" "}
                        {worker.isAvailable
                          ? "Available"
                          : "Busy"}
                      </p>
                      <p>
                        <b>Skills:</b>{" "}
                        {worker.skills?.length
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
                        ⭐{" "}
                        {worker.rating || 4}
                      </p>
                      {!job && (
                        <button
                          onClick={() =>
                            handleHire(worker)
                          }
                          disabled={
                            sendingRequest ===
                            worker._id
                          }
                          className="
                            bg-green-600
                            hover:bg-green-700
                            text-white
                            px-4
                            py-2
                            mt-4
                            rounded
                          "
                        >
                          {sendingRequest ===
                          worker._id
                            ? "Sending..."
                            : "Hire Worker"}
                        </button>
                      )}
                      {job?.status === "pending" && (
                        <button
                          disabled
                          className="bg-yellow-500 text-white px-4 py-2 mt-4 rounded"
                        >
                          Request Sent
                        </button>
                      )}
                      {job?.status === "accepted" && (
                        <button
                          disabled
                          className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
                        >
                          ✓ Request Accepted
                        </button>
                      )}
                      {job?.status === "completed" && (
                        <button
                          disabled
                          className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
                        >
                          ✓ Job Completed
                        </button>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
        {}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            My Job Requests
          </h2>
          {jobs.length === 0 ? (
            <p>
              No job requests yet.
            </p>
          ) : (
            <div className="space-y-4">
              {jobs.map(
                (job) => (
                  <div
                    key={job._id}
                    className="bg-white p-6 rounded shadow"
                  >
                    <h3 className="text-xl font-bold">
                      {job.title}
                    </h3>
                    <p>
                      <b>Worker:</b>{" "}
                      {job.worker?.name ||
                        "Not assigned"}
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
                      <strong className="capitalize">
                        {job.status}
                      </strong>
                    </p>
                    {job.status === "accepted" && (
                      <div className="mt-3 bg-blue-100 p-3 rounded">
                        ✓ Worker has accepted your request.
                      </div>
                    )}
                    {job.status === "completed" &&
                      job.paymentStatus === "not_requested" && (
                      <div className="mt-3 bg-yellow-100 p-3 rounded">
                        ✓ Worker completed the job.
                        <br />
                        Waiting for payment request.
                      </div>
                    )}
                    {job.paymentStatus === "requested" && (
                      <div className="mt-4 bg-purple-100 p-4 rounded">
                        <h3 className="font-bold text-lg">
                          💰 Payment Request
                        </h3>
                        <p className="mt-2">
                          <b>Amount:</b>{" "}
                          ₹{job.payment}
                        </p>
                        <p>
                          <b>Worker UPI ID:</b>{" "}
                          {job.paymentUpiId}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Pay this amount to the worker using
                          your UPI app.
                        </p>
                       <UPIPaymentQR
  upiId={job.paymentUpiId}
  amount={job.payment}
  workerName={job.worker?.name}
  jobTitle={job.title}
  jobId={job._id}
  onPaymentSuccess={async () => {
    await fetchCustomerJobs();
    await fetchNotifications();
  }}
/>
                      </div>
                    )}
                    {job.paymentStatus === "paid" && (
                      <div className="mt-4 bg-green-100 p-4 rounded font-bold text-green-700">
                        ✓ Payment Completed
                        <br />
                        ₹{job.payment} paid to worker.
                      </div>
                    )}
                    {job.paymentStatus === "paid" &&
                      !job.rating && (
                      <div className="mt-4 bg-blue-50 p-5 rounded-lg border">
                        <h3 className="text-lg font-bold">
                          ⭐ Rate Your Worker
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          How was your experience?
                        </p>
                        <div className="flex gap-2 mt-4">
                          {[1,2,3,4,5].map(
                            (star) => (
                              <button
                                key={star}
                                onClick={() =>
                                  setRating(star)
                                }
                                className="text-3xl focus:outline-none"
                              >
                                <span
                                  className={
                                    star <= rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }
                                >
                                  ★
                                </span>
                              </button>
                            )
                          )}
                        </div>
                        <textarea
                          value={review}
                          onChange={(e) =>
                            setReview(
                              e.target.value
                            )
                          }
                          placeholder="Write a review (optional)"
                          className="w-full border rounded p-3 mt-4"
                          rows="3"
                        />
                        <button
                          onClick={() =>
                            submitReview(job._id)
                          }
                          disabled={
                            submittingReview ===
                            job._id
                          }
                          className="bg-blue-600 text-white px-5 py-2 mt-3 rounded"
                        >
                          {submittingReview === job._id
                            ? "Submitting..."
                            : "Submit Review"}
                        </button>
                      </div>
                    )}
                    {job.rating && (
                      <div className="mt-4 bg-yellow-50 p-4 rounded border">
                        <h3 className="font-bold">
                          Your Review
                        </h3>
                        <p className="text-yellow-500 text-xl">
                          {"★".repeat(job.rating)}
                          <span className="text-gray-300">
                            {"★".repeat(
                              5 - job.rating
                            )}
                          </span>
                        </p>
                        {job.review && (
                          <p className="mt-2 text-gray-700">
                            "{job.review}"
                          </p>
                        )}
                      </div>
                    )}
                    {job.status === "rejected" && (
                      <div className="mt-3 bg-red-100 p-3 rounded">
                        ✕ Worker rejected this job.
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
        {}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            📋 Payment History
          </h2>
          {paidJobs.length === 0 ? (
            <div className="bg-white p-6 rounded shadow">
              No completed payments yet.
            </div>
          ) : (
            <div className="space-y-4">
              {paidJobs.map(
                (job) => (
                  <div
                    key={job._id}
                    className="
                      bg-white
                      p-5
                      rounded
                      shadow
                      flex
                      justify-between
                      items-center
                      flex-wrap
                      gap-4
                    "
                  >
                    <div>
                      <h3 className="text-lg font-bold">
                        {job.title}
                      </h3>
                      <p>
                        <b>Worker:</b>{" "}
                        {job.worker?.name ||
                          "Worker"}
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
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ₹{job.payment}
                      </p>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                        ✓ Paid
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
      {}
      <Chatbot role="customer" />
    </div>
  );
}
export default CustomerDashboard;