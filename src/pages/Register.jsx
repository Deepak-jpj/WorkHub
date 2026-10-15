import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
 const [form, setForm] = useState({
  name: "",
  email: "",
  phone: "",
  password: "",
});

const [otpSent, setOtpSent] = useState(false);
const [otp, setOtp] = useState("");
const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email.trim().toLowerCase(),
          phone: form.phone,
          password: form.password,
          role: "customer",
        }),
      }
    );

    const data = await response.json();

    console.log("Registration response:", data);

    if (!response.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    // Show the OTP verification form
    setOtpSent(true);

    alert(
      "Verification code sent to your email. Please check your inbox."
    );
  } catch (error) {
    console.error("Registration error:", error);

    alert(
      "Unable to connect to server. Make sure the backend is running."
    );
  } finally {
    setLoading(false);
  }
};

// VERIFY REGISTRATION OTP
const handleVerifyOTP = async (e) => {
  e.preventDefault();

  if (!/^\d{6}$/.test(otp)) {
    alert("Please enter a valid 6-digit OTP.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/verify-registration",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          otp: otp,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "OTP verification failed.");
      return;
    }

    alert("Email verified! Customer account created successfully.");

    navigate("/login?role=customer");
  } catch (error) {
    console.error("OTP verification error:", error);
    alert("Unable to connect to server. Please try again.");
  } finally {
    setLoading(false);
  }
};
// RESEND REGISTRATION OTP
const handleResendOTP = async () => {
  setLoading(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/resend-registration-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Unable to resend OTP.");
      return;
    }

    setOtp("");

    alert("A new verification code has been sent to your email.");
  } catch (error) {
    console.error("Resend OTP error:", error);
    alert("Unable to connect to server. Please try again.");
  } finally {
    setLoading(false);
  }
};


   return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.logoBox}>
          <div style={styles.logo}>🏠</div>
          <div>
            <div style={styles.brand}>WorkHub</div>
            <div style={styles.subtitle}>Customer Registration</div>
          </div>
        </div>

        <div style={styles.headerButtons}>
          <button
            type="button"
            style={styles.homeBtn}
            onClick={() => navigate("/")}
          >
            Home
          </button>

          <button
            type="button"
            style={styles.backBtn}
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main style={styles.main}>
        {/* LEFT INFORMATION PANEL */}
        <section style={styles.infoPanel}>
          <div style={styles.infoContent}>
            <div style={styles.badge}>👤 CUSTOMER PORTAL</div>

            <div style={styles.bigIcon}>👤</div>

            <h1 style={styles.infoTitle}>
              Get the right worker
              <br />
              for your job.
            </h1>

            <p style={styles.infoText}>
              Create your WorkHub account and connect with
              trusted skilled professionals near you.
            </p>

            <div style={styles.features}>
              <Feature
                icon="🔍"
                title="Find Skilled Workers"
                text="Discover professionals for your service needs."
              />

              <Feature
                icon="📍"
                title="Nearby Matching"
                text="Find workers based on your location."
              />

              <Feature
                icon="🛡️"
                title="Trusted Platform"
                text="Connect through a simple and secure platform."
              />
            </div>
          </div>
        </section>

        {/* REGISTER CARD */}
        <section style={styles.card}>
          <div style={styles.cardTop}>
            <div>
              <div style={styles.smallTitle}>
                {otpSent ? "EMAIL VERIFICATION" : "CUSTOMER ACCOUNT"}
              </div>

              <h2 style={styles.cardTitle}>
                {otpSent
                  ? "Verify your email"
                  : "Create your account"}
              </h2>

              <p style={styles.cardDescription}>
                {otpSent
                  ? "Enter the six-digit verification code sent to your email."
                  : "Join WorkHub and start finding trusted workers."}
              </p>
            </div>

            <div style={styles.userIcon}>
              {otpSent ? "✉️" : "👤"}
            </div>
          </div>

          {/* CUSTOMER REGISTRATION FORM */}
          {!otpSent ? (
            <form onSubmit={handleSubmit}>
              {/* NAME */}
              <div style={styles.field}>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* EMAIL */}
              <div style={styles.field}>
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* PHONE */}
              <div style={styles.field}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* PASSWORD */}
              <div style={styles.field}>
                <div style={styles.passwordLabel}>
                  <label>Password</label>

                  <button
                    type="button"
                    style={styles.showBtn}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div style={styles.passwordBox}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password (minimum 8 characters)"
                    value={form.password}
                    onChange={handleChange}
                    minLength={8}
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}"
                    title="Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
                    required
                  />
                </div>
              </div>

              {/* SECURITY INFO */}
              <div style={styles.security}>
                <span style={styles.securityIcon}>🔒</span>
                <div>
                  <strong>Secure registration</strong>
                  <p>
                    Your account information is kept protected.
                  </p>
                </div>
              </div>

              {/* REGISTER BUTTON */}
              <button
                type="submit"
                style={styles.registerBtn}
                disabled={loading}
              >
                {loading
                  ? "Sending verification code..."
                  : "Create Customer Account →"}
              </button>
            </form>
          ) : (
            /* OTP VERIFICATION FORM */
            <form onSubmit={handleVerifyOTP}>
              {/* REGISTERED EMAIL */}
              <div style={styles.field}>
                <label>Registered Email Address</label>

                <input
                  type="email"
                  value={form.email}
                  readOnly
                  style={{
                    backgroundColor: "#f3f4f6",
                    cursor: "not-allowed",
                  }}
                />
              </div>

              {/* OTP INPUT */}
              <div style={styles.field}>
                <label>Enter 6-Digit OTP</label>

                <input
                  type="text"
                  name="otp"
                  placeholder="Enter the code sent to your email"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </div>

              {/* VERIFICATION INFO */}
              <div style={styles.security}>
                <span style={styles.securityIcon}>✉️</span>

                <div>
                  <strong>Check your email</strong>
                  <p>
                    Enter the verification code to create your
                    customer account.
                  </p>
                </div>
              </div>

              {/* VERIFY BUTTON */}
              <button
                type="submit"
                style={styles.registerBtn}
                disabled={loading || otp.length !== 6}
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP & Create Account →"}
              </button>

              {/* RESEND OTP */}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                style={{
                  ...styles.registerBtn,
                  marginTop: "12px",
                  backgroundColor: "#ffffff",
                  color: "#2563eb",
                  border: "1px solid #2563eb",
                }}
              >
                Resend Verification Code
              </button>

              {/* BACK TO REGISTRATION */}
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                style={{
                  ...styles.registerBtn,
                  marginTop: "12px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                }}
              >
                ← Back to Registration
              </button>
            </form>
          )}

          {/* LOGIN */}
          {!otpSent && (
            <div style={styles.loginBox}>
              <span>Already have an account?</span>

              <button
                type="button"
                onClick={() => navigate("/login?role=customer")}
                style={styles.loginBtn}
              >
                Sign in as Customer →
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* FEATURE COMPONENT */
function Feature({ icon, title, text }) {
  return (
    <div style={styles.feature}>
      <div style={styles.featureIcon}>{icon}</div>

      <div>
        <div style={styles.featureTitle}>{title}</div>
        <div style={styles.featureText}>{text}</div>
      </div>
    </div>
  );
}
/* STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f4f9ff 0%, #eefcf8 100%)",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
    color: "#14213d",
  },

  header: {
    height: "76px",
    background: "rgba(255,255,255,0.96)",
    borderBottom: "1px solid #e4eaf2",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8%",
    boxSizing: "border-box",
  },

  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    width: "44px",
    height: "44px",
    borderRadius: "13px",
    background: "#e8f1ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  brand: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#17243b",
  },

  subtitle: {
    fontSize: "13px",
    color: "#718096",
    marginTop: "2px",
  },

  headerButtons: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  homeBtn: {
    border: "none",
    background: "transparent",
    color: "#40516d",
    fontSize: "15px",
    fontWeight: "600",
    padding: "10px 14px",
    cursor: "pointer",
  },

  backBtn: {
    border: "1px solid #d9e2ee",
    background: "#fff",
    color: "#40516d",
    borderRadius: "10px",
    padding: "10px 18px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  main: {
    width: "1100px",
    maxWidth: "92%",
    margin: "48px auto",
    display: "grid",
    gridTemplateColumns: "0.95fr 1.05fr",
    gap: "28px",
    alignItems: "stretch",
  },

  /* LEFT PANEL */

  infoPanel: {
    borderRadius: "26px",
    overflow: "hidden",
    background:
      "linear-gradient(145deg, #dff2ff 0%, #dff9f1 100%)",
    border: "1px solid #d4e7ef",
    minHeight: "650px",
    position: "relative",
  },

  infoContent: {
    padding: "52px 46px",
  },

  badge: {
    display: "inline-block",
    padding: "9px 15px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.8)",
    border: "1px solid #cfe3f2",
    color: "#2370c8",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },

  bigIcon: {
    width: "72px",
    height: "72px",
    marginTop: "42px",
    borderRadius: "20px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "37px",
    boxShadow: "0 8px 25px rgba(50,90,120,0.08)",
  },

  infoTitle: {
    fontSize: "42px",
    lineHeight: "1.12",
    margin: "28px 0 18px",
    color: "#17243b",
    letterSpacing: "-1.5px",
  },

  infoText: {
    fontSize: "17px",
    lineHeight: "1.65",
    color: "#5c708a",
    maxWidth: "450px",
  },

  features: {
    marginTop: "45px",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  featureIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    boxShadow: "0 5px 18px rgba(50,90,120,0.06)",
    flexShrink: 0,
  },

  featureTitle: {
    fontSize: "15px",
    fontWeight: "800",
    marginBottom: "3px",
  },

  featureText: {
    fontSize: "13px",
    color: "#687d95",
  },

  /* CARD */

  card: {
    background: "#ffffff",
    border: "1px solid #e0e7ef",
    borderRadius: "26px",
    padding: "48px",
    boxShadow: "0 18px 50px rgba(38,70,100,0.08)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "35px",
  },

  smallTitle: {
    color: "#2584a6",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "1px",
    marginBottom: "10px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "32px",
    color: "#17243b",
    letterSpacing: "-0.8px",
  },

  cardDescription: {
    color: "#718096",
    fontSize: "15px",
    marginTop: "10px",
  },

  userIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "17px",
    background: "#e8f7f4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
  },

  field: {
    marginBottom: "22px",
  },

  fieldLabel: {
    display: "block",
  },


  passwordLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },

  showBtn: {
    border: "none",
    background: "transparent",
    color: "#2674d9",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "600",
  },

  security: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#f1fbf8",
    border: "1px solid #d8f0e9",
    borderRadius: "13px",
    padding: "13px 15px",
    margin: "6px 0 22px",
  },

  securityIcon: {
    fontSize: "19px",
  },

  registerBtn: {
    width: "100%",
    border: "none",
    borderRadius: "12px",
    padding: "16px",
    background: "#2477d4",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(36,119,212,0.18)",
  },

  loginBox: {
    marginTop: "28px",
    paddingTop: "23px",
    borderTop: "1px solid #e8edf3",
    textAlign: "center",
    color: "#718096",
    fontSize: "14px",
  },

  loginBtn: {
    display: "block",
    margin: "8px auto 0",
    border: "none",
    background: "transparent",
    color: "#2477d4",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
  },
};

/* INPUT CSS */
const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #263954;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    padding: 14px 15px;
    border-radius: 11px;
    border: 1px solid #dbe4ee;
    background: #f8fbfd;
    font-size: 15px;
    color: #17243b;
    outline: none;
    transition: 0.2s;
  }

  input:focus {
    border-color: #6ca9ed;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(36,119,212,0.08);
  }

  input::placeholder {
    color: #9aabc0;
  }

  @media (max-width: 850px) {
    header {
      padding: 0 20px !important;
    }

    main {
      grid-template-columns: 1fr !important;
      margin-top: 25px !important;
    }

    .info-panel {
      min-height: auto !important;
    }
  }

  @media (max-width: 500px) {
    .header-buttons button:first-child {
      display: none;
    }

    .card {
      padding: 28px !important;
    }

    .info-content {
      padding: 32px !important;
    }

    .info-title {
      font-size: 32px !important;
    }
  }
`;

document.head.appendChild(styleSheet);