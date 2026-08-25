import { useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();

  const logout = () => {
    navigate("/");
  };

  return (

    <div className="min-h-screen w-full bg-gray-100">

      {/* Navbar */}

      <div className="w-full bg-blue-600 text-white flex justify-between items-center px-10 py-4 shadow-lg">

        <h1 className="text-2xl font-bold">
          Worker Platform
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>


      {/* Dashboard Content */}

      <div className="max-w-7xl mx-auto px-10 py-10">

        <h2 className="text-3xl font-bold mb-6">
          Dashboard
        </h2>


        {/* Create Job Button */}

        <button
          onClick={() => navigate("/create-job")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow"
        >
          Post New Job
        </button>



        {/* Job Cards */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">

          {/* Card 1 */}

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">

            <h3 className="text-xl font-bold mb-2">
              Electrician Work
            </h3>

            <p className="text-gray-600">
              Fix house wiring
            </p>

            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              View
            </button>

          </div>


          {/* Card 2 */}

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">

            <h3 className="text-xl font-bold mb-2">
              Plumber Work
            </h3>

            <p className="text-gray-600">
              Fix bathroom pipe
            </p>

            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              View
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;