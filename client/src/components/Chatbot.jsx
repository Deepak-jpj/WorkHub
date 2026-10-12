import { useState, useEffect } from "react";
import API from "../services/api";

function Chatbot({ role }) {

  // =====================================================
  // CHAT WINDOW
  // =====================================================

  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);


  // =====================================================
  // USER LOCATION
  // =====================================================

  const [userLocation, setUserLocation] = useState({
    lat: null,
    lng: null
  });


  // =====================================================
  // GET CURRENT LOCATION
  // =====================================================

  const getCurrentLocation = () => {

    return new Promise((resolve, reject) => {

      if (!navigator.geolocation) {

        reject(
          new Error(
            "Geolocation is not supported by this browser."
          )
        );

        return;

      }


      navigator.geolocation.getCurrentPosition(

        (position) => {

          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;


          const location = {

            lat: latitude,

            lng: longitude

          };


          setUserLocation(location);


          console.log(
            "📍 Current location:",
            location
          );


          resolve(location);

        },


        (error) => {

          console.error(
            "📍 Location error:",
            error.message
          );


          reject(error);

        },


        {

          enableHighAccuracy: true,

          timeout: 10000,

          maximumAge: 0

        }

      );

    });

  };


  // =====================================================
  // GET LOCATION WHEN COMPONENT LOADS
  // =====================================================

  useEffect(() => {

    getCurrentLocation()
      .catch((error) => {

        console.log(
          "Location not available yet:",
          error.message
        );

      });

  }, []);


  // =====================================================
  // ASSISTANT NAME
  // =====================================================

  const assistantName =

    role === "worker"

      ? "Worker Platform Assistant"

      : role === "admin"

      ? "Admin Platform Assistant"

      : "Customer Platform Assistant";


  // =====================================================
  // WELCOME MESSAGE
  // =====================================================

  const welcomeMessage =

    role === "worker"

      ? "Hello! 👋 I'm the Worker Platform Assistant. How can I help you?"

      : role === "admin"

      ? "Hello! 👋 I'm the Admin Platform Assistant. How can I help you?"

      : "Hello! 👋 I'm the Customer Platform Assistant. How can I help you?";


  // =====================================================
  // CHAT MESSAGES
  // =====================================================

  const [messages, setMessages] = useState([

    {

      sender: "bot",

      text: welcomeMessage

    }

  ]);


  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const sendMessage = async () => {

    if (
      !message.trim() ||
      loading
    ) {

      return;

    }


    const userText =
      message.trim();


    // =================================================
    // SHOW USER MESSAGE
    // =================================================

    setMessages((previous) => [

      ...previous,

      {

        sender: "user",

        text: userText

      }

    ]);


    setMessage("");

    setLoading(true);


    try {

      // =================================================
      // LOCATION
      // =================================================

      let location = userLocation;


      /*
        For customers, make sure we have GPS coordinates.

        This is especially important when the customer
        replies "Yes" to an urgent worker request.
      */

      if (
        role === "customer" &&
        (
          location.lat === null ||
          location.lng === null
        )
      ) {

        try {

          console.log(
            "📍 Requesting customer location..."
          );


          location =
            await getCurrentLocation();


        } catch (locationError) {

          console.error(
            "📍 Unable to get location:",
            locationError
          );


          setMessages((previous) => [

            ...previous,

            {

              sender: "bot",

              text:
                "📍 I need your current location to send the hire request. Please allow location access in your browser and try again."

            }

          ]);


          setLoading(false);

          return;

        }

      }


      // =================================================
      // DEBUG LOGS
      // =================================================

      console.log(
        "================================"
      );

      console.log(
        "CHATBOT REQUEST"
      );

      console.log(
        "Message:",
        userText
      );

      console.log(
        "Role:",
        role
      );

      console.log(
        "Latitude:",
        location.lat
      );

      console.log(
        "Longitude:",
        location.lng
      );

      console.log(
        "================================"
      );


      // =================================================
      // SEND TO BACKEND
      // =================================================

      const response =
        await API.post(

          "/chatbot",

          {

            message:
              userText,

            lat:
              location.lat,

            lng:
              location.lng

          }

        );


      // =================================================
      // BACKEND RESPONSE
      // =================================================

      console.log(
        "Chatbot response:",
        response.data
      );


      const botReply =
        response.data.reply ||

        response.data.message ||

        "Sorry, I could not understand that.";


      // =================================================
      // SHOW BOT RESPONSE
      // =================================================

      setMessages((previous) => [

        ...previous,

        {

          sender: "bot",

          text: botReply

        }

      ]);


    } catch (error) {

      console.error(
        "🔥 Chatbot API Error:",
        error
      );


      console.error(
        "Backend response:",
        error.response?.data
      );


      let errorMessage =
        "The chatbot server encountered an error. Please try again.";


      // =================================================
      // AUTH ERROR
      // =================================================

      if (
        error.response?.status === 401
      ) {

        errorMessage =
          "Your login session has expired. Please login again.";

      }


      // =================================================
      // LOCATION / BACKEND MESSAGE
      // =================================================

      else if (
        error.response?.data?.message
      ) {

        errorMessage =
          error.response.data.message;

      }


      // =================================================
      // SERVER ERROR
      // =================================================

      else if (
        error.response?.status === 500
      ) {

        errorMessage =
          "The chatbot server encountered an error. Please check the backend terminal.";

      }


      setMessages((previous) => [

        ...previous,

        {

          sender: "bot",

          text: errorMessage

        }

      ]);

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyPress = (event) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }

  };


  // =====================================================
  // OPEN CHAT
  // =====================================================

  const openChat = () => {

    setOpen(true);

  };


  // =====================================================
  // CLOSE CHAT
  // =====================================================

  const closeChat = () => {

    setOpen(false);

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <>

      {/* =================================================
          CHAT BUTTON
      ================================================= */}

      {!open && (

        <button

          onClick={openChat}

          className="
            fixed
            bottom-6
            right-6
            bg-blue-600
            text-white
            rounded-full
            w-16
            h-16
            shadow-lg
            text-2xl
            hover:bg-blue-700
            z-50
          "

        >

          💬

        </button>

      )}


      {/* =================================================
          CHAT WINDOW
      ================================================= */}

      {open && (

        <div

          className="
            fixed
            bottom-6
            right-6
            w-80
            bg-white
            rounded-lg
            shadow-2xl
            border
            z-50
            overflow-hidden
          "

        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div

            className="
              bg-blue-600
              text-white
              p-4
              flex
              justify-between
              items-center
            "

          >

            <div>

              <h3 className="font-bold">

                {assistantName}

              </h3>

              <p className="text-xs">

                AI Support

              </p>

            </div>


            <button

              onClick={closeChat}

              className="
                text-white
                text-xl
                hover:text-gray-200
              "

            >

              ✕

            </button>

          </div>


          {/* =================================================
              MESSAGES
          ================================================= */}

          <div

            className="
              h-80
              overflow-y-auto
              p-3
              bg-gray-50
            "

          >

            {messages.map(

              (msg, index) => (

                <div

                  key={index}

                  className={`
                    mb-3
                    flex
                    ${
                      msg.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }
                  `}

                >

                  <div

                    className={`
                      max-w-[80%]
                      px-3
                      py-2
                      rounded-lg
                      whitespace-pre-line
                      ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white border text-gray-800"
                      }
                    `}

                  >

                    {msg.text}

                  </div>

                </div>

              )

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

              <div className="flex justify-start mb-3">

                <div

                  className="
                    bg-white
                    border
                    text-gray-500
                    px-3
                    py-2
                    rounded-lg
                  "

                >

                  Typing... 🤖

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              INPUT
          ================================================= */}

          <div

            className="
              p-3
              border-t
              flex
              gap-2
            "

          >

            <input

              type="text"

              value={message}

              onChange={(e) =>
                setMessage(e.target.value)
              }

              onKeyDown={handleKeyPress}

              placeholder="Ask something..."

              className="
                border
                rounded
                px-3
                py-2
                flex-1
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "

            />


            <button

              onClick={sendMessage}

              disabled={
                loading ||
                !message.trim()
              }

              className="
                bg-blue-600
                text-white
                px-4
                rounded
                hover:bg-blue-700
                disabled:bg-gray-400
              "

            >

              Send

            </button>

          </div>

        </div>

      )}

    </>

  );

}


export default Chatbot;