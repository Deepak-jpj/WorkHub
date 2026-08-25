import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);


  // =====================================================
  // BACK
  // =====================================================

  const goBack = () => {
    navigate(-1);
  };


  // =====================================================
  // CUSTOMER REGISTER
  // =====================================================

  const registerCustomer = async () => {

    if (
      !name ||
      !email ||
      !phone ||
      !password
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {

      setLoading(true);

      const res = await API.post(
        "/auth/register",
        {
          name,
          email,
          phone,
          password,
          role: "customer"
        }
      );

      alert(
        res.data.message ||
        "Customer registered successfully."
      );

      navigate("/customer-login");

    } catch (error) {

      console.error(
        "CUSTOMER REGISTER ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Registration failed."
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="min-h-screen bg-gray-100">

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

        {/* WORKHUB
            NOT CLICKABLE
        */}

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


        {/* MENU */}

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
            onClick={() => navigate("/")}
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

        </div>

      </nav>


      {/* =================================================
          REGISTRATION
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

          <h2
            className="
              text-2xl
              font-bold
              mb-7
              text-center
            "
          >
            Customer Registration
          </h2>


          {/* NAME */}

          <input
            type="text"
            placeholder="Name"
            className="
              border
              p-3
              w-full
              mb-3
              rounded
            "
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />


          {/* EMAIL */}

          <input
            type="email"
            placeholder="Email"
            className="
              border
              p-3
              w-full
              mb-3
              rounded
            "
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />


          {/* PHONE */}

          <input
            type="tel"
            placeholder="Phone Number"
            className="
              border
              p-3
              w-full
              mb-3
              rounded
            "
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />


          {/* PASSWORD */}

          <input
            type="password"
            placeholder="Password"
            className="
              border
              p-3
              w-full
              mb-4
              rounded
            "
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />


          {/* CUSTOMER */}

          <button
            type="button"
            disabled={loading}
            onClick={registerCustomer}
            className="
              bg-green-600
              text-white
              w-full
              py-3
              rounded
              hover:bg-green-700
              transition
              font-medium
              mb-3
            "
          >
            {loading
              ? "Registering..."
              : "Register as Customer"}
          </button>


          {/* WORKER */}



        </div>

      </div>

    </div>
  );
}

export default Register;