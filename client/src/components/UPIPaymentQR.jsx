import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import API from "../services/api";

function UPIPaymentQR({
  upiId,
  amount,
  workerName,
  jobTitle,
  jobId,
  onPaymentSuccess
}) {
    const [confirming, setConfirming] = useState(false);

  const handlePaymentPaid = async () => {
    const confirmed = window.confirm(
      "Have you completed the UPI payment to the worker?"
    );

    if (!confirmed) return;

    try {
      setConfirming(true);

      await API.put(
        `/job/confirm-payment/${jobId}`,
        {}
      );

      alert("Payment marked as successful!");

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }

    } catch (error) {
      console.error("PAYMENT CONFIRM ERROR:", error);

      alert(
        error.response?.data?.message ||
        "Failed to confirm payment"
      );
    } finally {
      setConfirming(false);
    }
  };
  if (!upiId || !amount || Number(amount) <= 0) {
    return (
      <p className="text-red-600 text-sm">
        UPI payment information unavailable.
      </p>
    );
  }

  const upiUrl =
    `upi://pay?pa=${encodeURIComponent(upiId)}` +
    `&pn=${encodeURIComponent(workerName || "Worker")}` +
    `&am=${Number(amount).toFixed(2)}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(jobTitle || "WorkHub Payment")}`;

  return (
    <div
  style={{
    marginTop: "12px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "20px",
    maxWidth: "520px",
    marginLeft: "0",
    marginRight: "0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
  }}
>
      <h3
        style={{
          fontSize: "20px",
          fontWeight: "700",
          marginBottom: "12px",
          textAlign: "center"
        }}
      >
        💰 Payment Request
      </h3>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "14px",
          marginBottom: "6px"
        }}
      >
        <span>Amount</span>
        <strong>₹{amount}</strong>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "14px",
          marginBottom: "16px"
        }}
      >
        <span>Worker UPI</span>
        <strong>{upiId}</strong>
      </div>

      {/* CENTERED QR */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "14px",
          background: "#f9fafb",
          borderRadius: "10px"
        }}
      >
        <QRCodeSVG
          value={upiUrl}
          size={190}
          level="M"
        />
      </div>

      <p
        style={{
          textAlign: "center",
          fontWeight: "600",
          marginTop: "12px",
          marginBottom: "4px"
        }}
      >
        Scan to Pay ₹{amount}
      </p>

      <p
        style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#6b7280",
          margin: 0
        }}
      >
        PhonePe • Google Pay • Paytm • BHIM
      </p>

      <button
  onClick={handlePaymentPaid}
  disabled={confirming}
  style={{
    width: "100%",
    textAlign: "center",
    marginTop: "14px",
    padding: "10px",
    background: confirming ? "#9ca3af" : "#dcfce7",
    border: "none",
    borderRadius: "6px",
    color: "#16a34a",
    fontSize: "14px",
    fontWeight: "700",
    cursor: confirming ? "not-allowed" : "pointer"
  }}
>
  {confirming
    ? "⏳ Confirming Payment..."
    : "✅ Payment Paid"}
</button>
    </div>
  );
}

export default UPIPaymentQR;