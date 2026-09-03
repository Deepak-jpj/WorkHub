import { useState } from "react";
import {
  useLocation,
  useNavigate
} from "react-router-dom";

import API from "../services/api";


function Login() {

  const navigate = useNavigate();
  const location = useLocation();


  // =====================================================
  // GET ROLE FROM URL
  // =====================================================

  const params = new URLSearchParams(
    location.search
  );

  const urlRole = params.get("role");


  // =====================================================
  // INITIAL ROLE
  // =====================================================

  const [role, setRole] = useState(
    urlRole === "worker"
      ? "worker"
      : "customer"
  );


  // =====================================================
  // LOCK ROLE WHEN URL CONTAINS ROLE
  // =====================================================

  const isLocked =
    urlRole === "customer" ||
    urlRole === "worker";


  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


  const isCustomer =
    role === "customer";


  // =====================================================
  // THEME
  // =====================================================

  const theme = isCustomer
    ? {

        title: "Customer Login",

        badge: "CUSTOMER PORTAL",

        icon: "👤",

        description:
          "Find trusted professionals and manage your service requests.",

        button:
          "bg-blue-600 hover:bg-blue-700",

        accent:
          "text-blue-600",

        soft:
          "bg-blue-50",

        border:
          "border-blue-200",

        leftGradient:
          "from-blue-50 via-white to-cyan-50",

        features: [

          [
            "🔎",
            "Find skilled workers",
            "Discover professionals near your location."
          ],

          [
            "📍",
            "Location based matching",
            "Find suitable workers around you."
          ],

          [
            "🛡️",
            "Secure service",
            "Manage your requests safely."
          ]

        ]

      }

    : {

        title: "Worker Login",

        badge: "WORKER PORTAL",

        icon: "👷",

        description:
          "Manage your jobs, availability and professional profile.",

        button:
          "bg-emerald-600 hover:bg-emerald-700",

        accent:
          "text-emerald-600",

        soft:
          "bg-emerald-50",

        border:
          "border-emerald-200",

        leftGradient:
          "from-emerald-50 via-white to-teal-50",

        features: [

          [
            "📋",
            "Manage requests",
            "View and respond to customer requests."
          ],

          [
            "📍",
            "Control availability",
            "Update your availability and location."
          ],

          [
            "⭐",
            "Build reputation",
            "Manage your skills and completed work."
          ]

        ]

      };


  // =====================================================
  // LOGIN
  // =====================================================

  const loginUser = async (e) => {

    e.preventDefault();


    if (!email.trim() || !password) {

      alert(
        "Please enter your email and password."
      );

      return;
    }


    try {

      setLoading(true);


      const res = await API.post(
        "/auth/login",
        {
          email:
            email.trim().toLowerCase(),

          password
        }
      );


      const user =
        res.data.user;


      console.log(
        "LOGIN USER:",
        user
      );


      console.log(
        "LOGIN ROLE:",
        user.role
      );


      // =================================================
      // CUSTOMER LOGIN PROTECTION
      // =================================================

      if (
        role === "customer" &&
        user.role !== "customer" &&
        user.role !== "admin"
      ) {

        alert(
          "This account is registered as a worker. Please use Worker Login."
        );

        return;
      }


      // =================================================
      // WORKER LOGIN PROTECTION
      // =================================================

      if (
        role === "worker" &&
        user.role !== "worker" &&
        user.role !== "admin"
      ) {

        alert(
          "This account is registered as a customer. Please use Customer Login."
        );

        return;
      }


      // =================================================
      // SAVE USER
      // =================================================

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );


      localStorage.setItem(
        "token",
        res.data.token
      );


      // =================================================
      // ADMIN
      // =================================================

      if (user.role === "admin") {

        navigate(
          "/admin-dashboard"
        );

        return;
      }


      // =================================================
      // WORKER
      // =================================================

      if (user.role === "worker") {

        navigate(
          "/worker-dashboard"
        );

        return;
      }


      // =================================================
      // CUSTOMER
      // =================================================

      if (user.role === "customer") {

        navigate(
          "/customer-dashboard"
        );

        return;
      }

    }

    catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Login failed. Please check your credentials."
      );

    }

    finally {

      setLoading(false);

    }

  };


  // =====================================================
  // HOME
  // =====================================================

  const goHome = () => {

    navigate("/");

  };


  // =====================================================
  // REGISTER
  // =====================================================

  const goToRegister = () => {

    if (role === "worker") {

      navigate(
        "/worker-register"
      );

    } else {

      navigate(
        "/register"
      );

    }

  };


  // =====================================================
  // CHANGE ROLE
  // =====================================================

  const changeRole = (newRole) => {

    if (isLocked) {
      return;
    }

    setRole(newRole);

  };


  return (

    <div
      className="
        min-h-screen
        bg-slate-50
        flex
        items-center
        justify-center
        px-4
        py-8
      "
    >

      <div
        className="
          w-full
          max-w-6xl
          bg-white
          rounded-3xl
          overflow-hidden
          shadow-xl
          border
          border-slate-200
          grid
          lg:grid-cols-2
        "
      >


        {/* =================================================
            LEFT INFORMATION PANEL
        ================================================= */}

        <div
          className={`
            hidden
            lg:flex
            flex-col
            justify-between
            p-12
            bg-gradient-to-br
            ${theme.leftGradient}
          `}
        >

          <div>

            {/* BRAND */}

            <div
              className="
                flex
                items-center
                gap-4
                mb-14
              "
            >

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-white
                  shadow-sm
                  border
                  border-slate-200
                  flex
                  items-center
                  justify-center
                  text-3xl
                "
              >
                🏠
              </div>


              <div>

                <h1
                  className="
                    text-2xl
                    font-bold
                    text-slate-900
                  "
                >
                  WorkHub
                </h1>

                <p
                  className="
                    text-sm
                    text-slate-500
                  "
                >
                  Smart Service Platform
                </p>

              </div>

            </div>


            {/* BADGE */}

            <div
              className={`
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-full
                ${theme.soft}
                ${theme.accent}
                border
                ${theme.border}
                font-semibold
                text-sm
                mb-8
              `}
            >

              <span>
                🔐
              </span>

              Secure Access

            </div>


            {/* TITLE */}

            <h2
              className="
                text-5xl
                font-bold
                leading-tight
                text-slate-900
              "
            >

              One platform.

              <br />

              <span
                className={theme.accent}
              >
                Two ways to work.
              </span>

            </h2>


            <p
              className="
                mt-6
                text-lg
                leading-8
                text-slate-600
                max-w-lg
              "
            >

              Connect customers with trusted
              professionals and manage service
              work through one simple platform.

            </p>


            {/* FEATURES */}

            <div
              className="
                mt-12
                space-y-6
              "
            >

              {theme.features.map(
                (feature, index) => (

                  <div
                    key={index}
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >

                    <div
                      className={`
                        w-12
                        h-12
                        rounded-xl
                        ${theme.soft}
                        flex
                        items-center
                        justify-center
                        text-xl
                      `}
                    >
                      {feature[0]}
                    </div>


                    <div>

                      <h3
                        className="
                          font-bold
                          text-slate-900
                        "
                      >
                        {feature[1]}
                      </h3>

                      <p
                        className="
                          text-sm
                          text-slate-500
                        "
                      >
                        {feature[2]}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>


          {/* FOOTER */}

          <p
            className="
              text-sm
              text-slate-400
              mt-10
            "
          >
            © 2026 WorkHub Platform
          </p>

        </div>


        {/* =================================================
            RIGHT LOGIN PANEL
        ================================================= */}

        <div
          className="
            p-8
            sm:p-12
            lg:p-14
          "
        >


          {/* TOP NAVIGATION */}

          <div
            className="
              flex
              items-center
              justify-between
              mb-10
            "
          >

            <button
              type="button"
              onClick={goHome}
              className="
                text-slate-500
                hover:text-slate-900
                font-medium
              "
            >
              ← Home
            </button>


            <button
              type="button"
              onClick={goToRegister}
              className={`
                font-semibold
                ${theme.accent}
                hover:underline
              `}
            >
              Create account
            </button>

          </div>


          {/* ICON */}

          <div
            className={`
              w-16
              h-16
              rounded-2xl
              ${theme.soft}
              flex
              items-center
              justify-center
              text-3xl
              mb-7
            `}
          >
            {theme.icon}
          </div>


          {/* HEADING */}

          <p
            className={`
              text-sm
              font-bold
              tracking-widest
              ${theme.accent}
              mb-3
            `}
          >
            {theme.badge}
          </p>


          <h2
            className="
              text-4xl
              font-bold
              text-slate-900
            "
          >
            Welcome back
          </h2>


          <p
            className="
              mt-3
              text-slate-500
              text-lg
            "
          >
            {theme.description}
          </p>


          {/* =================================================
              ROLE SELECTOR
          ================================================= */}

          {!isLocked && (

            <div
              className="
                grid
                grid-cols-2
                gap-4
                mt-8
                mb-8
              "
            >

              {/* CUSTOMER */}

              <button
                type="button"
                onClick={() =>
                  changeRole("customer")
                }
                className={`
                  text-left
                  p-5
                  rounded-2xl
                  border-2
                  transition
                  ${
                    role === "customer"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-300"
                  }
                `}
              >

                <div
                  className="
                    text-2xl
                    mb-3
                  "
                >
                  👤
                </div>

                <div
                  className="
                    font-bold
                    text-slate-900
                  "
                >
                  Customer
                </div>

                <div
                  className="
                    text-sm
                    text-slate-500
                    mt-1
                  "
                >
                  Hire a worker
                </div>

              </button>


              {/* WORKER */}

              <button
                type="button"
                onClick={() =>
                  changeRole("worker")
                }
                className={`
                  text-left
                  p-5
                  rounded-2xl
                  border-2
                  transition
                  ${
                    role === "worker"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-emerald-300"
                  }
                `}
              >

                <div
                  className="
                    text-2xl
                    mb-3
                  "
                >
                  👷
                </div>

                <div
                  className="
                    font-bold
                    text-slate-900
                  "
                >
                  Worker
                </div>

                <div
                  className="
                    text-sm
                    text-slate-500
                    mt-1
                  "
                >
                  Manage your jobs
                </div>

              </button>

            </div>

          )}


          {/* LOCKED ROLE MESSAGE */}

          {isLocked && (

            <div
              className={`
                mt-8
                mb-8
                px-4
                py-3
                rounded-xl
                ${theme.soft}
                ${theme.accent}
                border
                ${theme.border}
                text-sm
                font-medium
              `}
            >

              {isCustomer
                ? "Customer login selected"
                : "Worker login selected"
              }

            </div>

          )}


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            onSubmit={loginUser}
            className="space-y-6"
          >

            {/* EMAIL */}

            <div>

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                "
              >
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                className="
                  w-full
                  px-4
                  py-4
                  rounded-xl
                  bg-slate-50
                  border
                  border-slate-200
                  outline-none
                  focus:border-blue-400
                  focus:ring-4
                  focus:ring-blue-100
                "
              />

            </div>


            {/* PASSWORD */}

            <div>

              <div
                className="
                  flex
                  justify-between
                  items-center
                  mb-2
                "
              >

                <label
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Password
                </label>


                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className={`
                    text-sm
                    font-medium
                    ${theme.accent}
                  `}
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>


              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                className="
                  w-full
                  px-4
                  py-4
                  rounded-xl
                  bg-slate-50
                  border
                  border-slate-200
                  outline-none
                  focus:border-blue-400
                  focus:ring-4
                  focus:ring-blue-100
                "
              />

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full
                py-4
                rounded-xl
                text-white
                font-bold
                text-lg
                shadow-lg
                transition
                ${theme.button}
                ${
                  loading
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }
              `}
            >

              {loading
                ? "Signing in..."
                : `Sign In as ${
                    isCustomer
                      ? "Customer"
                      : "Worker"
                  } →`
              }

            </button>

          </form>


          {/* REGISTER */}

          <div
            className="
              mt-8
              p-5
              rounded-2xl
              bg-slate-50
              border
              border-slate-200
              text-center
            "
          >

            <p
              className="
                text-slate-500
                text-sm
              "
            >
              {isCustomer
                ? "Need a customer account?"
                : "Don't have a worker account?"
              }
            </p>


            <button
              type="button"
              onClick={goToRegister}
              className={`
                mt-2
                font-bold
                ${theme.accent}
                hover:underline
              `}
            >
              Create your account →
            </button>

          </div>


          {/* SECURITY */}

          <div
            className="
              flex
              items-center
              justify-center
              gap-2
              mt-6
              text-sm
              text-slate-400
            "
          >

            🔒

            Secure login

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;