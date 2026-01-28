// src/hooks/useBookingFlow.ts
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { createBooking, createReservation, verifyBookingPayment } from "@/services/bookingService";
import { updateGuest } from "@/services/guestService";

export const useBookingFlow = ({ guest, bookingForm, bookingType, totalBill, paymentMethods, onSuccess }: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // We add 'e' here to capture the form event
  const startBookingProcess = useCallback(async (e?: React.FormEvent) => {
    // CRITICAL: Stop the browser from refreshing the page
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (e) {
    e.preventDefault?.();
    e.stopPropagation?.();
  }

    if (isSubmitting) return;
    setIsSubmitting(true);

    console.log("--- STARTING HANDSHAKE ---");
  console.log("Payload Guest ID:", guest?.id);
  console.log("Amount:", bookingForm.paidAmount);

    const selectedMethod = paymentMethods.find((m: any) => m.id.toString() === bookingForm.paymentMethod);
    const isOnlinePayment = !selectedMethod?.name?.toLowerCase().includes("cash") && (parseFloat(bookingForm.paidAmount) || 0) > 0;


    try {
      const payload = {
        guestId: guest.id,
        roomId: bookingForm.roomId,
        checkIn: bookingForm.checkIn?.toISOString().split('T')[0],
        checkOut: bookingForm.checkOut?.toISOString().split('T')[0],
        paidAmount: parseFloat(bookingForm.paidAmount) || 0,
        paymentMethod: bookingForm.paymentMethod,
        paymentStatus: bookingForm.paymentStatus, 
        totalAmount: totalBill,
        bookingtype: bookingType === "check-in" ? "Checked In" : "Reservation",
      };

      // THE HANDSHAKE
      const response = bookingType === "check-in" 
        ? await createBooking(payload as any) 
        : await createReservation(payload as any);

        console.log("SERVER RESPONSE:", response);


      if (!response.success) {
        toast.error(response.message || "Server Handshake Failed");
        setIsSubmitting(false);
        return;
      }

      // Handshake successful - update local records
      await updateGuest(guest.id, { accommodation: payload.bookingtype });


      if (isOnlinePayment) {
        const serverRef = response.data?.bookingReference;
        const publicKey = import.meta.env.VITE_CREDO_PUBLIC_KEY;

        console.log("Online Payment Detected. Ref:", serverRef);


        if (!serverRef) throw new Error("Server failed to provide a Transaction Reference.");

        // 1. Close the React Modal first
        onSuccess(); 

        setTimeout(() => {
  const CredoClass = (window as any).CredoWidget;

  if (!CredoClass) {
    toast.error("Payment SDK not found.");
    setIsSubmitting(false);
    return;
  }

  // 1. Force Clean Page State
  document.body.style.pointerEvents = 'auto';
  document.body.style.overflow = 'auto';

  try {
    const cleanAmount = Math.round(Number(bookingForm.paidAmount) * 100);
    const publicKey = import.meta.env.VITE_CREDO_PUBLIC_KEY;

    // 2. Instantiate the SDK
    const instance = new CredoClass({
      key: publicKey,
      customerFirstName: guest?.firstname || '',
      customerLastName: guest?.lastname || '',
      email: guest?.email || '',
      amount: cleanAmount,
      currency: 'NGN',
      reference: serverRef,
      customerPhoneNumber: guest?.phone || '',
      onClose: () => {
        setIsSubmitting(false);
        toast.info("Payment cancelled.");
      },
      callback: (res: any) => {
        setIsSubmitting(false);
        toast.success("Payment successful!");
        onSuccess();
      },
    });

    // 3. THE MAGIC SEQUENCE (Based on your discovered methods)
    console.log("Step 1: Initialising Transaction...");
    if (typeof instance.initialiseTransaction === 'function') {
      instance.initialiseTransaction();
    }

    console.log("Step 2: Opening Iframe...");
    if (typeof instance.openIframe === 'function') {
      instance.openIframe();
    }

    // 4. EMERGENCY VISIBILITY OVERRIDE
    // If the iframe exists but is invisible or has 0 height/width
    const findAndFixIframe = () => {
      const iframes = document.getElementsByTagName('iframe');
      for (let i = 0; i < iframes.length; i++) {
        // Look for any iframe related to credo
        if (iframes[i].src.includes('credo') || iframes[i].id.includes('credo')) {
          console.log("Credo Iframe detected. Enforcing visibility...");
          iframes[i].style.display = "block";
          iframes[i].style.visibility = "visible";
          iframes[i].style.opacity = "1";
          iframes[i].style.zIndex = "999999";
          iframes[i].style.position = "fixed";
          iframes[i].style.top = "0";
          iframes[i].style.left = "0";
          iframes[i].style.width = "100vw";
          iframes[i].style.height = "100vh";
        }
      }
    };

    // Run the fix immediately and again after 500ms
    findAndFixIframe();
    setTimeout(findAndFixIframe, 500);

    console.log("Credo Process Fully Triggered.");

  } catch (err) {
    console.error("CRITICAL Launch Error:", err);
    setIsSubmitting(false);
  }
}, 800);


      } else {
        toast.success("Booking saved!");
        console.log("Offline Payment - Success");
        onSuccess();
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("FLOW ERROR:", err);
      toast.error(err.message || "Connection lost during handshake.");
      setIsSubmitting(false);
    }
  }, [guest, bookingForm, bookingType, totalBill, paymentMethods, onSuccess, isSubmitting]);

  return { startBookingProcess, isSubmitting };
};