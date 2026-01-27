// src/hooks/useBookingFlow.ts
import { useState, useEffect } from "react";
import { useCredoPayment } from "react-credo";
import { toast } from "sonner";
import { 
  createBooking, 
  createReservation, 
  verifyBookingPayment 
} from "@/services/bookingService";
import { updateGuest } from "@/services/guestService";

interface BookingFlowProps {
  guest: any;
  bookingForm: any;
  bookingType: "check-in" | "reservation";
  totalBill: number;
  paymentMethods: any[];
  onSuccess: () => void;
}

export const useBookingFlow = ({
  guest,
  bookingForm,
  bookingType,
  totalBill,
  paymentMethods,
  onSuccess
}: BookingFlowProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTransRef, setCurrentTransRef] = useState("");

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  };

  

  // --- STEP 2: THE CREDO CONFIG & VERIFICATION ---
  const credoConfig = {
    key: import.meta.env.VITE_CREDO_PUBLIC_KEY,
    customerFirstName: guest?.firstname || '',
    customerLastName: guest?.lastname || '',
    email: guest?.email || '',
    amount: (parseFloat(bookingForm.paidAmount) || 0) * 100, // Credo uses Kobo
    currency: 'NGN',
    reference: currentTransRef, // This is the server-generated bookingReference
    customerPhoneNumber: guest?.phone || '',
    onClose: () => {
      setIsSubmitting(false);
      toast.info("Payment window closed. The record remains as pending/unpaid.");
      onSuccess(); // Refresh UI to show the new pending booking
    },
    callBack: async (response: any) => {
      // 1. Browser says OK - Start server-side verification
      const toastId = toast.loading("Verifying payment with server...");
      setIsSubmitting(true);

      try {
        // 2. Handshake back to our server to verify with Credo's API
        const verifyRes = await verifyBookingPayment(response.reference || currentTransRef);

        if (verifyRes.success) {
          toast.success("Payment verified and booking confirmed!", { id: toastId });
          onSuccess(); // Close modal and refresh list
        } else {
          toast.error(`Verification failed: ${verifyRes.message}`, { id: toastId });
          onSuccess(); // Refresh anyway to show current state
        }
      } catch (err) {
        console.error("Verification Error:", err);
        toast.error("Error communicating with verification server.", { id: toastId });
        onSuccess();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const initializeCredo = useCredoPayment(credoConfig);

  // --- TRIGGER CREDO AUTOMATICALLY ---
  // Once the server returns a reference and sets our state, open the gateway
  useEffect(() => {
    if (currentTransRef && isSubmitting) {
      initializeCredo();
    }
  }, [currentTransRef, isSubmitting]);

  // --- STEP 1: THE MAIN TRIGGER (THE HANDSHAKE) ---
  const startBookingProcess = async () => {
    setIsSubmitting(true);

    // Identify payment intent
    const selectedMethod = paymentMethods.find(m => m.id.toString() === bookingForm.paymentMethod);
    const isCash = selectedMethod?.name?.toLowerCase().includes("cash");
    const amountToPayNow = parseFloat(bookingForm.paidAmount) || 0;
    const isOnlinePayment = !isCash && amountToPayNow > 0;

    try {
      // A. Prepare payload for the initial handshake
      const payload = {
        guestId: guest.id,
        roomId: bookingForm.roomId,
        checkIn: formatDate(bookingForm.checkIn),
        checkOut: formatDate(bookingForm.checkOut),
        paidAmount: amountToPayNow,
        paymentMethod: bookingForm.paymentMethod,
        paymentStatus: bookingForm.paymentStatus, 
        totalAmount: totalBill,
        bookingtype: bookingType === "check-in" ? "Checked In" : "Reservation",
      };

      // B. Hit server FIRST to register the intention
      const response = bookingType === "check-in" 
        ? await createBooking(payload as any) 
        : await createReservation(payload as any);

      if (response.success) {
        // C. Mark guest status in local DB
        await updateGuest(guest.id, { 
          accommodation: bookingType === "check-in" ? "Checked In" : "Reservation" 
        });

        if (isOnlinePayment) {
          // D. SUCCESSFUL HANDSHAKE -> Trigger Payment Gateway
          // We use the reference the SERVER just generated (Crucial for reconciliation)
          const serverRef = response.data?.bookingReference;
          
          if (serverRef) {
            setCurrentTransRef(serverRef);
            toast.info("Booking registered. Opening payment gateway...");
          } else {
            toast.error("Server did not return a booking reference.");
            setIsSubmitting(false);
          }
        } else {
          // E. OFFLINE FLOW (Cash/Later)
          toast.success("Booking saved successfully!");
          setIsSubmitting(false);
          onSuccess();
        }
      } else {
        toast.error(response.message || "Failed to create booking on server");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Handshake Error:", err);
      toast.error("Network error. Could not reach the server.");
      setIsSubmitting(false);
    }
  };

  return { 
    startBookingProcess, 
    isSubmitting 
  };
};