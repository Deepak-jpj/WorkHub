import { QRCodeSVG } from "qrcode.react";

function UPIPaymentQR({
  upiId,
  amount,
  workerName,
  jobTitle
}) {
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

      <div
        style={{
          textAlign: "center",
          marginTop: "14px",
          padding: "8px",
          background: "#fff7ed",
          borderRadius: "6px",
          color: "#ea580c",
          fontSize: "13px"
        }}
      >
        ⏳ Waiting for payment confirmation...
      </div>
    </div>
  );
}

export default UPIPaymentQR;