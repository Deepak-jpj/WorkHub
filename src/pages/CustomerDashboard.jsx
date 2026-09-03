import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import Chatbot from "../components/Chatbot";
import Map from "../components/Map";
import UPIPaymentQR from "../components/UPIPaymentQR";

function CustomerDashboard() {

  const navigate = useNavigate();

  // =====================================================
  // BASIC STATE
  // =====================================================

  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState("dashboard");

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


  // =====================================================
  // AI JOB STATE
  // =====================================================

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


  // =====================================================
  // FETCH WORKERS
  // =====================================================

  const fetchWorkers = async () => {

    try {

      const response =
        await API.get("/auth/workers");

      setWorkers(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Error fetching workers:",
        error
      );

    }

  };


  // =====================================================
  // FETCH CUSTOMER JOBS
  // =====================================================

  const fetchCustomerJobs = async () => {

    try {

      const response =
        await API.get("/job/my-jobs");

      setJobs(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Error fetching customer jobs:",
        error
      );

    }

  };


  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async () => {

    try {

      const response =
        await API.get("/notifications");

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Error fetching notifications:",
        error
      );

    }

  };


  // =====================================================
  // MARK NOTIFICATION READ
  // =====================================================

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


  // =====================================================
  // MARK ALL NOTIFICATIONS READ
  // =====================================================

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


  // =====================================================
  // INITIAL LOAD
  // =====================================================

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


  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {

    const interval =
      setInterval(() => {

        fetchCustomerJobs();
        fetchNotifications();

      }, 3000);

    return () =>
      clearInterval(interval);

  }, []);


  // =====================================================
  // MANUAL / AI HIRE WORKER
  // IMPORTANT:
  // Backend createJob expects workerId
  // =====================================================

 const getWorkerJob = (workerId) => {
  return jobs.find(
    (job) =>
      job.worker &&
      (job.worker._id === workerId ||
       job.worker === workerId)
  );
};

  const handleHire = async (worker) => {

    if (!worker?._id) {

      alert("Worker information is missing.");

      return;

    }


    const title =
      aiTitle.trim() ||
      `Hire ${worker.name || "Worker"}`;


    const description =
      aiDescription.trim() ||
      `Customer requested ${worker.name || "worker"} service.`;


    const validCategories = [
      "construction",
      "electrician",
      "plumber",
      "cleaning",
      "other"
    ];


    const category =
      validCategories.includes(aiCategory)
        ? aiCategory
        : (
            worker.skills?.[0] ||
            "other"
          );


    const payment =
      Number(aiPayment) || 0;


    const confirmed =
      window.confirm(
        `Send hire request to ${
          worker.name || "this worker"
        }?\n\n` +

        `Service: ${title}\n` +

        `Category: ${category}\n` +

        `Payment: ₹${payment}`
      );


    if (!confirmed) {
      return;
    }


    try {

      setSendingRequest(
        worker._id
      );


      if (!navigator.geolocation) {

        alert(
          "Geolocation is not supported by your browser."
        );

        setSendingRequest(null);

        return;

      }


      navigator.geolocation.getCurrentPosition(

        async (position) => {

          try {

            const latitude =
              position.coords.latitude;

            const longitude =
              position.coords.longitude;


            const response =
              await API.post(
                "/job/create",
                {

                  workerId:
                    worker._id,

                  title,

                  description,

                  category,

                  payment,

                  scheduledDate:
                    aiDate || null,

                  scheduledTime:
                    aiTime || "",

                  lat:
                    latitude,

                  lng:
                    longitude

                }
              );


            console.log(
              "HIRE REQUEST RESPONSE:",
              response.data
            );


            alert(
              `Hire request sent successfully to ${
                worker.name || "worker"
              }!`
            );


            await fetchCustomerJobs();

            await fetchWorkers();

            await fetchNotifications();


          } catch (error) {

          (
              "HIRE WORKER ERROR:",
              error
            );


            alert(
              error.response?.data?.message ||
              error.response?.data?.error ||
              "Failed to send hire request."
            );

          } finally {

            setSendingRequest(null);

          }

        },


        () => {

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
    "Hire request error:",
    error
  );


  // Duplicate request
  if (
    error.response?.status === 409
  ) {

    alert(
      "Request Already Sent. You have already sent a request to this worker."
    );

    await fetchCustomerJobs();

    return;

  }


  alert(
    error.response?.data?.message ||
    "Failed to send hire request"
  );

}

  };



  // =====================================================
  // AI WORKER ANALYSIS
  // =====================================================

  const analyzeWorkersWithAI = async () => {

    if (!aiTitle.trim()) {

      alert(
        "Please enter the job title."
      );

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

                 title: aiTitle,

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


  // =====================================================
  // AI AUTO ASSIGN
  // =====================================================

  const autoAssignBestWorker = async () => {

    if (!aiTitle.trim()) {

      alert(
        "Please enter the job title."
      );

      return;

    }


    const confirmed =
      window.confirm(
        "AI will analyze the available workers and automatically send the job request to the best matching worker. Continue?"
      );


    if (!confirmed) {
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


  // =====================================================
  // CONFIRM PAYMENT
  // =====================================================

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


  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

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


  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {

    localStorage.removeItem("user");

    localStorage.removeItem("token");

    navigate("/");

  };


  // =====================================================
  // PAYMENT CALCULATIONS
  // =====================================================

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


  const pendingJobs =
    jobs.filter(
      (job) =>
        job.status === "pending"
    );


  const acceptedJobs =
    jobs.filter(
      (job) =>
        job.status === "accepted"
    );


  const completedJobs =
    jobs.filter(
      (job) =>
        job.status === "completed"
    );


  const rejectedJobs =
    jobs.filter(
      (job) =>
        job.status === "rejected"
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


  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {

    if (!date) {
      return "Not available";
    }


    return new Date(date)
      .toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );

  };


  // =====================================================
  // STATUS HELPERS
  // =====================================================

  const getStatusText = (job) => {

    if (job.status === "rejected") {
      return "Rejected";
    }

    if (
      job.paymentStatus === "paid"
    ) {
      return "Paid";
    }

    if (
      job.paymentStatus === "requested"
    ) {
      return "Payment Requested";
    }

    if (job.status === "pending") {
      return "Request Sent";
    }

    if (job.status === "accepted") {
      return "Accepted";
    }

    if (job.status === "in-progress") {
      return "In Progress";
    }

    if (job.status === "completed") {
      return "Completed";
    }

    return job.status || "Unknown";

  };


  const getStatusClass = (job) => {

    if (job.status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    if (
      job.paymentStatus === "paid"
    ) {
      return "bg-green-100 text-green-700";
    }

    if (
      job.paymentStatus === "requested"
    ) {
      return "bg-purple-100 text-purple-700";
    }

    if (job.status === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (job.status === "accepted") {
      return "bg-blue-100 text-blue-700";
    }

    if (job.status === "in-progress") {
      return "bg-indigo-100 text-indigo-700";
    }

    if (job.status === "completed") {
      return "bg-green-100 text-green-700";
    }

    return "bg-gray-100 text-gray-700";

  };


  // =====================================================
  // SCORE BAR
  // =====================================================

  const ScoreBar = ({
    label,
    value
  }) => (

    <div className="mb-3">

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


  // =====================================================
  // WORKER CARD
  // =====================================================

  const WorkerCard = ({
    worker,
    aiScore,
    distanceKm
  }) => {

    const job =
      worker


    return (

      <div
        className="
          bg-white
          rounded-2xl
          border
          border-gray-200
          shadow-sm
          hover:shadow-lg
          transition
          p-5
        "
      >

        <div className="flex justify-between items-start gap-4">

          <div className="flex gap-4">

            <div
              className="
                w-14
                h-14
                rounded-full
                bg-blue-100
                flex
                items-center
                justify-center
                text-2xl
              "
            >
              👷
            </div>


            <div>

              <h3 className="text-lg font-bold text-gray-900">

                {worker.name || "Worker"}

              </h3>


              <p className="text-sm text-gray-500">

                {worker.skills?.length
                  ? worker.skills.join(", ")
                  : "Service worker"}

              </p>


              <p className="text-sm text-gray-500 mt-1">

                📍{" "}
                {worker.locationName ||
                  "Location available"}

              </p>

            </div>

          </div>


          <span
            className="
              text-xs
              font-semibold
              px-3
              py-1
              rounded-full
              bg-green-100
              text-green-700
            "
          >
            ● Available
          </span>

        </div>


        <div className="grid grid-cols-3 gap-3 mt-5">

          <div className="bg-gray-50 rounded-lg p-3">

            <p className="text-xs text-gray-500">
              Rating
            </p>

            <p className="font-bold">
              ⭐ {worker.rating || 0}
            </p>

          </div>


          <div className="bg-gray-50 rounded-lg p-3">

            <p className="text-xs text-gray-500">
              Experience
            </p>

            <p className="font-bold">
              {worker.experience || 0} yrs
            </p>

          </div>


          <div className="bg-gray-50 rounded-lg p-3">

            <p className="text-xs text-gray-500">
              Jobs
            </p>

            <p className="font-bold">
              {worker.completedJobs || 0}
            </p>

          </div>

        </div>


        {distanceKm !== undefined && (

          <p className="text-sm text-gray-500 mt-4">

            📏 Approximately{" "}
            <b>
              {distanceKm} km
            </b>{" "}
            away

          </p>

        )}


        {aiScore !== undefined && (

          <div className="mt-4">

            <div className="flex justify-between text-sm">

              <span className="font-medium">
                AI Match
              </span>

              <b className="text-blue-600">
                {aiScore}%
              </b>

            </div>


            <div className="w-full bg-gray-200 h-2 rounded-full mt-1">

              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width:
                    `${Math.min(
                      100,
                      Number(aiScore || 0)
                    )}%`
                }}
              />

            </div>

          </div>

        )}


        {!job && (

          <button
            onClick={() =>
              handleHire(worker)
            }
            disabled={
              sendingRequest === worker._id
            }
            className="
              w-full
              mt-5
              bg-green-600
              hover:bg-green-700
              disabled:bg-gray-400
              text-white
              py-3
              rounded-xl
              font-semibold
              transition
            "
          >

            {sendingRequest === worker._id
              ? "Sending Request..."
              : "Hire Worker"}

          </button>

        )}


        {job &&
          job.status === "pending" && (

          <div
            className="
              mt-5
              bg-yellow-50
              text-yellow-700
              p-3
              rounded-xl
              text-center
              font-semibold
            "
          >
            ⏳ Request Sent
          </div>

        )}


        {job &&
          job.status === "accepted" && (

          <div
            className="
              mt-5
              bg-blue-50
              text-blue-700
              p-3
              rounded-xl
              text-center
              font-semibold
            "
          >
            ✓ Request Accepted
          </div>

        )}


        {job &&
          job.status === "completed" && (

          <div
            className="
              mt-5
              bg-green-50
              text-green-700
              p-3
              rounded-xl
              text-center
              font-semibold
            "
          >
            ✓ Job Completed
          </div>

        )}

      </div>

    );

  };


  // =====================================================
  // REQUEST CARD
  // =====================================================

  const RequestCard = ({
    job
  }) => {

    return (

      <div
        className="
          bg-white
          rounded-2xl
          border
          border-gray-200
          shadow-sm
          p-6
          hover:shadow-md
          transition
        "
      >

        <div className="flex justify-between items-start gap-4">

          <div>

            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
              Job Request
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-1">
              {job.title || "Service Request"}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Created {formatDate(job.createdAt)}
            </p>

          </div>


          <span
            className={`
              px-3
              py-1
              rounded-full
              text-xs
              font-bold
              whitespace-nowrap
              ${getStatusClass(job)}
            `}
          >
            {getStatusText(job)}
          </span>

        </div>


        <div className="grid md:grid-cols-4 gap-4 mt-5">

          <div>

            <p className="text-xs text-gray-500">
              Worker
            </p>

            <p className="font-semibold">
              {job.worker?.name ||
                "Not assigned"}
            </p>

          </div>


          <div>

            <p className="text-xs text-gray-500">
              Category
            </p>

            <p className="font-semibold capitalize">
              {job.category ||
                "Other"}
            </p>

          </div>


          <div>

            <p className="text-xs text-gray-500">
              Scheduled
            </p>

            <p className="font-semibold">
              {job.scheduledDate
                ? formatDate(
                    job.scheduledDate
                  )
                : "Not scheduled"}
            </p>

          </div>


          <div>

            <p className="text-xs text-gray-500">
              Payment
            </p>

            <p className="font-bold text-green-600">
              ₹{job.payment || 0}
            </p>

          </div>

        </div>


        {job.description && (

          <div className="mt-5 bg-gray-50 rounded-xl p-4">

            <p className="text-xs font-semibold text-gray-500 uppercase">
              Description
            </p>

            <p className="text-gray-700 mt-1">
              {job.description}
            </p>

          </div>

        )}


        {job.status === "accepted" && (

          <div className="mt-5 bg-blue-50 text-blue-700 p-4 rounded-xl">

            ✓ Worker has accepted your request.

          </div>

        )}


        {job.status === "completed" &&
          job.paymentStatus !== "requested" &&
          job.paymentStatus !== "paid" && (

          <div className="mt-5 bg-green-50 text-green-700 p-4 rounded-xl">

            ✓ Worker completed the job.

            <br />

            Waiting for payment request.

          </div>

        )}


        {job.paymentStatus === "requested" && (

          <div className="mt-5 bg-purple-50 border border-purple-100 p-5 rounded-xl">

            <div className="flex justify-between items-start">

              <div>

                <p className="font-bold text-purple-800 text-lg">
                  💰 Payment Request
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Worker has requested payment for this completed job.
                </p>

              </div>


              <p className="text-2xl font-bold text-purple-700">
                ₹{job.payment || 0}
              </p>

            </div>


            <div className="mt-4 grid md:grid-cols-2 gap-4">

              <div className="bg-white p-4 rounded-lg">

                <p className="text-xs text-gray-500">
                  Worker UPI ID
                </p>

                <p className="font-bold break-all mt-1">
                  {job.paymentUpiId ||
                    "Not available"}
                </p>

              </div>


              <div className="bg-white p-4 rounded-lg">

                <p className="text-xs text-gray-500">
                  Amount
                </p>

                <p className="font-bold mt-1">
                  ₹{job.payment || 0}
                </p>

              </div>

            </div>


            <p className="text-sm text-gray-600 mt-4">
              Pay the worker using your UPI application.
            </p>


            <div className="mt-4">

              <UPIPaymentQR
                upiId={
                  job.paymentUpiId
                }
                amount={
                  job.payment || 0
                }
                name={
                  job.worker?.name ||
                  "Worker"
                }
              />

            </div>


            <button
              onClick={() =>
                confirmPayment(job._id)
              }
              disabled={
                confirmingPayment ===
                job._id
              }
              className="
                mt-5
                bg-green-600
                hover:bg-green-700
                disabled:bg-gray-400
                text-white
                px-6
                py-3
                rounded-xl
                font-semibold
              "
            >

              {confirmingPayment === job._id
                ? "Confirming..."
                : "✓ I Have Paid"}

            </button>

          </div>

        )}


        {job.paymentStatus === "paid" && (

          <div className="mt-5 bg-green-50 border border-green-200 p-5 rounded-xl">

            <div className="flex justify-between items-center">

              <div>

                <p className="font-bold text-green-800">
                  ✓ Payment Completed
                </p>

                <p className="text-sm text-green-700 mt-1">
                  Payment has been marked as completed.
                </p>

              </div>

              <p className="text-2xl font-bold text-green-700">
                ₹{job.payment || 0}
              </p>

            </div>

          </div>

        )}


        {job.paymentStatus === "paid" &&
          !job.rating && (

          <div className="mt-5 bg-blue-50 border border-blue-100 p-5 rounded-xl">

            <h3 className="font-bold text-lg">
              ⭐ Rate Your Worker
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              Share your experience with this worker.
            </p>


            <div className="flex gap-2 mt-4">

              {[1, 2, 3, 4, 5].map(
                (star) => (

                  <button
                    key={star}
                    onClick={() =>
                      setRating(star)
                    }
                    className="text-3xl"
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
                setReview(e.target.value)
              }
              placeholder="Write a review (optional)"
              className="
                w-full
                border
                border-gray-300
                rounded-xl
                p-3
                mt-4
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
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
              className="
                bg-blue-600
                hover:bg-blue-700
                disabled:bg-gray-400
                text-white
                px-6
                py-3
                mt-3
                rounded-xl
                font-semibold
              "
            >

              {submittingReview === job._id
                ? "Submitting..."
                : "Submit Review"}

            </button>

          </div>

        )}


        {job.rating && (

          <div className="mt-5 bg-yellow-50 border border-yellow-100 p-5 rounded-xl">

            <h3 className="font-bold">
              ⭐ Your Review
            </h3>


            <p className="text-xl mt-2">

              {"★".repeat(
                Number(job.rating)
              )}

              <span className="text-gray-300">

                {"★".repeat(
                  Math.max(
                    0,
                    5 - Number(job.rating)
                  )
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

          <div className="mt-5 bg-red-50 text-red-700 p-4 rounded-xl">

            ✕ Worker rejected this request.

          </div>

        )}

      </div>

    );

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          bg-gray-100
          flex
          items-center
          justify-center
        "
      >

        <div className="text-center">

          <div className="text-5xl mb-4">
            ⚙️
          </div>

          <p className="text-xl font-semibold text-gray-700">
            Loading your dashboard...
          </p>

          <p className="text-sm text-gray-500 mt-2">
            Fetching workers, requests and notifications.
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // DASHBOARD
  // =====================================================

  return (

    <div className="min-h-screen bg-gray-100">


      {/* =================================================
          PROFESSIONAL HEADER
      ================================================= */}

      <header
        className="
          bg-blue-600
          text-white
          shadow-lg
          sticky
          top-0
          z-40
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto
            px-5
            py-4
            flex
            items-center
            justify-between
            gap-4
          "
        >

          {/* BRAND */}

          <div className="flex items-center gap-3">

            <div
              className="
                w-11
                h-11
                bg-white/15
                rounded-xl
                flex
                items-center
                justify-center
                text-2xl
              "
            >
              🏠
            </div>


            <div>

              <h1 className="text-xl md:text-2xl font-bold">
                Customer Dashboard
              </h1>

              <p className="text-blue-100 text-xs md:text-sm">
                Manage your service requests
              </p>

            </div>

          </div>


          {/* RIGHT SIDE - ONE LINE */}

          <div
            className="
              flex
              items-center
              gap-2
              md:gap-3
              shrink-0
            "
          >

            {/* REQUEST SENT */}

            <button
              onClick={() =>
                setActiveSection("requests")
              }
              className="
                flex
                items-center
                gap-2
                bg-white
                text-blue-700
                hover:bg-blue-50
                px-3
                md:px-4
                py-2.5
                rounded-xl
                font-semibold
                text-sm
                transition
                shadow-sm
              "
            >

              📋

              <span className="hidden sm:inline">
                Request Sent
              </span>

              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                {jobs.length}
              </span>

            </button>


            {/* NOTIFICATIONS */}

            <div className="relative">

              <button
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
                }
                className="
                  relative
                  w-11
                  h-11
                  rounded-xl
                  bg-blue-700
                  hover:bg-blue-800
                  flex
                  items-center
                  justify-center
                  text-xl
                  transition
                "
              >

                🔔


                {unreadCount > 0 && (

                  <span
                    className="
                      absolute
                      -top-1
                      -right-1
                      bg-red-500
                      text-white
                      text-[10px]
                      font-bold
                      rounded-full
                      min-w-[20px]
                      h-[20px]
                      flex
                      items-center
                      justify-center
                      border-2
                      border-blue-600
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
                    top-14
                    w-80
                    max-w-[90vw]
                    bg-white
                    text-gray-900
                    rounded-2xl
                    shadow-2xl
                    border
                    border-gray-200
                    overflow-hidden
                    z-50
                  "
                >

                  <div
                    className="
                      p-4
                      border-b
                      flex
                      justify-between
                      items-center
                    "
                  >

                    <div>

                      <h3 className="font-bold">
                        Notifications
                      </h3>

                      <p className="text-xs text-gray-500">
                        Latest updates
                      </p>

                    </div>


                    {unreadCount > 0 && (

                      <button
                        onClick={
                          markAllNotificationsRead
                        }
                        className="
                          text-xs
                          text-blue-600
                          font-semibold
                        "
                      >
                        Mark all read
                      </button>

                    )}

                  </div>


                  <div className="max-h-80 overflow-y-auto">

                    {notifications.length === 0 ? (

                      <div className="p-8 text-center">

                        <div className="text-3xl">
                          🔔
                        </div>

                        <p className="text-gray-500 mt-2">
                          No notifications
                        </p>

                      </div>

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
                            className={`
                              p-4
                              border-b
                              cursor-pointer
                              hover:bg-gray-50
                              ${
                                notification.isRead
                                  ? "bg-white"
                                  : "bg-blue-50"
                              }
                            `}
                          >

                            <div className="flex gap-3">

                              <div className="text-lg">
                                🔔
                              </div>

                              <div>

                                <p className="font-medium text-sm">
                                  {
                                    notification.message
                                  }
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(
                                    notification.createdAt
                                  )}
                                </p>


                                {!notification.isRead && (

                                  <span className="inline-block mt-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                                    NEW
                                  </span>

                                )}

                              </div>

                            </div>

                          </div>

                        )
                      )

                    )}

                  </div>

                </div>

              )}

            </div>


            {/* LOGOUT */}

            <button
              onClick={logout}
              className="
                bg-red-500
                hover:bg-red-600
                px-3
                md:px-5
                py-2.5
                rounded-xl
                font-semibold
                text-sm
                transition
                shadow-sm
              "
            >

              <span className="hidden sm:inline">
                Logout
              </span>

              <span className="sm:hidden">
                ↪
              </span>

            </button>

          </div>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className="
          max-w-7xl
          mx-auto
          px-4
          md:px-6
          py-6
          md:py-8
        "
      >


        {/* =================================================
            REQUEST PAGE
        ================================================= */}

        {activeSection === "requests" ? (

          <>

            {/* REQUEST HEADER */}

            <div className="flex justify-between items-center mb-6">

              <div>

                <p className="text-sm text-blue-600 font-semibold">
                  CUSTOMER ACTIVITY
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  My Requests
                </h2>

                <p className="text-gray-500 mt-1">
                  Track all your service requests and payments.
                </p>

              </div>


              <button
                onClick={() =>
                  setActiveSection("dashboard")
                }
                className="
                  bg-white
                  border
                  border-gray-300
                  hover:bg-gray-50
                  px-4
                  py-2
                  rounded-xl
                  font-semibold
                "
              >
                ← Dashboard
              </button>

            </div>


            {/* REQUEST SUMMARY */}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

              <div className="bg-white rounded-2xl p-5 border shadow-sm">

                <p className="text-xs text-gray-500">
                  Total
                </p>

                <p className="text-3xl font-bold mt-1">
                  {jobs.length}
                </p>

              </div>


              <div className="bg-white rounded-2xl p-5 border shadow-sm">

                <p className="text-xs text-gray-500">
                  Sent
                </p>

                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {pendingJobs.length}
                </p>

              </div>


              <div className="bg-white rounded-2xl p-5 border shadow-sm">

                <p className="text-xs text-gray-500">
                  Accepted
                </p>

                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {acceptedJobs.length}
                </p>

              </div>


              <div className="bg-white rounded-2xl p-5 border shadow-sm">

                <p className="text-xs text-gray-500">
                  Completed
                </p>

                <p className="text-3xl font-bold text-green-600 mt-1">
                  {completedJobs.length}
                </p>

              </div>


              <div className="bg-white rounded-2xl p-5 border shadow-sm">

                <p className="text-xs text-gray-500">
                  Rejected
                </p>

                <p className="text-3xl font-bold text-red-600 mt-1">
                  {rejectedJobs.length}
                </p>

              </div>

            </div>


            {/* REQUEST LIST */}

            {jobs.length === 0 ? (

              <div
                className="
                  bg-white
                  rounded-2xl
                  border
                  p-12
                  text-center
                  shadow-sm
                "
              >

                <div className="text-5xl">
                  📋
                </div>

                <h3 className="text-xl font-bold mt-4">
                  No requests yet
                </h3>

                <p className="text-gray-500 mt-2">
                  Your service requests will appear here.
                </p>


                <button
                  onClick={() =>
                    setActiveSection("dashboard")
                  }
                  className="
                    mt-6
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    px-6
                    py-3
                    rounded-xl
                    font-semibold
                  "
                >
                  Find a Worker
                </button>

              </div>

            ) : (

              <div className="space-y-5">

                {jobs.map(
                  (job) => (

                    <RequestCard
                      key={job._id}
                      job={job}
                    />

                  )
                )}

              </div>

            )}

          </>

        ) : (

          <>
            {/* =================================================
                WELCOME / HERO
            ================================================= */}

            <section
              className="
                bg-white
                rounded-3xl
                border
                border-gray-200
                shadow-sm
                overflow-hidden
                mb-8
              "
            >

              <div
                className="
                  p-6
                  md:p-8
                  bg-gradient-to-r
                  from-blue-50
                  to-white
                "
              >

                <div className="max-w-3xl">

                  <p className="text-blue-600 font-bold text-sm uppercase tracking-wide">
                    WORKHUB SERVICE PLATFORM
                  </p>

                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                    Find the right worker for your job.
                  </h2>

                  <p className="text-gray-600 mt-3 text-lg">
                    Create your service request and let AI help you find the best available worker based on skills, distance, rating, experience and workload.
                  </p>

                </div>

              </div>

            </section>


            {/* =================================================
                AI SCHEDULING
            ================================================= */}

            <section
              className="
                bg-white
                rounded-3xl
                border
                border-gray-200
                shadow-sm
                p-6
                md:p-8
                mb-8
              "
            >

              <div className="flex items-start gap-4 mb-7">

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-blue-100
                    flex
                    items-center
                    justify-center
                    text-2xl
                  "
                >
                  🤖
                </div>


                <div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    AI Worker Scheduling
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Tell us what you need and AI will help match the right worker.
                  </p>

                </div>

              </div>


              {/* FORM */}

              <div className="grid md:grid-cols-2 gap-5">

                {/* JOB TITLE */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Title
                  </label>

                  <input
                    type="text"
                    value={aiTitle}
                    onChange={(e) =>
                      setAiTitle(
                        e.target.value
                      )
                    }
                    placeholder="Example: Fix electrical wiring"
                    className="
                      w-full
                      border
                      border-gray-300
                      p-3.5
                      rounded-xl
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>


                {/* CATEGORY */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Category
                  </label>

                  <select
                    value={aiCategory}
                    onChange={(e) =>
                      setAiCategory(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      border
                      border-gray-300
                      p-3.5
                      rounded-xl
                      bg-white
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  >

                    <option value="other">
                      Other
                    </option>

                    <option value="plumber">
                      Plumber
                    </option>

                    <option value="electrician">
                      Electrician
                    </option>

                    <option value="construction">
                      Construction
                    </option>

                    <option value="cleaning">
                      Cleaning
                    </option>

                  </select>

                </div>


                {/* DESCRIPTION */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    rows="4"
                    className="
                      w-full
                      border
                      border-gray-300
                      p-3.5
                      rounded-xl
                      resize-none
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>


                {/* PAYMENT */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="
                      w-full
                      border
                      border-gray-300
                      p-3.5
                      rounded-xl
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>


                {/* DATE */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Scheduled Date
                  </label>

                  <input
                    type="date"
                    value={aiDate}
                    onChange={(e) =>
                      setAiDate(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      border
                      border-gray-300
                      p-3.5
                      rounded-xl
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>


                {/* TIME */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Scheduled Time
                  </label>

                  <input
                    type="time"
                    value={aiTime}
                    onChange={(e) =>
                      setAiTime(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      border
                      border-gray-300
                      p-3.5
                      rounded-xl
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>

              </div>


              {/* =================================================
                  FIND WORKER OPTIONS
              ================================================= */}

              <div className="mt-8">

                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Choose How You Want to Find a Worker
                </h3>


                <div className="grid md:grid-cols-3 gap-4">

                  {/* AI RECOMMENDATION */}

                  <button
                    onClick={
                      analyzeWorkersWithAI
                    }
                    disabled={
                      aiLoading
                    }
                    className="
                      group
                      bg-blue-600
                      hover:bg-blue-700
                      disabled:bg-gray-400
                      text-white
                      p-6
                      rounded-2xl
                      text-left
                      transition
                      shadow-sm
                      hover:shadow-lg
                    "
                  >

                    <div className="text-3xl mb-3">
                      🤖
                    </div>

                    <h3 className="font-bold text-lg">
                      AI Worker Recommendation
                    </h3>

                    <p className="text-sm mt-2 text-blue-100">
                      {aiLoading
                        ? "AI is analyzing workers..."
                        : "Compare workers using skills, distance, rating, experience and workload."}
                    </p>

                  </button>


                  {/* AUTO ASSIGN */}

                  <button
                    onClick={
                      autoAssignBestWorker
                    }
                    disabled={
                      autoAssigning
                    }
                    className="
                      group
                      bg-purple-600
                      hover:bg-purple-700
                      disabled:bg-gray-400
                      text-white
                      p-6
                      rounded-2xl
                      text-left
                      transition
                      shadow-sm
                      hover:shadow-lg
                    "
                  >

                    <div className="text-3xl mb-3">
                      ⚡
                    </div>

                    <h3 className="font-bold text-lg">
                      Smart Auto-Assign
                    </h3>

                    <p className="text-sm mt-2 text-purple-100">
                      {autoAssigning
                        ? "AI is selecting the best worker..."
                        : "Let AI automatically select the best available worker."}
                    </p>

                  </button>


                  {/* MANUAL */}

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
                      group
                      bg-green-600
                      hover:bg-green-700
                      text-white
                      p-6
                      rounded-2xl
                      text-left
                      transition
                      shadow-sm
                      hover:shadow-lg
                    "
                  >

                    <div className="text-3xl mb-3">
                      👷
                    </div>

                    <h3 className="font-bold text-lg">
                      Manual Hire
                    </h3>

                    <p className="text-sm mt-2 text-green-100">
                      Choose a worker yourself from the available worker list.
                    </p>

                  </button>

                </div>


                {showAIResults && (

                  <button
                    onClick={() => {

                      setShowAIResults(
                        false
                      );

                      setAiWorkers([]);

                      setBestAIWorker(
                        null
                      );

                    }}
                    className="
                      mt-4
                      bg-gray-700
                      hover:bg-gray-800
                      text-white
                      px-5
                      py-2.5
                      rounded-xl
                      font-semibold
                    "
                  >
                    Clear AI Results
                  </button>

                )}

              </div>

            </section>


            {/* =================================================
                AI RESULTS
            ================================================= */}

            {showAIResults && (

              <section className="mb-8">

                <div className="flex justify-between items-center mb-5">

                  <div>

                    <p className="text-sm text-blue-600 font-semibold">
                      AI MATCHING
                    </p>

                    <h2 className="text-2xl font-bold">
                      AI Analysis Results
                    </h2>

                  </div>


                  <span className="text-sm text-gray-500">
                    {aiWorkers.length} workers analyzed
                  </span>

                </div>


                {/* BEST WORKER */}

                {bestAIWorker && (

                  <div
                    className="
                      bg-white
                      border-2
                      border-blue-500
                      rounded-3xl
                      p-6
                      md:p-8
                      shadow-sm
                      mb-6
                    "
                  >

                    <div className="flex justify-between items-start gap-5 flex-wrap">

                      <div className="flex gap-4">

                        <div
                          className="
                            w-16
                            h-16
                            bg-blue-100
                            rounded-2xl
                            flex
                            items-center
                            justify-center
                            text-3xl
                          "
                        >
                          👷
                        </div>


                        <div>

                          <p className="text-xs text-blue-600 font-bold uppercase">
                            ⭐ AI Recommended Worker
                          </p>

                          <h3 className="text-2xl font-bold mt-1">
                            {bestAIWorker.worker?.name}
                          </h3>

                          <p className="text-gray-500 mt-1">
                            {bestAIWorker.worker?.skills?.join(
                              ", "
                            ) ||
                              "Skills not specified"}
                          </p>

                        </div>

                      </div>


                      <div className="text-right">

                        <p className="text-sm text-gray-500">
                          AI Match Score
                        </p>

                        <p className="text-4xl font-bold text-blue-600">
                          {bestAIWorker.aiScore}%
                        </p>

                      </div>

                    </div>


                    <div className="grid md:grid-cols-4 gap-4 mt-6">

                      <div className="bg-gray-50 rounded-xl p-4">

                        <p className="text-xs text-gray-500">
                          Distance
                        </p>

                        <p className="font-bold mt-1">
                          {bestAIWorker.distanceKm} km
                        </p>

                      </div>


                      <div className="bg-gray-50 rounded-xl p-4">

                        <p className="text-xs text-gray-500">
                          Rating
                        </p>

                        <p className="font-bold mt-1">
                          ⭐{" "}
                          {bestAIWorker.worker?.rating || 0}
                        </p>

                      </div>


                      <div className="bg-gray-50 rounded-xl p-4">

                        <p className="text-xs text-gray-500">
                          Experience
                        </p>

                        <p className="font-bold mt-1">
                          {bestAIWorker.worker?.experience || 0}
                          {" "}
                          years
                        </p>

                      </div>


                      <div className="bg-gray-50 rounded-xl p-4">

                        <p className="text-xs text-gray-500">
                          Active Jobs
                        </p>

                        <p className="font-bold mt-1">
                          {bestAIWorker.activeJobs || 0}
                        </p>

                      </div>

                    </div>


                    {/* SCORE BREAKDOWN */}

                    {bestAIWorker.scoreBreakdown && (

                      <div className="mt-7">

                        <h4 className="font-bold mb-4">
                          AI Decision Factors
                        </h4>


                        <div className="grid md:grid-cols-2 gap-x-8">

                          <ScoreBar
                            label="Skill Match"
                            value={
                              bestAIWorker
                                .scoreBreakdown
                                .skillMatch
                            }
                          />

                          <ScoreBar
                            label="Availability"
                            value={
                              bestAIWorker
                                .scoreBreakdown
                                .availability
                            }
                          />

                          <ScoreBar
                            label="Distance"
                            value={
                              bestAIWorker
                                .scoreBreakdown
                                .distance
                            }
                          />

                          <ScoreBar
                            label="Rating"
                            value={
                              bestAIWorker
                                .scoreBreakdown
                                .rating
                            }
                          />

                          <ScoreBar
                            label="Experience"
                            value={
                              bestAIWorker
                                .scoreBreakdown
                                .experience
                            }
                          />

                          <ScoreBar
                            label="Workload"
                            value={
                              bestAIWorker
                                .scoreBreakdown
                                .workload
                            }
                          />

                        </div>

                      </div>

                    )}


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
                        mt-6
                        bg-green-600
                        hover:bg-green-700
                        disabled:bg-gray-400
                        text-white
                        px-7
                        py-3
                        rounded-xl
                        font-semibold
                      "
                    >

                      {sendingRequest ===
                      bestAIWorker.worker?._id
                        ? "Sending..."
                        : "Hire Recommended Worker"}

                    </button>

                  </div>

                )}


                {/* OTHER AI WORKERS */}

                {aiWorkers.length > 0 && (

                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

                    {aiWorkers.map(
                      (item, index) => {

                        const worker =
                          item.worker;

                        if (!worker) {
                          return null;
                        }


                        return (

                          <WorkerCard
                            key={
                              worker._id ||
                              index
                            }
                            worker={
                              worker
                            }
                            aiScore={
                              item.aiScore
                            }
                            distanceKm={
                              item.distanceKm
                            }
                          />

                        );

                      }
                    )}

                  </div>

                )}

              </section>

            )}


            {/* =================================================
                WORKER MAP
            ================================================= */}

            <section className="mb-8">

              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="p-6 border-b">

                  <div className="flex justify-between items-center">

                    <div>

                      <p className="text-sm text-blue-600 font-semibold">
                        LOCATION
                      </p>

                      <h2 className="text-2xl font-bold mt-1">
                        Worker Location Map
                      </h2>

                      <p className="text-gray-500 mt-1">
                        View available workers around your service location.
                      </p>

                    </div>


                    <div className="hidden md:flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">

                      <span className="w-2 h-2 bg-green-500 rounded-full" />

                      {workers.length} Workers Available

                    </div>

                  </div>

                </div>


                <div className="p-4 md:p-6">

                  <div className="rounded-2xl overflow-hidden border">

                    <Map
                      workers={
                        workers
                      }
                    />

                  </div>

                </div>

              </div>

            </section>


            {/* =================================================
                AVAILABLE WORKERS
            ================================================= */}

            <section
              id="available-workers"
              className="mb-8"
            >

              <div className="flex justify-between items-end mb-5">

                <div>

                  <p className="text-sm text-green-600 font-semibold">
                    AVAILABLE NOW
                  </p>

                  <h2 className="text-2xl font-bold mt-1">
                    Choose a Worker
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Review worker details before sending a request.
                  </p>

                </div>


                <span className="text-sm text-gray-500">
                  {workers.length} workers
                </span>

              </div>


              {workers.length === 0 ? (

                <div className="bg-white rounded-2xl border p-10 text-center">

                  <div className="text-4xl">
                    👷
                  </div>

                  <p className="font-semibold mt-3">
                    No workers available right now.
                  </p>

                </div>

              ) : (

  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

    {workers.map((worker) => (

      <div className="
        bg-white
        rounded-2xl
        border
        border-gray-200
        p-5
        shadow-sm
        hover:shadow-lg
        transition
      ">

        <div className="flex items-center gap-4">

          <div className="
            w-14
            h-14
            rounded-full
            bg-blue-100
            flex
            items-center
            justify-center
            text-2xl
          ">
            👷
          </div>

          <div>
            <h3 className="font-bold text-lg">
              {worker.name}
            </h3>

            <p className="text-sm text-gray-500">
              {worker.skills?.join(", ") || "General Worker"}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">⭐ Rating</p>
            <p className="font-bold">
              {worker.rating || 4}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Experience</p>
            <p className="font-bold">
              {worker.experience || 0} years
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Completed Jobs</p>
            <p className="font-bold">
              {worker.completedJobs || 0}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Availability</p>

            <p className={
              worker.isAvailable
                ? "font-bold text-green-600"
                : "font-bold text-red-600"
            }>
              {worker.isAvailable ? "Available" : "Busy"}
            </p>
          </div>

        </div>

        <div className="mt-4">

          <p className="text-xs text-gray-500">
            Skills
          </p>

          <div className="flex flex-wrap gap-2 mt-2">

            {(worker.skills || ["General Service"]).map(
              (skill, index) => (
                <span
                  key={index}
                  className="
                    bg-blue-50
                    text-blue-700
                    px-3
                    py-1
                    rounded-lg
                    text-sm
                    font-medium
                  "
                >
                  {skill}
                </span>
              )
            )}

          </div>

        </div>

        <button
  disabled={
    !worker.isAvailable ||
    !!getWorkerJob(worker._id)
  }
  onClick={() => handleHire(worker)}
  className="
    w-full
    mt-5
    bg-green-600
    hover:bg-green-700
    disabled:bg-gray-400
    disabled:cursor-not-allowed
    text-white
    py-3
    rounded-xl
    font-bold
    transition
  "
>
  {getWorkerJob(worker._id)
    ? "✓ Request Sent"
    : worker.isAvailable
      ? "👷 Hire Worker"
      : "Worker Busy"}
</button>

      </div>

    ))}

  </div>

)}

            </section>


            {/* =================================================
                PAYMENT SUMMARY
            ================================================= */}

            <section className="mb-8">

              <div className="flex items-end justify-between mb-5">

                <div>

                  <p className="text-sm text-purple-600 font-semibold">
                    FINANCIAL OVERVIEW
                  </p>

                  <h2 className="text-2xl font-bold mt-1">
                    Payment Summary
                  </h2>

                </div>

              </div>


              <div className="grid md:grid-cols-3 gap-5">

                <div
                  className="
                    bg-white
                    rounded-2xl
                    border
                    border-gray-200
                    p-6
                    shadow-sm
                  "
                >

                  <div className="flex justify-between">

                    <div>

                      <p className="text-sm text-gray-500">
                        Total Paid
                      </p>

                      <p className="text-3xl font-bold text-green-600 mt-2">
                        ₹{totalPaid}
                      </p>

                    </div>

                    <div className="text-3xl">
                      ✓
                    </div>

                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    {paidJobs.length} completed payment(s)
                  </p>

                </div>


                <div
                  className="
                    bg-white
                    rounded-2xl
                    border
                    border-gray-200
                    p-6
                    shadow-sm
                  "
                >

                  <div className="flex justify-between">

                    <div>

                      <p className="text-sm text-gray-500">
                        Payment Pending
                      </p>

                      <p className="text-3xl font-bold text-purple-600 mt-2">
                        ₹{totalPending}
                      </p>

                    </div>

                    <div className="text-3xl">
                      💰
                    </div>

                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    {requestedPayments.length} payment request(s)
                  </p>

                </div>


                <div
                  className="
                    bg-white
                    rounded-2xl
                    border
                    border-gray-200
                    p-6
                    shadow-sm
                  "
                >

                  <div className="flex justify-between">

                    <div>

                      <p className="text-sm text-gray-500">
                        Total Requests
                      </p>

                      <p className="text-3xl font-bold text-blue-600 mt-2">
                        {jobs.length}
                      </p>

                    </div>

                    <div className="text-3xl">
                      📋
                    </div>

                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    All service requests
                  </p>

                </div>

              </div>

            </section>


            {/* =================================================
                RECENT REQUESTS
            ================================================= */}

            <section className="mb-8">

              <div className="flex justify-between items-end mb-5">

                <div>

                  <p className="text-sm text-blue-600 font-semibold">
                    ACTIVITY
                  </p>

                  <h2 className="text-2xl font-bold mt-1">
                    Recent Requests
                  </h2>

                </div>


                {jobs.length > 0 && (

                  <button
                    onClick={() =>
                      setActiveSection(
                        "requests"
                      )
                    }
                    className="
                      text-blue-600
                      hover:text-blue-800
                      font-semibold
                      text-sm
                    "
                  >
                    View All →
                  </button>

                )}

              </div>


              {jobs.length === 0 ? (

                <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">
                  No service requests yet.
                </div>

              ) : (

                <div className="space-y-4">

                  {jobs
                    .slice(0, 5)
                    .map(
                      (job) => (

                        <RequestCard
                          key={
                            job._id
                          }
                          job={
                            job
                          }
                        />

                      )
                    )}

                </div>

              )}

            </section>


            {/* =================================================
                PAYMENT HISTORY
            ================================================= */}

            <section className="mb-10">

              <div className="mb-5">

                <p className="text-sm text-green-600 font-semibold">
                  TRANSACTIONS
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  Payment History
                </h2>

              </div>


              {paidJobs.length === 0 ? (

                <div className="bg-white rounded-2xl border p-8 text-center">

                  <div className="text-4xl">
                    💳
                  </div>

                  <p className="font-semibold mt-3">
                    No completed payments yet.
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Completed transactions will appear here.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {paidJobs.map(
                    (job) => (

                      <div
                        key={
                          job._id
                        }
                        className="
                          bg-white
                          rounded-2xl
                          border
                          border-gray-200
                          p-5
                          shadow-sm
                          flex
                          justify-between
                          items-center
                          gap-5
                          flex-wrap
                        "
                      >

                        <div className="flex items-center gap-4">

                          <div
                            className="
                              w-12
                              h-12
                              rounded-xl
                              bg-green-100
                              flex
                              items-center
                              justify-center
                              text-xl
                            "
                          >
                            ✓
                          </div>


                          <div>

                            <h3 className="font-bold">
                              {job.title}
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                              Worker:{" "}
                              {job.worker?.name ||
                                "Worker"}
                            </p>

                            <p className="text-sm text-gray-500">
                              UPI:{" "}
                              {job.paymentUpiId ||
                                "Not available"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {formatDate(
                                job.paymentPaidAt ||
                                job.updatedAt
                              )}
                            </p>

                          </div>

                        </div>


                        <div className="text-right">

                          <p className="text-2xl font-bold text-green-600">
                            ₹{job.payment || 0}
                          </p>

                          <span className="inline-block mt-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            PAID
                          </span>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>

          </>

        )}

      </main>


      {/* =================================================
          CHATBOT
      ================================================= */}

      <Chatbot role="customer" />

    </div>

  );

}

export default CustomerDashboard;