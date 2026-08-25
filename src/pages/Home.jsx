import "./Home.css";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import Map from "../components/Map";

function Home() {

  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="home">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="navbar">

        <h2 className="logo">
          WorkHub
        </h2>

        <div className="nav-links">

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal("how");
            }}
          >
            How it works
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal("services");
            }}
          >
            Services
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal("payment");
            }}
          >
            Payment
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal("safety");
            }}
          >
            Safety
          </a>

        </div>

        <div className="nav-buttons">

          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive
                ? "signin active-button"
                : "signin"
            }
          >
            Sign In
          </NavLink>

          <NavLink
            to="/register"
            className={({ isActive }) =>
              isActive
                ? "start active-button"
                : "start"
            }
          >
            Get Started
          </NavLink>

        </div>

      </nav>


      {/* =========================
          HERO SECTION
      ========================= */}

      <div className="hero container">

        <div className="hero-left">

          <span className="badge">
            WORKERS NEAR YOU — LIVE
          </span>

          <h1>
            Any skilled worker,
            <span> instantly.</span>
          </h1>

          <p>
            Connect with verified plumbers, electricians,
            carpenters and cleaners. Request, get matched
            and finish jobs fast.
          </p>

          <div className="buttons">

            <NavLink
              to="/customer-login"
              className={({ isActive }) =>
                isActive
                  ? "book active-button"
                  : "book"
              }
            >
              Book a Worker
            </NavLink>

            <NavLink
              to="/worker-login"
              className={({ isActive }) =>
                isActive
                  ? "join active-button"
                  : "join"
              }
            >
              Join as Worker
            </NavLink>

          </div>

        </div>


        {/* =========================
            LIVE WORKER MAP
        ========================= */}

        <div className="hero-right">

          <div className="home-live-map">

            {/* HOMEPAGE SHOWS ALL WORKERS */}

            <Map showAllWorkers={true} />

            <div className="map-live-badge">
              🟢 LIVE WORKERS
            </div>

          </div>

        </div>

      </div>


      {/* =========================
          SERVICES SECTION
      ========================= */}

      <section className="services container">

        <h2>
          Popular Services
        </h2>

        <div className="service-grid">

          <div className="service-card">
            🔧
            <h3>Plumber</h3>
            <p>
              Fix leaks, pipes and bathroom fittings.
            </p>
          </div>

          <div className="service-card">
            💡
            <h3>Electrician</h3>
            <p>
              Electrical repairs and installations.
            </p>
          </div>

          <div className="service-card">
            🪚
            <h3>Carpenter</h3>
            <p>
              Furniture repair and wood work.
            </p>
          </div>

          <div className="service-card">
            🧹
            <h3>Cleaner</h3>
            <p>
              Home and office cleaning services.
            </p>
          </div>

        </div>

      </section>


      {/* =========================
          WHY SECTION
      ========================= */}

      <section className="why container">

        <h2 className="why-title">
          Why Choose WorkHub
        </h2>

        <div className="why-grid">

          <div className="why-card">

            ⭐

            <h3>
              Verified Workers
            </h3>

            <p>
              All workers are verified before joining.
            </p>

          </div>

          <div className="why-card">

            ⚡

            <h3>
              Fast Service
            </h3>

            <p>
              Find workers instantly near you.
            </p>

          </div>

          <div className="why-card">

            🔒

            <h3>
              Secure Payment
            </h3>

            <p>
              Safe and trusted payment system.
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="footer">

        <h3>
          WorkHub
        </h3>

        <p>
          Find skilled workers near you instantly.
        </p>

        <p>
          © 2026 WorkHub Platform
        </p>

      </footer>


      {/* =================================================
          POPUP MODAL
      ================================================= */}

      {activeModal && (

        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={closeModal}
            >
              ×
            </button>


            {/* =================================================
                HOW IT WORKS
            ================================================= */}

            {activeModal === "how" && (

              <div className="modal-content">

                <div className="modal-icon">
                  ⚙️
                </div>

                <h2>
                  How WorkHub Works
                </h2>

                <p className="modal-description">
                  Getting a skilled worker through WorkHub
                  is simple, fast and convenient.
                </p>

                <div className="modal-steps">

                  <div className="modal-step">
                    <span>1</span>
                    <div>
                      <h3>Request a Worker</h3>
                      <p>
                        Select the service you need and submit
                        your job request.
                      </p>
                    </div>
                  </div>

                  <div className="modal-step">
                    <span>2</span>
                    <div>
                      <h3>Get Matched</h3>
                      <p>
                        WorkHub helps connect you with a suitable
                        skilled worker.
                      </p>
                    </div>
                  </div>

                  <div className="modal-step">
                    <span>3</span>
                    <div>
                      <h3>Worker Accepts</h3>
                      <p>
                        The selected worker accepts your request
                        and contacts you.
                      </p>
                    </div>
                  </div>

                  <div className="modal-step">
                    <span>4</span>
                    <div>
                      <h3>Job Completed</h3>
                      <p>
                        The worker completes the requested job
                        and the customer confirms completion.
                      </p>
                    </div>
                  </div>

                </div>

              </div>

            )}


            {/* =================================================
                SERVICES
            ================================================= */}

            {activeModal === "services" && (

              <div className="modal-content">

                <div className="modal-icon">
                  🛠️
                </div>

                <h2>
                  Our Services
                </h2>

                <p className="modal-description">
                  Find skilled workers for your everyday
                  service requirements.
                </p>

                <div className="modal-service-grid">

                  <div className="modal-service-card">
                    <div className="service-icon">
                      🔧
                    </div>

                    <h3>
                      Plumber
                    </h3>

                    <p>
                      Pipe repairs, leaks, bathroom fittings
                      and plumbing work.
                    </p>
                  </div>

                  <div className="modal-service-card">
                    <div className="service-icon">
                      💡
                    </div>

                    <h3>
                      Electrician
                    </h3>

                    <p>
                      Electrical repairs, wiring and
                      installations.
                    </p>
                  </div>

                  <div className="modal-service-card">
                    <div className="service-icon">
                      🪚
                    </div>

                    <h3>
                      Carpenter
                    </h3>

                    <p>
                      Furniture repair, wood work and
                      installations.
                    </p>
                  </div>

                  <div className="modal-service-card">
                    <div className="service-icon">
                      🧹
                    </div>

                    <h3>
                      Cleaner
                    </h3>

                    <p>
                      Home, office and general cleaning
                      services.
                    </p>
                  </div>

                </div>

              </div>

            )}


            {/* =================================================
                PAYMENT
            ================================================= */}

            {activeModal === "payment" && (

              <div className="modal-content">

                <div className="modal-icon">
                  💳
                </div>

                <h2>
                  Payment
                </h2>

                <p className="modal-description">
                  WorkHub provides a simple and transparent
                  payment process.
                </p>

                <div className="payment-items">

                  <div className="payment-item">

                    <div className="payment-icon">
                      💰
                    </div>

                    <div>

                      <h3>
                        Transparent Pricing
                      </h3>

                      <p>
                        Customers can view the service cost
                        before confirming a job.
                      </p>

                    </div>

                  </div>

                  <div className="payment-item">

                    <div className="payment-icon">
                      💳
                    </div>

                    <div>

                      <h3>
                        Secure Payment
                      </h3>

                      <p>
                        Payments are processed through a
                        secure payment system.
                      </p>

                    </div>

                  </div>

                  <div className="payment-item">

                    <div className="payment-icon">
                      🧾
                    </div>

                    <div>

                      <h3>
                        Payment Confirmation
                      </h3>

                      <p>
                        Customers receive confirmation after
                        completing the payment.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            )}


            {/* =================================================
                SAFETY
            ================================================= */}

            {activeModal === "safety" && (

              <div className="modal-content">

                <div className="modal-icon">
                  🛡️
                </div>

                <h2>
                  Your Safety Matters
                </h2>

                <p className="modal-description">
                  WorkHub focuses on creating a safe and
                  reliable experience for customers and workers.
                </p>

                <div className="safety-items">

                  <div className="safety-item">

                    <span>
                      ✓
                    </span>

                    <div>

                      <h3>
                        Verified Workers
                      </h3>

                      <p>
                        Worker information can be verified
                        before accepting jobs.
                      </p>

                    </div>

                  </div>

                  <div className="safety-item">

                    <span>
                      ✓
                    </span>

                    <div>

                      <h3>
                        Ratings & Reviews
                      </h3>

                      <p>
                        Customers can share their experience
                        after a completed service.
                      </p>

                    </div>

                  </div>

                  <div className="safety-item">

                    <span>
                      ✓
                    </span>

                    <div>

                      <h3>
                        Secure Payments
                      </h3>

                      <p>
                        Payment information is handled through
                        a secure process.
                      </p>

                    </div>

                  </div>

                  <div className="safety-item">

                    <span>
                      ✓
                    </span>

                    <div>

                      <h3>
                        Job Tracking
                      </h3>

                      <p>
                        Customers can track the progress and
                        status of their requested job.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Home;