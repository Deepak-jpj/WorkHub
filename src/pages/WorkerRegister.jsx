import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function WorkerRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skill: "",
    experience: "",
    description: "",
    location: "",
    pincode: "",
    password: "",
  });

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setForm((prev) => ({
        ...prev,
        phone: value.replace(/\D/g, "").slice(0, 10),
      }));
      return;
    }

    if (name === "pincode") {
      setForm((prev) => ({
        ...prev,
        pincode: value.replace(/\D/g, "").slice(0, 6),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // CURRENT GPS LOCATION
  // =====================================================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Location is not supported by this browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLat(latitude);
        setLng(longitude);

        setForm((prev) => ({
          ...prev,
          location: prev.location || "Current GPS Location",
        }));

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
        maximumAge: 0,
      }
    );
  };

  // =====================================================
  // FIND LOCATION USING PIN CODE
  // =====================================================

  const findByPincode = async () => {
    const pin = form.pincode.trim();

    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      alert("Please enter a valid 6-digit Indian PIN Code.");
      return;
    }

    try {
      setLocationLoading(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pin}&country=India&format=json&limit=1`
      );

      if (!response.ok) {
        throw new Error("Location service failed.");
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        alert("Location not found for this PIN Code.");
        return;
      }

      const latitude = Number(data[0].lat);
      const longitude = Number(data[0].lon);

      setLat(latitude);
      setLng(longitude);

      setForm((prev) => ({
        ...prev,
        location: `PIN Code ${pin}`,
      }));

      alert("📍 PIN Code location found successfully.");
    } catch (error) {
      console.error("PIN CODE ERROR:", error);
      alert("Unable to find this PIN Code location.");
    } finally {
      setLocationLoading(false);
    }
  };

  // =====================================================
  // REGISTER WORKER
  // =====================================================

  const registerWorker = async (e) => {
    e.preventDefault();

    const {
      name,
      email,
      phone,
      skill,
      experience,
      description,
      location,
      password,
    } = form;

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !skill.trim() ||
      !password.trim()
    ) {
      alert(
        "Please fill Name, Email, Phone, Skill and Password."
      );
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(phone.trim())) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!lat || !lng) {
      alert(
        "Please select your location using Current Location or PIN Code."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim(),

        role: "worker",

        skills: [skill.trim().toLowerCase()],

        experience: Number(experience) || 0,

        description: description.trim(),

        locationCity: location.trim(),

        lat: Number(lat),
        lng: Number(lng),
      });

      console.log(
        "WORKER REGISTRATION RESPONSE:",
        response.data
      );

      alert("🎉 Worker account created successfully!");

      navigate("/worker-login");
    } catch (error) {
      console.error(
        "WORKER REGISTRATION ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-bold text-xl text-slate-900"
          >
            Work<span className="text-blue-600">Hub</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              ← Home
            </button>

            <button
              type="button"
              onClick={() => navigate("/worker-login")}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              Worker Login
            </button>
          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-5 py-10">

        <div className="grid lg:grid-cols-3 gap-8">

          {/* =================================================
              FORM
          ================================================= */}

          <section className="lg:col-span-2">

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">

              <div className="mb-8">

                <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                  WORKER REGISTRATION
                </span>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">
                  Create your worker profile
                </h1>

                <p className="text-slate-500 mt-2">
                  Add your professional details so customers can
                  find and hire you.
                </p>

              </div>

              <form onSubmit={registerWorker} className="space-y-6">

                {/* BASIC DETAILS */}

                <div>

                  <h2 className="font-bold text-lg text-slate-900 mb-4">
                    👤 Personal Details
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">

                    <input
                      name="name"
                      placeholder="Full Name"
                      className={inputClass}
                      value={form.name}
                      onChange={handleChange}
                    />

                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      className={inputClass}
                      value={form.email}
                      onChange={handleChange}
                    />

                    <input
                      name="phone"
                      type="tel"
                      placeholder="Mobile Number"
                      className={inputClass}
                      value={form.phone}
                      onChange={handleChange}
                      maxLength={10}
                    />

                    <input
                      name="password"
                      type="password"
                      placeholder="Create Password"
                      className={inputClass}
                      value={form.password}
                      onChange={handleChange}
                    />

                  </div>

                </div>

                {/* PROFESSIONAL DETAILS */}

                <div>

                  <h2 className="font-bold text-lg text-slate-900 mb-4">
                    🛠️ Professional Details
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">

                    <select
                      name="skill"
                      className={inputClass}
                      value={form.skill}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select Primary Skill
                      </option>
                      <option value="electrician">
                        Electrician
                      </option>
                      <option value="plumber">
                        Plumber
                      </option>
                      <option value="carpenter">
                        Carpenter
                      </option>
                      <option value="painter">
                        Painter
                      </option>
                      <option value="mechanic">
                        Mechanic
                      </option>
                      <option value="cleaner">
                        Cleaner
                      </option>
                      <option value="construction">
                        Construction Worker
                      </option>
                      <option value="driver">
                        Driver
                      </option>
                      <option value="general worker">
                        General Worker
                      </option>
                    </select>

                    <input
                      name="experience"
                      type="number"
                      min="0"
                      placeholder="Experience (Years)"
                      className={inputClass}
                      value={form.experience}
                      onChange={handleChange}
                    />

                  </div>

                  <textarea
                    name="description"
                    rows="4"
                    placeholder="Describe your experience, services and expertise..."
                    className={`${inputClass} mt-4 resize-none`}
                    value={form.description}
                    onChange={handleChange}
                  />

                </div>

                {/* LOCATION */}

                <div>

                  <h2 className="font-bold text-lg text-slate-900 mb-4">
                    📍 Work Location
                  </h2>

                  <input
                    name="location"
                    placeholder="City / Area"
                    className={inputClass}
                    value={form.location}
                    onChange={handleChange}
                  />

                  <div className="grid md:grid-cols-2 gap-3 mt-4">

                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="py-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 disabled:opacity-50"
                    >
                      {locationLoading
                        ? "Detecting..."
                        : "📍 Use Current Location"}
                    </button>

                    <div className="flex gap-2">

                      <input
                        name="pincode"
                        placeholder="6-digit PIN Code"
                        className={inputClass}
                        value={form.pincode}
                        onChange={handleChange}
                        maxLength={6}
                      />

                      <button
                        type="button"
                        onClick={findByPincode}
                        disabled={locationLoading}
                        className="px-5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
                      >
                        Find
                      </button>

                    </div>

                  </div>

                  {lat && lng ? (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                      <p className="font-semibold">
                        ✅ Location selected
                      </p>
                      <p className="mt-1">
                        Latitude: {Number(lat).toFixed(6)}
                      </p>
                      <p>
                        Longitude: {Number(lng).toFixed(6)}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                      ⚠️ Please select your work location before registering.
                    </div>
                  )}

                </div>

                {/* REGISTER */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold text-lg shadow-lg transition"
                >
                  {loading
                    ? "Creating Account..."
                    : "🚀 Create Worker Account"}
                </button>

              </form>

            </div>

          </section>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="space-y-5">

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
                👷
              </div>

              <h2 className="text-xl font-bold text-slate-900 mt-4">
                Why join WorkHub?
              </h2>

              <p className="text-sm text-slate-500 mt-2 leading-6">
                Build your profile and connect with customers
                looking for workers in your area.
              </p>

              <div className="space-y-5 mt-6">

                <div className="flex gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold">
                      Professional Profile
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Showcase your skills and experience.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                    📍
                  </span>
                  <div>
                    <p className="font-semibold">
                      Nearby Opportunities
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Help customers discover workers nearby.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                    🤖
                  </span>
                  <div>
                    <p className="font-semibold">
                      Smart Matching
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Your skills can be matched with suitable jobs.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    ⭐
                  </span>
                  <div>
                    <p className="font-semibold">
                      Build Your Reputation
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Complete jobs and grow your profile.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white">

              <p className="text-sm text-slate-300">
                Already have an account?
              </p>

              <h3 className="text-xl font-bold mt-1">
                Welcome back!
              </h3>

              <button
                type="button"
                onClick={() => navigate("/worker-login")}
                className="w-full mt-5 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100"
              >
                Go to Worker Login →
              </button>

            </div>

          </aside>

        </div>

        <footer className="text-center py-8">

          <p className="text-xs text-slate-400">
            WorkHub • AI-powered worker matching and scheduling
          </p>

        </footer>

      </main>
    </div>
  );
}

export default WorkerRegister;