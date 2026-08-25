import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {

  const navigate = useNavigate();
  const location = useLocation();

  const isCustomerLogin =
    location.pathname === "/customer-login";

  const isWorkerLogin =
    location.pathname === "/worker-login";


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  // =====================================================
  // LOGIN
  // =====================================================

  const loginUser = async (e) => {

    if (e) {
      e.preventDefault();
    }

    try {

      const res =
        await API.post(
          "/auth/login",
          {
            email,
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
      // CUSTOMER LOGIN
      // =================================================

      if (
        isCustomerLogin &&
        user.role !== "customer" &&
        user.role !== "admin"
      ) {

        alert(
          "This account is not allowed to use Customer Login."
        );

        return;
      }


      // =================================================
      // WORKER LOGIN
      // =================================================

      if (
        isWorkerLogin &&
        user.role !== "worker" &&
        user.role !== "admin"
      ) {

        alert(
          "This account is not allowed to use Worker Login."
        );

        return;
      }


      // =================================================
      // SAVE LOGIN
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
      // REDIRECT
      // =================================================

      if (user.role === "admin") {

        navigate(
          isWorkerLogin
            ? "/worker-dashboard"
            : "/customer-dashboard"
        );

      }

      else if (user.role === "worker") {

        navigate(
          "/worker-dashboard"
        );

      }

      else if (user.role === "customer") {

        navigate(
          "/customer-dashboard"
        );

      }


    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Login Failed"
      );

    }

  };


  // =====================================================
  // BACK
  // =====================================================

  const goBack = () => {

    navigate(-1);

  };


  // =====================================================
  // REGISTER PAGE
  // IMPORTANT:
  //
  // Customer Login  -> Customer Registration
  // Worker Login    -> Worker Registration
  // =====================================================

  const goToRegister = () => {

    if (isWorkerLogin) {

      navigate(
        "/worker-register"
      );

    } else {

      navigate(
        "/register"
      );

    }

  };


  return (

    <div
      className="
        min-h-screen
        bg-gray-100
      "
    >


      {/* =================================================
          HEADER
      ================================================= */}

      <nav
        className="
          bg-white
          shadow
          px-8
          py-4
          flex
          items-center
          justify-between
        "
      >


        {/* =================================================
            WORKHUB
            NOT CLICKABLE
        ================================================= */}

        <div
          className="
            text-2xl
            font-bold
            text-blue-600
            select-none
          "
        >
          WorkHub
        </div>


        {/* =================================================
            MENU
        ================================================= */}

        <div
          className="
            flex
            items-center
            gap-8
          "
        >


          {/* HOME PAGE */}

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="
              text-gray-700
              hover:text-blue-600
              font-medium
              bg-transparent
              border-none
              cursor-pointer
            "
          >
            Home Page
          </button>


          {/* BACK */}

          <button
            type="button"
            onClick={goBack}
            className="
              text-gray-700
              hover:text-blue-600
              font-medium
              bg-transparent
              border-none
              cursor-pointer
            "
          >
            Back
          </button>


          {/* REGISTER */}

          <button
            type="button"
            onClick={goToRegister}
            className="
              bg-blue-600
              text-white
              px-5
              py-2
              rounded
              hover:bg-blue-700
              transition
              cursor-pointer
            "
          >
            Register
          </button>


        </div>

      </nav>


      {/* =================================================
          LOGIN AREA
      ================================================= */}

      <div
        className="
          min-h-[calc(100vh-73px)]
          flex
          items-center
          justify-center
          px-4
        "
      >


        <div
          className="
            bg-white
            p-9
            rounded-lg
            shadow-lg
            w-full
            max-w-md
          "
        >


          {/* =================================================
              TITLE
          ================================================= */}

          <h2
            className="
              text-2xl
              font-bold
              mb-7
              text-center
            "
          >

            {isCustomerLogin
              ? "Customer Login"
              : isWorkerLogin
                ? "Worker Login"
                : "Login"}

          </h2>


          {/* =================================================
              EMAIL
          ================================================= */}

          <input
            type="email"
            placeholder="Email"
            className="
              border
              p-3
              w-full
              mb-3
              rounded
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />


          {/* =================================================
              PASSWORD
          ================================================= */}

          <input
            type="password"
            placeholder="Password"
            className="
              border
              p-3
              w-full
              mb-4
              rounded
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={loginUser}
            className="
              bg-blue-600
              text-white
              w-full
              py-3
              rounded
              hover:bg-blue-700
              transition
              font-medium
            "
          >
            Login
          </button>


          {/* =================================================
              REGISTER LINK
          ================================================= */}

          <p
            className="
              text-center
              mt-5
              text-gray-700
            "
          >

            Don't have an account?

            <span
              onClick={goToRegister}
              className="
                text-blue-600
                cursor-pointer
                ml-2
                hover:underline
              "
            >
              Register
            </span>

          </p>


          {/* =================================================
              INFORMATION
          ================================================= */}

          <div
            className="
              mt-5
              text-center
              text-sm
              text-gray-500
            "
          >

            {isCustomerLogin && (

              <p>
                Customer accounts and Admin accounts
                can use this login.
              </p>

            )}


            {isWorkerLogin && (

              <p>
                Worker accounts and Admin accounts
                can use this login.
              </p>

            )}

          </div>


        </div>

      </div>

    </div>

  );

}


export default Login;