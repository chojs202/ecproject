import React from "react";

export default function PaymentResult({ success, message }) {
  return (
    <div>
      {success ? <h2>Payment Success!</h2> : <h2>Payment False: {message}</h2>}
    </div>
  );
}