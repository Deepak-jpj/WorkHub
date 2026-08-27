import "./Home.css";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import Map from "../components/Map";

const services = [
  { title: "Plumber", icon: "🔧", description: "Pipe repairs, leaks and bathroom fittings." },
  { title: "Electrician", icon: "⚡", description: "Electrical repairs, wiring and installations." },
  { title: "Carpenter", icon: "🪚", description: "Furniture repair, wood work and installations." },
  { title: "Staff", icon: "👥", description: "Reliable staff for homes, offices and businesses." },
  { title: "Technician", icon: "🛠️", description: "Technical support, maintenance and repairs." },
  { title: "Painter", icon: "🎨", description: "Interior, exterior and professional painting." },
  { title: "Driver", icon: "🚗", description: "Verified drivers for personal and professional needs." },
  { title: "Security Guard", icon: "🛡️", description: "Security professionals for homes and businesses." },
  { title: "Cleaner", icon: "🧹", description: "Home, office and general cleaning services." },
  { title: "Mechanic", icon: "🔩", description: "Vehicle inspection, servicing and mechanical repairs." },
  { title: "Other", icon: "➕", description: "Find skilled professionals for other requirements." }
];

const mainServices = services.filter(s => s.title !== "Other");

function Home() {
  const [activeModal, setActiveModal] = useState(null);
  const openModal = name => setActiveModal(name);
  const closeModal = () => setActiveModal(null);

  const openMenu = (e, name) => {
    e.preventDefault();
    openModal(name);
  };

  return (
    <div className="home">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar">

        <NavLink to="/" className="logo">
          <img
            src="/workhub-logo.png"
            alt="WorkHub"
            className="brand-logo"
          />
          <span>WorkHub</span>
        </NavLink>

        <div className="nav-links">
          <a href="#how-it-works" onClick={e => openMenu(e, "how")}>
            How it works
          </a>
          <a href="#services" onClick={e => openMenu(e, "services")}>
            Services
          </a>
          <a href="#payment" onClick={e => openMenu(e, "payment")}>
            Payment
          </a>
          <a href="#safety" onClick={e => openMenu(e, "safety")}>
            Safety
          </a>
        </div>

        <div className="nav-buttons">
          <NavLink to="/login" className="signin">
            Sign In
          </NavLink>
          <NavLink to="/register" className="start">
            Get Started
          </NavLink>
        </div>

      </nav>


      {/* ================= HERO ================= */}
      <main>

        <section className="hero container">

          <div className="hero-left">

            <div className="hero-eyebrow">
              <span className="live-dot" />
              WORKERS NEAR YOU — LIVE
            </div>

            <h1>
              Find skilled workers.
              <span>Get the job done.</span>
            </h1>

            <p className="hero-description">
              Connect with verified plumbers, electricians,
              carpenters, cleaners and other skilled professionals
              near you.
            </p>

            <div className="buttons">
              <NavLink to="/customer-login" className="book">
                Book a Worker <span>→</span>
              </NavLink>

              <NavLink to="/worker-login" className="join">
                Join as Worker
              </NavLink>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <span>✓</span> Verified workers
              </div>
              <div className="trust-item">
                <span>✓</span> Location based matching
              </div>
              <div className="trust-item">
                <span>✓</span> Simple payments
              </div>
            </div>

          </div>


          {/* ================= MAP ================= */}
          <div className="hero-right">

            <div className="home-live-map">

              <Map showAllWorkers={true} />

              <div className="map-top-card">
                <span className="live-dot" />
                <div>
                  <strong>Live Workers</strong>
                  <small>Available near you</small>
                </div>
              </div>

              <div className="map-bottom-card">
                <div className="map-status-icon">✓</div>
                <div>
                  <strong>Find workers nearby</strong>
                  <small>Powered by location matching</small>
                </div>
              </div>

            </div>

          </div>

        </section>


        {/* ================= FEATURE STRIP ================= */}
        <section className="feature-strip">

          <div className="container feature-grid">

            {[
              ["✓", "Verified Professionals", "Trusted workers for your jobs"],
              ["⌖", "Nearby Matching", "Find workers around your location"],
              ["✦", "AI-Powered Scheduling", "Smart worker recommendations"],
              ["₹", "Simple Payments", "Convenient UPI payment support"]
            ].map(([icon, title, text]) => (
              <div className="feature-item" key={title}>
                <div className="feature-icon">{icon}</div>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </div>
            ))}

          </div>

        </section>


        {/* ================= SERVICES ================= */}
        <section className="services container" id="services">

          <div className="section-heading">

            <div>
              <span className="section-label">SERVICES</span>
              <h2>Skilled help for every job.</h2>
            </div>

            <p>
              Choose from a growing range of skilled professionals
              available through WorkHub.
            </p>

          </div>


          {/* MOVING SERVICE ROW */}
          <div className="service-marquee">

            <div className="service-track">

              {[...mainServices, ...mainServices].map((service, index) => (

                <div
                  className="service-card"
                  key={`${service.title}-${index}`}
                >

                  <div className="service-icon">
                    {service.icon}
                  </div>

                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>

                  <span className="card-arrow">→</span>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* ================= HOW IT WORKS ================= */}
        <section className="workflow-section" id="how-it-works">

          <div className="container">

            <div className="section-heading centered">

              <span className="section-label">
                SIMPLE PROCESS
              </span>

              <h2>How WorkHub works</h2>

              <p>
                From requesting a worker to completing the job,
                everything stays simple and organized.
              </p>

            </div>


            <div className="workflow-grid">

              {[
                ["01", "📝", "Post a Job", "Tell us what service you need and create your job request."],
                ["02", "⌖", "Find a Worker", "Discover suitable workers near your location."],
                ["03", "✓", "Complete the Job", "The selected worker accepts and completes the requested work."],
                ["04", "₹", "Make Payment", "Complete the payment and confirm the finished job."]
              ].map(([num, icon, title, text]) => (

                <div className="workflow-card" key={num}>

                  <span className="step-number">{num}</span>
                  <div className="workflow-icon">{icon}</div>

                  <h3>{title}</h3>
                  <p>{text}</p>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* ================= AI ================= */}
        <section className="ai-section container">

          <div className="ai-content">

            <span className="section-label">
              SMART MATCHING
            </span>

            <h2>
              Smarter worker selection
              <span> powered by AI.</span>
            </h2>

            <p>
              WorkHub can analyze important factors such as
              skill match, availability, distance, rating,
              experience and workload to recommend suitable
              workers.
            </p>

            <div className="ai-points">
              <span>✓ Skill matching</span>
              <span>✓ Availability</span>
              <span>✓ Distance</span>
              <span>✓ Rating</span>
              <span>✓ Experience</span>
              <span>✓ Workload</span>
            </div>

          </div>


          <div className="ai-visual">

            <div className="ai-card-header">
              <span className="ai-status" />
              AI Worker Recommendation
            </div>

            <div className="ai-worker">

              <div className="worker-avatar">👷</div>

              <div className="worker-info">
                <strong>Best Match</strong>
                <span>Based on multiple factors</span>
              </div>

              <div className="ai-score">AI</div>

            </div>

            <div className="score-bars">

              <div>
                <span>Skill Match</span>
                <i style={{ width: "92%" }} />
              </div>

              <div>
                <span>Availability</span>
                <i style={{ width: "86%" }} />
              </div>

              <div>
                <span>Distance</span>
                <i style={{ width: "78%" }} />
              </div>

              <div>
                <span>Experience</span>
                <i style={{ width: "88%" }} />
              </div>

            </div>

          </div>

        </section>


        {/* ================= LIVE WORKERS ================= */}
        <section className="live-workers-section">

          <div className="live-background-grid" />

          <div className="container live-workers-content">

            <div className="section-heading centered light">

              <span className="section-label">
                <span className="live-dot" />
                LIVE NETWORK
              </span>

              <h2>Workers moving. Jobs getting done.</h2>

              <p>
                WorkHub connects customers with skilled
                professionals available around them.
              </p>

            </div>


            <div className="worker-animation">

              <div className="worker-route route-one" />
              <div className="worker-route route-two" />
              <div className="worker-route route-three" />

              {[
                ["worker-one", "👷", "Plumber", "15s"],
                ["worker-two", "👨‍🔧", "Electrician", "18s"],
                ["worker-three", "👷", "Driver", "13s"],
                ["worker-four", "🧹", "Cleaner", "20s"]
              ].map(([cls, icon, title, duration]) => (

                <div
                  className={`moving-worker ${cls}`}
                  style={{ animationDuration: duration }}
                  key={cls}
                >

                  <span>{icon}</span>

                  <div>
                    <strong>{title}</strong>
                    <small>Available</small>
                  </div>

                </div>

              ))}

              <div className="worker-location location-one">●</div>
              <div className="worker-location location-two">●</div>
              <div className="worker-location location-three">●</div>

            </div>

          </div>

        </section>


        {/* ================= WHY WORKHUB ================= */}
        <section className="why container">

          <div className="section-heading centered">

            <span className="section-label">
              WHY WORKHUB
            </span>

            <h2>Built around trust and convenience.</h2>

          </div>


          <div className="why-grid">

            {[
              ["★", "Verified Workers", "Worker information can be verified before joining the platform."],
              ["⚡", "Fast Service", "Find suitable workers around your location without unnecessary delays."],
              ["🔒", "Secure Payments", "Simple and transparent payment flow for completed jobs."]
            ].map(([icon, title, text]) => (

              <div className="why-card" key={title}>

                <div className="why-icon">{icon}</div>

                <h3>{title}</h3>

                <p>{text}</p>

              </div>

            ))}

          </div>

        </section>


        {/* ================= CTA ================= */}
        <section className="cta-section container">

          <div className="cta-content">

            <div>

              <span className="section-label">
                GET STARTED
              </span>

              <h2>Ready to get your job done?</h2>

              <p>
                Find the right skilled worker through WorkHub.
              </p>

            </div>

            <NavLink
              to="/customer-login"
              className="cta-button"
            >
              Book a Worker →
            </NavLink>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}
      <footer className="footer">

        <div className="container footer-grid">

          <div className="footer-brand">

            <div className="footer-logo">

              <img
                src="/workhub-logo.png"
                alt="WorkHub"
                className="footer-brand-logo"
              />

              <span>WorkHub</span>

            </div>

            <p>
              AI-powered worker matching and job scheduling
              for everyday services.
            </p>

          </div>


          <div className="footer-column">

            <h4>Platform</h4>

            <a href="#services">Services</a>
            <a href="#how-it-works">How it works</a>
            <a href="#payment">Payment</a>
            <a href="#safety">Safety</a>

          </div>


          <div className="footer-column">

            <h4>Get Started</h4>

            <NavLink to="/customer-login">
              Book a Worker
            </NavLink>

            <NavLink to="/worker-login">
              Join as Worker
            </NavLink>

            <NavLink to="/login">
              Sign In
            </NavLink>

          </div>


          <div className="footer-column">

            <h4>WorkHub</h4>

            <span>AI Worker Matching</span>
            <span>Location Based Services</span>
            <span>UPI Payments</span>
            <span>Worker Management</span>

          </div>

        </div>


        <div className="footer-bottom container">

          <span>© 2026 WorkHub Platform</span>

          <span>Built for customers and skilled workers.</span>

        </div>

      </footer>


      {/* ================= MODALS ================= */}
      {activeModal && (

        <div className="modal-overlay" onClick={closeModal}>

          <div
            className="modal-box"
            onClick={e => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={closeModal}
            >
              ×
            </button>


            {/* HOW IT WORKS */}
            {activeModal === "how" && (

              <div className="modal-content">

                <div className="modal-icon">⚙️</div>

                <h2>How WorkHub Works</h2>

                <p className="modal-description">
                  Getting a skilled worker through WorkHub
                  is simple, fast and convenient.
                </p>

                <div className="modal-steps">

                  {[
                    ["1", "Request a Worker", "Select the service you need and submit your job request."],
                    ["2", "Get Matched", "WorkHub helps connect you with a suitable skilled worker."],
                    ["3", "Worker Accepts", "The selected worker accepts your request and contacts you."],
                    ["4", "Job Completed", "The worker completes the requested job and the customer confirms completion."]
                  ].map(([num, title, text]) => (

                    <div className="modal-step" key={num}>

                      <span>{num}</span>

                      <div>
                        <h3>{title}</h3>
                        <p>{text}</p>
                      </div>

                    </div>

                  ))}

                </div>

              </div>

            )}


            {/* SERVICES */}
            {activeModal === "services" && (

              <div className="modal-content">

                <div className="modal-icon">🛠️</div>

                <h2>Our Services</h2>

                <p className="modal-description">
                  Find skilled workers for your everyday
                  service requirements.
                </p>

                <div className="modal-service-grid">

                  {services.map(service => (

                    <div
                      className="modal-service-card"
                      key={service.title}
                    >

                      <div className="service-icon">
                        {service.icon}
                      </div>

                      <h3>{service.title}</h3>

                      <p>{service.description}</p>

                    </div>

                  ))}

                </div>

              </div>

            )}


            {/* PAYMENT */}
            {activeModal === "payment" && (

              <div className="modal-content">

                <div className="modal-icon">💳</div>

                <h2>Payment</h2>

                <p className="modal-description">
                  WorkHub provides a simple and transparent
                  payment process.
                </p>

                <div className="payment-items">

                  {[
                    ["💰", "Transparent Pricing", "Customers can view the service cost before confirming a job."],
                    ["💳", "Secure Payment", "Payments are processed through a secure payment system."],
                    ["🧾", "Payment Confirmation", "Customers receive confirmation after completing the payment."]
                  ].map(([icon, title, text]) => (

                    <div className="payment-item" key={title}>

                      <div className="payment-icon">{icon}</div>

                      <div>
                        <h3>{title}</h3>
                        <p>{text}</p>
                      </div>

                    </div>

                  ))}

                </div>

              </div>

            )}


            {/* SAFETY */}
            {activeModal === "safety" && (

              <div className="modal-content">

                <div className="modal-icon">🛡️</div>

                <h2>Your Safety Matters</h2>

                <p className="modal-description">
                  WorkHub focuses on creating a safe and
                  reliable experience for customers and workers.
                </p>

                <div className="safety-items">

                  {[
                    ["Verified Workers", "Worker information can be verified before accepting jobs."],
                    ["Ratings & Reviews", "Customers can share their experience after a completed service."],
                    ["Secure Payments", "Payment information is handled through a secure process."],
                    ["Job Tracking", "Customers can track the progress and status of their requested job."]
                  ].map(([title, text]) => (

                    <div className="safety-item" key={title}>

                      <span>✓</span>

                      <div>
                        <h3>{title}</h3>
                        <p>{text}</p>
                      </div>

                    </div>

                  ))}

                </div>

              </div>

            )}

          </div>

        </div>

      )}


      {/* ================= SMALL VISUAL OVERRIDES ================= */}
      <style>{`
        .brand-logo{
          width:48px;
          height:48px;
          object-fit:cover;
          border-radius:14px;
          display:block;
          box-shadow:0 8px 22px rgba(37,99,235,.22);
        }

        .logo{
          gap:12px;
        }

        .logo > span:last-child{
          font-size:24px;
          font-weight:800;
          letter-spacing:-.8px;
        }

        .footer-brand-logo{
          width:38px;
          height:38px;
          object-fit:cover;
          border-radius:11px;
        }

        .footer-logo{
          gap:10px;
        }

        .footer-logo .logo-mark{
          display:none;
        }

        .service-marquee{
          width:100%;
          overflow:hidden;
          position:relative;
          padding:8px 0 18px;
          mask-image:linear-gradient(
            to right,
            transparent,
            black 5%,
            black 95%,
            transparent
          );
          -webkit-mask-image:linear-gradient(
            to right,
            transparent,
            black 5%,
            black 95%,
            transparent
          );
        }

        .service-track{
          display:flex;
          width:max-content;
          gap:16px;
          animation:workhubServiceMove 42s linear infinite;
          will-change:transform;
        }

        .service-marquee:hover .service-track{
          animation-play-state:paused;
        }

        .service-track .service-card{
          flex:0 0 205px;
          width:205px;
        }

        @keyframes workhubServiceMove{
          from{
            transform:translateX(0);
          }
          to{
            transform:translateX(calc(-50% - 8px));
          }
        }

        @media(max-width:700px){
          .brand-logo{
            width:40px;
            height:40px;
            border-radius:12px;
          }

          .logo > span:last-child{
            font-size:20px;
          }

          .service-track .service-card{
            flex-basis:180px;
            width:180px;
          }

          .service-track{
            animation-duration:35s;
          }
        }
      `}</style>

    </div>
  );
}

export default Home;