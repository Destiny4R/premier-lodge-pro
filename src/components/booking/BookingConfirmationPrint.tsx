import { forwardRef } from "react";
import { formatCurrency } from "@/lib/currency";

interface BookingConfirmationData {
  bookingReference: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  roomNumber: string;
  roomCategory: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  paymentMethod?: string;
  paymentReference?: string;
  hotelName: string;
  hotelAddress?: string;
  hotelPhone?: string;
  hotelLogo?: string;
  createdAt: string;
}

interface BookingConfirmationPrintProps {
  data: BookingConfirmationData;
  type: "public" | "receptionist";
}

const BookingConfirmationPrint = forwardRef<HTMLDivElement, BookingConfirmationPrintProps>(
  ({ data, type }, ref) => {
    const currentDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const currentTime = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 max-w-[800px] mx-auto print:p-0 print:m-0 print:max-w-none"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-300 pb-6 mb-6">
          <div className="flex items-center gap-4">
            {data.hotelLogo ? (
              <img
                src={data.hotelLogo}
                alt="Hotel Logo"
                className="w-20 h-20 object-contain"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-500">
                  {data.hotelName?.charAt(0) || "H"}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.hotelName}</h1>
              {data.hotelAddress && (
                <p className="text-gray-600">{data.hotelAddress}</p>
              )}
              {data.hotelPhone && (
                <p className="text-gray-600">Tel: {data.hotelPhone}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900">BOOKING CONFIRMATION</h2>
            <p className="text-sm text-gray-600 mt-1">Date: {currentDate}</p>
            <p className="text-sm text-gray-600">Time: {currentTime}</p>
            {type === "receptionist" && (
              <p className="text-sm text-gray-500 mt-2">Receptionist Copy</p>
            )}
          </div>
        </div>

        {/* Booking Reference Banner */}
        <div className="bg-gray-100 p-4 rounded-lg text-center mb-6">
          <p className="text-sm text-gray-600">Booking Reference Number</p>
          <p className="text-3xl font-bold text-gray-900 tracking-wider">
            {data.bookingReference}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Guest Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4">
              Guest Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold">{data.guestName}</span>
              </div>
              {data.guestEmail && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{data.guestEmail}</span>
                </div>
              )}
              {data.guestPhone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{data.guestPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Room Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4">
              Room Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Room:</span>
                <span className="font-semibold">{data.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-semibold">{data.roomCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold">{data.nights} night(s)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stay Details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded border border-gray-200">
              <p className="text-sm text-gray-600">Check-in Date</p>
              <p className="text-lg font-bold text-green-600">{data.checkIn}</p>
              <p className="text-xs text-gray-500">From 2:00 PM</p>
            </div>
            <div className="text-center p-3 bg-white rounded border border-gray-200">
              <p className="text-sm text-gray-600">Check-out Date</p>
              <p className="text-lg font-bold text-orange-600">{data.checkOut}</p>
              <p className="text-xs text-gray-500">By 12:00 PM</p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-100 px-4 py-3">
            <h3 className="text-lg font-bold text-gray-900">Payment Summary</h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Room Charges ({data.nights} nights)</span>
                <span className="font-semibold">{formatCurrency(data.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-semibold text-green-600">
                  -{formatCurrency(data.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between py-3 text-lg font-bold">
                <span>Balance Due</span>
                <span className={data.balance > 0 ? "text-orange-600" : "text-green-600"}>
                  {formatCurrency(data.balance)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {data.paymentReference && (
          <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-green-800">Payment Confirmed</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Payment Method:</span>
                <span className="ml-2 font-semibold">{data.paymentMethod || "Online Payment"}</span>
              </div>
              <div>
                <span className="text-gray-600">Transaction Ref:</span>
                <span className="ml-2 font-semibold">{data.paymentReference}</span>
              </div>
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="text-xs text-gray-500 border-t border-gray-200 pt-4 mb-6">
          <h4 className="font-bold text-gray-700 mb-2">Terms & Conditions:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Check-in time is 2:00 PM and check-out time is 12:00 PM</li>
            <li>Please present this confirmation along with a valid ID at check-in</li>
            <li>Cancellation must be made 24 hours before check-in for full refund</li>
            <li>Additional charges may apply for extra services used during your stay</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 text-center">
          <p className="text-gray-700 font-semibold">
            Thank you for choosing {data.hotelName}!
          </p>
          <p className="text-sm text-gray-500 mt-1">
            We look forward to making your stay memorable.
          </p>
          <p className="text-xs text-gray-400 mt-4">
            This is a computer-generated document. No signature required.
          </p>
        </div>

        {/* Print-only styles */}
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>
      </div>
    );
  }
);

BookingConfirmationPrint.displayName = "BookingConfirmationPrint";

export default BookingConfirmationPrint;
