import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import L from "leaflet";

import API from "../services/api";

import "leaflet/dist/leaflet.css";


// =====================================================
// FIX LEAFLET DEFAULT MARKER ICON
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});


// =====================================================
// WORKER ICON
// =====================================================

const workerIcon = new L.Icon({

  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",

  iconSize: [38, 38],

  iconAnchor: [19, 38],

  popupAnchor: [0, -38]

});


// =====================================================
// MAP RESIZE
// IMPORTANT FOR PROFESSIONAL / RESPONSIVE LAYOUT
// =====================================================

function MapResize() {

  const map = useMap();

  useEffect(() => {

    const resizeMap = () => {

      setTimeout(() => {

        map.invalidateSize({
          animate: false
        });

      }, 100);

    };


    // Initial resize
    resizeMap();


    // Resize again after page/layout finishes
    const timer1 = setTimeout(() => {

      map.invalidateSize({
        animate: false
      });

    }, 500);


    const timer2 = setTimeout(() => {

      map.invalidateSize({
        animate: false
      });

    }, 1000);


    // Browser window resize
    window.addEventListener(
      "resize",
      resizeMap
    );


    // Detect changes to map container size
    let resizeObserver;

    if (window.ResizeObserver) {

      resizeObserver =
        new ResizeObserver(() => {

          map.invalidateSize({
            animate: false
          });

        });

      resizeObserver.observe(
        map.getContainer()
      );

    }


    return () => {

      clearTimeout(timer1);

      clearTimeout(timer2);

      window.removeEventListener(
        "resize",
        resizeMap
      );

      if (resizeObserver) {

        resizeObserver.disconnect();

      }

    };

  }, [map]);


  return null;

}


// =====================================================
// FIT ALL WORKERS
// =====================================================

function FitAllWorkers({
  workers,
  customerLocation
}) {

  const map = useMap();

  useEffect(() => {

    const locations = [];


    // Customer location
    if (customerLocation) {

      locations.push(
        customerLocation
      );

    }


    // Worker locations
    workers.forEach((worker) => {

      const coordinates =
        worker.location?.coordinates;


      if (
        coordinates &&
        coordinates.length === 2
      ) {

        const longitude =
          Number(coordinates[0]);

        const latitude =
          Number(coordinates[1]);


        if (
          !Number.isNaN(latitude) &&
          !Number.isNaN(longitude)
        ) {

          locations.push([
            latitude,
            longitude
          ]);

        }

      }

    });


    // Fit map when there are multiple locations
    if (locations.length > 1) {

      const bounds =
        L.latLngBounds(locations);


      setTimeout(() => {

        map.fitBounds(
          bounds,
          {
            padding: [40, 40],
            maxZoom: 11
          }
        );

      }, 300);

    }

  }, [
    workers,
    customerLocation,
    map
  ]);


  return null;

}


// =====================================================
// MAP COMPONENT
// =====================================================

function Map({
  workers: initialWorkers = [],
  showAllWorkers = false
}) {

  const [
    customerLocation,
    setCustomerLocation
  ] = useState(null);


  const [
    workers,
    setWorkers
  ] = useState(initialWorkers);


  // ===================================================
  // GET CUSTOMER LOCATION
  // ===================================================

  useEffect(() => {

    if (!navigator.geolocation) {

      console.log(
        "Geolocation is not supported."
      );

      return;

    }


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        setCustomerLocation([
          latitude,
          longitude
        ]);

      },


      (error) => {

        console.log(
          "Customer location error:",
          error
        );

      },


      {
        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 0
      }

    );

  }, []);


  // ===================================================
  // HOMEPAGE:
  // GET ALL PUBLIC WORKERS
  // ===================================================

  useEffect(() => {

    if (!showAllWorkers) {

      return;

    }


    const getWorkers = async () => {

      try {

        const response =
          await API.get(
            "/auth/public-workers"
          );


        console.log(
          "Public workers:",
          response.data
        );


        const workerList =
          Array.isArray(response.data)

            ? response.data

            : response.data.workers || [];


        setWorkers(workerList);

      }


      catch (error) {

        console.error(
          "Failed to fetch public workers:",
          error
        );

      }

    };


    getWorkers();

  }, [showAllWorkers]);


  // ===================================================
  // UPDATE WORKERS FROM CUSTOMER DASHBOARD
  // ===================================================

  useEffect(() => {

    if (
      initialWorkers &&
      initialWorkers.length > 0
    ) {

      setWorkers(initialWorkers);

    }

  }, [initialWorkers]);


  // ===================================================
  // DEFAULT BENGALURU LOCATION
  // ===================================================

  const defaultLocation = [
    12.9716,
    77.5946
  ];


  const mapCenter =
    customerLocation ||
    defaultLocation;


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div
      className="w-full"
      style={{
        width: "100%",
        height: "500px",
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px"
      }}
    >

      <MapContainer

        center={mapCenter}

        zoom={3}

        scrollWheelZoom={true}

        style={{
          height: "100%",
          width: "100%",
          borderRadius: "20px"
        }}

      >

        {/* MAP RESIZE FIX */}

        <MapResize />


        {/* FIT WORKERS ON MAP */}

        <FitAllWorkers
          workers={workers}
          customerLocation={
            customerLocation
          }
        />


        {/* =================================================
            OPEN STREET MAP
        ================================================= */}

        <TileLayer

          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

        />


        {/* =================================================
            CUSTOMER LOCATION
        ================================================= */}

        {customerLocation && (

          <Marker
            position={
              customerLocation
            }
          >

            <Popup>

              <strong>
                Your Location
              </strong>

              <br />

              Customer

            </Popup>

          </Marker>

        )}


        {/* =================================================
            WORKER LOCATIONS
        ================================================= */}

        {workers.map((worker) => {

          if (
            !worker.location ||
            !worker.location.coordinates ||
            worker.location.coordinates.length !== 2
          ) {

            return null;

          }


          const longitude =
            Number(
              worker.location.coordinates[0]
            );


          const latitude =
            Number(
              worker.location.coordinates[1]
            );


          if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude)
          ) {

            return null;

          }


          return (

            <Marker

              key={worker._id}

              position={[
                latitude,
                longitude
              ]}

              icon={workerIcon}

            >

              <Popup>

                <div>

                  <strong>
                    👷 {worker.name}
                  </strong>


                  <br />
                  <br />


                  <strong>
                    Skill:
                  </strong>{" "}

                  {worker.skills?.join(", ") ||
                    "Not specified"}


                  <br />


                  <strong>
                    Experience:
                  </strong>{" "}

                  {worker.experience || 0}
                  {" "}years


                  <br />


                  <strong>
                    Rating:
                  </strong>{" "}

                  ⭐ {worker.rating || 0}


                  <br />


                  <strong>
                    Status:
                  </strong>{" "}


                  <span
                    style={{
                      color:
                        worker.isAvailable
                          ? "green"
                          : "red",

                      fontWeight: "bold"
                    }}
                  >

                    {worker.isAvailable
                      ? "Available"
                      : "Busy"}

                  </span>


                  <br />
                  <br />


                  <strong>
                    Phone:
                  </strong>{" "}

                  {worker.phone ||
                    "Not provided"}

                </div>

              </Popup>

            </Marker>

          );

        })}

      </MapContainer>

    </div>

  );

}


export default Map;