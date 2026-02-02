import { useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  verifyBookingPayment, 
  createBooking, 
  createReservation 
} from "@/services/bookingService";
import { 
  createPublicBooking, 
  verifyPublicBookingPayment 
} from "@/services/publicService";

interface BookingFlowOptions {
  guest?: any;
  bookingForm: any;
  selectedRoom?: any;
  totalBill: number;
  onSuccess: (data: any, isInitiatingPayment: boolean) => void;
  isPublic?: boolean;
  bookingType?: "check-in" | "reservation";
  paymentMethods?: any[]; // <--- Add this back to the interface
}

export const useBookingFlow = ({
  guest,
  bookingForm,
  selectedRoom,
  totalBill,
  onSuccess,
  isPublic = true,
  bookingType = "check-in",
  paymentMethods = [] // <--- Default to empty array
}: BookingFlowOptions) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startBookingProcess = useCallback(async (e?: React.FormEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isSubmitting) return;

    setIsSubmitting(true);
    const amountToPayNow = parseFloat(bookingForm.paidAmount) || 0;
    const isOnlinePayment = amountToPayNow > 0;

    // DYNAMIC CHECK: Is the selected method the Online Gateway?
    // We check if the selected method name contains "credo" or "online"
    const selectedMethodObj = paymentMethods.find(
      (m) => m.id.toString() === bookingForm.paymentMethod
    );
    const isCredoSelected = isPublic || 
      selectedMethodObj?.name.toLowerCase().includes("credo") || 
      selectedMethodObj?.name.toLowerCase().includes("online");

    try {
      let response;
      if (isPublic) {
        response = await createPublicBooking({
          roomId: selectedRoom?.id || bookingForm.roomId,
          guestName: bookingForm.guestName,
          guestEmail: bookingForm.guestEmail,
          guestPhone: bookingForm.guestPhone,
          checkInDate: bookingForm.checkIn,
          checkOutDate: bookingForm.checkOut,
          numberOfGuests: bookingForm.numberOfGuests || 1,
          paidAmount: amountToPayNow,
          paymentMethod: 1, 
        });
      } else {
        const payload = {
          guestId: guest.id,
          roomId: bookingForm.roomId,
          checkIn: bookingForm.checkIn,
          checkOut: bookingForm.checkOut,
          paidAmount: amountToPayNow,
          paymentMethodId: parseInt(bookingForm.paymentMethod),
          paymentStatusId: parseInt(bookingForm.paymentStatus),
        };
        response = bookingType === "check-in" ? await createBooking(payload) : await createReservation(payload);
      }

      if (!response.success) throw new Error(response.message);

      const bookingData = response.data;

      // TRIGGER CREDO only if there's an amount AND it's the right method
      if (isOnlinePayment && isCredoSelected) {
        onSuccess(bookingData, true); 
        
        setTimeout(() => {
          const SDK = (window as any).CredoWidget;
          if (!SDK) { setIsSubmitting(false); return; }

          document.body.style.pointerEvents = "auto";
          document.body.style.overflow = "auto";

          const handleVerification = async (payRes: any) => {
            const tid = toast.loading("Verifying payment...");
            const verifyService = isPublic ? verifyPublicBookingPayment : verifyBookingPayment;
            const v = await verifyService(payRes.reference || bookingData.bookingReference);
            
            if (v.success) toast.success("Verified!", { id: tid });
            else toast.error(v.message, { id: tid });
            
            setIsSubmitting(false);
            onSuccess(bookingData, false);
          };

          new SDK({
            key: import.meta.env.VITE_CREDO_PUBLIC_KEY,
            customerFirstName: isPublic ? bookingForm.guestName.split(" ")[0] : guest.firstname,
            customerLastName: isPublic ? (bookingForm.guestName.split(" ")[1] || "") : guest.lastname,
            email: isPublic ? bookingForm.guestEmail : guest.email,
            amount: Math.round(amountToPayNow * 100),
            currency: "NGN",
            reference: bookingData.bookingReference,
            customerPhoneNumber: isPublic ? bookingForm.guestPhone : guest.phone,
            onClose: () => { setIsSubmitting(false); onSuccess(bookingData, false); },
            callback: handleVerification,
            callBack: handleVerification,
          }).initialiseTransaction();
        }, 800);
      } else {
        toast.success("Processed successfully");
        setIsSubmitting(false);
        onSuccess(bookingData, false);
      }
    } catch (err: any) {
      toast.error(err.message || "Error");
      setIsSubmitting(false);
    }
  }, [bookingForm, selectedRoom, totalBill, onSuccess, isSubmitting, isPublic, bookingType, guest, paymentMethods]);

  return { startBookingProcess, isSubmitting };
};