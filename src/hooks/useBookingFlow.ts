import { useState, useCallback } from "react";
import { toast } from "sonner";
import { verifyBookingPayment, createBooking, createReservation } from "@/services/bookingService";
import { createPublicBooking, verifyPublicBookingPayment } from "@/services/publicService";

export const useBookingFlow = ({
  guest,
  bookingForm,
  selectedRoom,
  totalBill,
  onSuccess,
  isPublic = true,
  bookingType = "check-in",
}: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startBookingProcess = useCallback(async (e?: React.FormEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isSubmitting) return;

    setIsSubmitting(true);

    // 1. DATE & AMOUNT PREP
    const checkIn = bookingForm.checkIn || bookingForm.checkInDate;
    const checkOut = bookingForm.checkOut || bookingForm.checkOutDate;
    const formattedIn = checkIn instanceof Date ? checkIn.toISOString().split('T')[0] : checkIn;
    const formattedOut = checkOut instanceof Date ? checkOut.toISOString().split('T')[0] : checkOut;

    let amountToPay = parseFloat(bookingForm.paidAmount?.toString().replace(/[^0-9.]/g, '') || "0");
    if (isPublic && amountToPay === 0) amountToPay = totalBill;

    try {
      let response;
      if (isPublic) {
        response = await createPublicBooking({
          roomId: selectedRoom?.id || bookingForm.roomId,
          guestName: bookingForm.guestName,
          guestEmail: bookingForm.guestEmail,
          guestPhone: bookingForm.guestPhone,
          checkInDate: formattedIn,
          checkOutDate: formattedOut,
          numberOfGuests: bookingForm.numberOfGuests || 1,
          paidAmount: amountToPay,
          paymentMethod: 1 as 1, 
          specialRequests: bookingForm.specialRequests,
        });
      } else {
        response = bookingType === "check-in" 
          ? await createBooking({ guestId: guest.id, roomId: bookingForm.roomId, checkIn: formattedIn, checkOut: formattedOut, paidAmount: amountToPay, paymentMethod: parseInt(bookingForm.paymentMethod), paymentStatus: parseInt(bookingForm.paymentStatus) })
          : await createReservation({ guestId: guest.id, roomId: bookingForm.roomId, checkIn: formattedIn, checkOut: formattedOut, paidAmount: amountToPay, paymentMethod: parseInt(bookingForm.paymentMethod), paymentStatus: parseInt(bookingForm.paymentStatus) });
      }

      if (!response.success) throw new Error(response.message);

      const bookingData = response.data; // This is the "Lean" data (Reference only)
      const serverRef = bookingData.bookingReference;

      if (amountToPay > 0) {
        onSuccess(bookingData, true); // Close Modal for Credo

        setTimeout(() => {
          const SDK = (window as any).CredoWidget || (window as any).Credo;
          
          if (!SDK) {
            toast.error("Payment engine failed to load.");
            setIsSubmitting(false);
            return;
          }

          document.body.style.pointerEvents = "auto";
          document.body.style.overflow = "auto";

          // --- DEFINE VERIFICATION HANDLER ---
          const handleVerification = async (res: any) => {
            const tid = toast.loading("Verifying payment...");
            try {
              const verifyService = isPublic ? verifyPublicBookingPayment : verifyBookingPayment;
              const v = await verifyService(res.reference || serverRef);
              
              if (v.success) {
                toast.success("Payment Verified!", { id: tid });
                // SUCCESS: Pass the FULL object (v.data) from the server back to the UI
                onSuccess(v.data, false); 
              } else {
                toast.error("Verification pending", { id: tid });
                onSuccess(bookingData, false); // Fallback to lean data
              }
            } catch (err) {
              toast.error("Network error during verification", { id: tid });
              onSuccess(bookingData, false);
            } finally {
              setIsSubmitting(false);
            }
          };

          const names = (isPublic ? bookingForm.guestName : guest.name || "Guest").trim().split(" ");

          const credo = new SDK({
            key: import.meta.env.VITE_CREDO_PUBLIC_KEY,
            customerFirstName: names[0] || "Guest",
            customerLastName: names.slice(1).join(" ") || "User",
            email: isPublic ? bookingForm.guestEmail : guest.email,
            amount: Math.round(amountToPay * 100),
            currency: "NGN",
            reference: serverRef,
            customerPhoneNumber: (isPublic ? bookingForm.guestPhone : guest.phone) || "",
            onClose: () => {
              setIsSubmitting(false);
              onSuccess(bookingData, false);
            },
            callback: handleVerification,
            callBack: handleVerification 
          });

          if (typeof credo.initialiseTransaction === 'function') credo.initialiseTransaction();
          if (typeof credo.openIframe === 'function') credo.openIframe();
        }, 800);

      } else {
        toast.success("Booking saved.");
        setIsSubmitting(false);
        onSuccess(bookingData, false);
      }
    } catch (err: any) {
      toast.error(err.message || "Error");
      setIsSubmitting(false);
    }
  }, [bookingForm, selectedRoom, totalBill, onSuccess, isSubmitting, isPublic, bookingType, guest]);

  return { startBookingProcess, isSubmitting };
};