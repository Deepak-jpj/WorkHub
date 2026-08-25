import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function WorkerRegister() {

  const navigate = useNavigate();

  // =====================================================
  // WORKER DETAILS
  // =====================================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skill, setSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [password, setPassword] = useState("");

  // =====================================================
  // WORKER LOCATION
  // =====================================================

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // =====================================================
  // OTP
  // =====================================================

  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [phoneVerified, setPhoneVerified] = useState(false);

  const [otpVerificationToken, setOtpVerificationToken] =
    useState("");

  const [loading, setLoading] = useState(false);


  // =====================================================
  // GET CURRENT LOCATION
  // =====================================================

 // =====================================================
// GET CURRENT LOCATION
// =====================================================

const getCurrentLocation = () => {

  if (!navigator.geolocation) {
    alert("Location is not supported by this browser.");
    return;
  }

  setLocationLoading(true);

  navigator.geolocation.getCurrentPosition(

    (position) => {

      setLat(position.coords.latitude);
      setLng(position.coords.longitude);

      setLocation(
        "Current GPS Location"
      );

      setLocationLoading(false);

      alert("📍 Current location detected successfully.");

    },

    (error) => {

      console.error("LOCATION ERROR:", error);

      setLocationLoading(false);

      alert(
        "Unable to get your location. Please allow location permission or use PIN Code."
      );

    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

  );
};


// =====================================================
// FIND LOCATION USING PIN CODE
// =====================================================

const findByPincode = async () => {

  const pin = pincode.trim();

  if (!/^[1-9][0-9]{5}$/.test(pin)) {

    alert("Please enter a valid 6-digit Indian PIN Code.");

    return;

  }

  try {

    setLocationLoading(true);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${pin}&country=India&format=json&limit=1`
    );

    const data = await response.json();

    if (!data || data.length === 0) {

      alert(
        "Location not found for this PIN Code."
      );

      return;

    }

    const latitude =
      Number(data[0].lat);

    const longitude =
      Number(data[0].lon);

    setLat(latitude);
    setLng(longitude);

    setLocation(
      `PIN Code ${pin}`
    );

    alert(
      "📍 PIN Code location found successfully."
    );

  }

  catch (error) {

    console.error(
      "PIN CODE LOCATION ERROR:",
      error
    );

    alert(
      "Unable to find this PIN Code location."
    );

  }

  finally {

    setLocationLoading(false);

  }

};


  // =====================================================
  // PHONE NUMBER CHANGE
  // =====================================================

  const handlePhoneChange = (e) => {

    const newPhone =
      e.target.value;


    setPhone(newPhone);


    // If phone changes after OTP verification,
    // previous verification is no longer valid.

    setOtpSent(false);

    setPhoneVerified(false);

    setOtp("");

    setOtpVerificationToken("");

  };


  // =====================================================
  // SEND OTP
  // =====================================================

  const sendOtp = async () => {

    if (!phone.trim()) {

      alert(
        "Please enter your phone number."
      );

      return;

    }


    // Basic Indian mobile validation

    const cleanPhone =
      phone
        .replace(/\s/g, "")
        .replace(/-/g, "");


    if (
      !/^(?:\+91|91)?[6-9]\d{9}$/.test(
        cleanPhone
      )
    ) {

      alert(
        "Please enter a valid Indian mobile number."
      );

      return;

    }


    try {

      setLoading(true);


      const response =
        await API.post(

          "/auth/send-otp",

          {
            phone
          }

        );


      console.log(
        "SEND OTP RESPONSE:",
        response.data
      );


      setOtpSent(true);

      setPhoneVerified(false);

      setOtp("");

      setOtpVerificationToken("");


      alert(

        response.data.message ||

        "OTP generated successfully."

      );

    }


    catch (error) {

      console.error(
        "SEND OTP ERROR:",
        error
      );


      alert(

        error.response?.data?.message ||

        "Unable to generate OTP."

      );

    }


    finally {

      setLoading(false);

    }

  };


  // =====================================================
  // VERIFY OTP
  // =====================================================

  const verifyOtp = async () => {

    if (!otp.trim()) {

      alert(
        "Please enter the OTP."
      );

      return;

    }


    if (otp.length !== 6) {

      alert(
        "OTP must contain 6 digits."
      );

      return;

    }


    try {

      setLoading(true);


      const response =
        await API.post(

          "/auth/verify-otp",

          {

            phone,

            otp

          }

        );


      console.log(
        "VERIFY OTP RESPONSE:",
        response.data
      );


      if (
        response.data.verified === true &&
        response.data.otpVerificationToken
      ) {

        setPhoneVerified(true);


        setOtpVerificationToken(

          response.data.otpVerificationToken

        );


        alert(
          "Phone number verified successfully! ✅"
        );

      }

      else {

        setPhoneVerified(false);

        setOtpVerificationToken("");

        alert(
          "Invalid OTP."
        );

      }

    }


    catch (error) {

      console.error(
        "VERIFY OTP ERROR:",
        error
      );


      setPhoneVerified(false);

      setOtpVerificationToken("");


      alert(

        error.response?.data?.message ||

        "Invalid or expired OTP."

      );

    }


    finally {

      setLoading(false);

    }

  };


  // =====================================================
  // REGISTER WORKER
  // =====================================================

  const registerWorker = async () => {

    // ---------------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------------

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !skill ||
      !password
    ) {

      alert(
        "Please fill Name, Email, Phone, Skill and Password."
      );

      return;

    }


    // ---------------------------------------------------
    // OTP VERIFICATION
    // ---------------------------------------------------

    if (
      !phoneVerified ||
      !otpVerificationToken
    ) {

      alert(
        "Please verify your phone number with OTP first."
      );

      return;

    }


    // ---------------------------------------------------
    // LOCATION
    // ---------------------------------------------------

    if (!lat || !lng) {

      alert(
         "Please select your location using GPS or PIN Code before registering."
      );

      return;

    }


    try {

      setLoading(true);


      // -------------------------------------------------
      // SEND WORKER DATA TO BACKEND
      // -------------------------------------------------

      const response =
        await API.post(

          "/auth/register",

          {

            name:
              name.trim(),

            email:
              email.trim(),

            phone:
              phone.trim(),

            password,

            role:
              "worker",

            // Worker skill

            skills: [

              skill
                .toLowerCase()
                .trim()

            ],

            // Experience

            experience:
              Number(experience) || 0,

            // Work description

            description:
              description.trim(),

            // City

            locationCity:
              location.trim(),

            // GPS coordinates

            lat:
              Number(lat),

            lng:
              Number(lng),

            // OTP verification token

            otpVerificationToken

          }

        );


      console.log(
        "WORKER REGISTRATION RESPONSE:",
        response.data
      );


      alert(
        "Worker Registered Successfully! 🎉"
      );


      navigate(
        "/worker-login"
      );

    }


    catch (error) {

      console.error(
        "WORKER REGISTRATION ERROR:",
        error
      );


      alert(

        error.response?.data?.message ||

        "Registration Failed."

      );

    }


    finally {

      setLoading(false);

    }

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="
      min-h-screen
      flex
      justify-center
      items-center
      bg-gray-100
      py-8
    ">


      <div className="
        bg-white
        p-8
        rounded
        shadow
        w-96
      ">


        {/* =================================================
            TITLE
        ================================================= */}

        <h2 className="
          text-2xl
          font-bold
          mb-6
          text-center
        ">

          Worker Registration

        </h2>


        {/* =================================================
            NAME
        ================================================= */}

        <input
          type="text"
          placeholder="Name"
          className="
            border
            p-2
            w-full
            mb-3
          "
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />


        {/* =================================================
            EMAIL
        ================================================= */}

        <input
          type="email"
          placeholder="Email"
          className="
            border
            p-2
            w-full
            mb-3
          "
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />


        {/* =================================================
            PHONE + SEND OTP
        ================================================= */}

        <div className="
          flex
          gap-2
          mb-3
        ">

          <input
            type="tel"
            placeholder="Phone Number"
            disabled={phoneVerified}
            className="
              border
              p-2
              flex-1
              disabled:bg-gray-100
            "
            value={phone}
            onChange={handlePhoneChange}
          />


          {!phoneVerified && (

            <button
              onClick={sendOtp}
              disabled={loading}
              className="
                bg-blue-600
                text-white
                px-3
                rounded
                hover:bg-blue-700
                disabled:bg-gray-400
              "
            >

              {loading
                ? "..."
                : "Send OTP"}

            </button>

          )}

        </div>


        {/* =================================================
            OTP INPUT
        ================================================= */}

        {otpSent && !phoneVerified && (

          <div className="mb-4">

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="
                border
                p-2
                w-full
                mb-2
              "
              value={otp}
              onChange={(e) => {

                setOtp(

                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)

                );

              }}
            />


            <button
              onClick={verifyOtp}
              disabled={loading}
              className="
                bg-purple-600
                text-white
                w-full
                py-2
                rounded
                hover:bg-purple-700
                disabled:bg-gray-400
              "
            >

              {loading
                ? "Verifying..."
                : "Verify OTP"}

            </button>


            <p className="
              text-xs
              text-gray-500
              text-center
              mt-2
            ">

              💻 Demo OTP is displayed
              in the backend terminal.

            </p>

          </div>

        )}


        {/* =================================================
            VERIFIED
        ================================================= */}

        {phoneVerified && (

          <div className="
            bg-green-100
            text-green-700
            border
            border-green-300
            p-2
            rounded
            mb-4
            text-center
          ">

            ✅ Phone Number Verified

          </div>

        )}


        {/* =================================================
            SKILL
        ================================================= */}

        <select
          className="
            border
            p-2
            w-full
            mb-3
          "
          value={skill}
          onChange={(e) =>
            setSkill(e.target.value)
          }
        >

          <option value="">
            Select Skill
          </option>

          <option value="electrician">
            Electrician
          </option>

          <option value="carpenter">
            Carpenter
          </option>

          <option value="plumber">
            Plumber
          </option>

          <option value="staff">
            Staff
          </option>

          <option value="technician">
            Technician
          </option>

          <option value="painter">
            Painter
          </option>

          <option value="driver">
            Driver
          </option>

          <option value="security guard">
            Security Guard
          </option>

          <option value="cleaning">
            Cleaner
          </option>

          <option value="mechanic">
            Mechanic
          </option>

          <option value="other">
            Other
          </option>

        </select>


        {/* =================================================
            EXPERIENCE
        ================================================= */}

        <input
          type="number"
          min="0"
          placeholder="Experience (Years)"
          className="
            border
            p-2
            w-full
            mb-3
          "
          value={experience}
          onChange={(e) =>
            setExperience(e.target.value)
          }
        />


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <textarea
          placeholder="Describe your work"
          className="
            border
            p-2
            w-full
            mb-3
          "
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />


        {/* =================================================
    WORKER LOCATION
================================================= */}

<div className="mb-4">

  <h3 className="font-bold mb-2">
    📍 Worker Location
  </h3>

  {/* City */}

  <input
    type="text"
    placeholder="Location (City)"
    className="border p-2 w-full mb-2"
    value={location}
    onChange={(e) =>
      setLocation(e.target.value)
    }
  />

  {/* CURRENT LOCATION */}

  <button
    type="button"
    onClick={getCurrentLocation}
    disabled={locationLoading}
    className="
      bg-green-600
      text-white
      w-full
      py-2
      rounded
      mb-2
      hover:bg-green-700
      disabled:bg-gray-400
    "
  >

    {locationLoading
      ? "Getting Location..."
      : "📍 Use Current Location"}

  </button>

  {/* PIN CODE */}

  <div className="flex gap-2">

    <input
      type="text"
      maxLength={6}
      placeholder="Enter 6-digit PIN Code"
      className="border p-2 flex-1"
      value={pincode}
      onChange={(e) =>
        setPincode(
          e.target.value
            .replace(/\D/g, "")
            .slice(0, 6)
        )
      }
    />

    <button
      type="button"
      onClick={findByPincode}
      disabled={locationLoading}
      className="
        bg-blue-600
        text-white
        px-3
        rounded
        hover:bg-blue-700
        disabled:bg-gray-400
      "
    >

      Find

    </button>

  </div>

</div>


        {/* =================================================
            LOCATION STATUS
        ================================================= */}

        {lat && lng ? (

  <div className="
    bg-green-50
    text-green-700
    border
    border-green-200
    p-2
    rounded
    mb-3
    text-sm
  ">

    ✅ Location selected

    <br />

    Latitude: {Number(lat).toFixed(6)}

    <br />

    Longitude: {Number(lng).toFixed(6)}

  </div>

) : (

  <div className="
    bg-yellow-50
    text-yellow-700
    border
    border-yellow-200
    p-2
    rounded
    mb-3
    text-sm
  ">

    ⚠️ Please use Current Location or enter your PIN Code.

  </div>

)}


        {/* =================================================
            PASSWORD
        ================================================= */}

        <input
          type="password"
          placeholder="Password"
          className="
            border
            p-2
            w-full
            mb-4
          "
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />


        {/* =================================================
            REGISTER BUTTON
        ================================================= */}

        <button
          onClick={registerWorker}
          disabled={
            loading ||
            !phoneVerified
          }
          className="
            bg-blue-600
            text-white
            w-full
            py-2
            rounded
            hover:bg-blue-700
            disabled:bg-gray-400
            disabled:cursor-not-allowed
          "
        >

          {loading
            ? "Registering..."
            : "Register"}

        </button>


        {/* =================================================
            INFORMATION
        ================================================= */}

        {!phoneVerified && (

          <p className="
            text-xs
            text-gray-500
            text-center
            mt-4
          ">

            📱 Phone verification is required
            before worker registration.

          </p>

        )}

      </div>

    </div>

  );

}

export default WorkerRegister;