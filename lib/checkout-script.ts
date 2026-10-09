let pending: Promise<void> | undefined;
export const loadCheckout = () =>
  (pending ||= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    const fail = () => {
      clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      script.remove();
      pending = undefined;
      reject(new Error("Secure checkout could not load. Please retry."));
    };
    const timeout = setTimeout(fail, 15000);
    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    script.onerror = fail;
    document.head.appendChild(script);
  }));
