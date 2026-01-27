// src/services/paymentService.ts
import { generateTransactionRef } from "@/lib/reference";
import { toast } from "sonner";

interface CredoOptions {
  amount: number;
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  onSuccess: (response: any) => void;
  onClose: () => void;
}

export const initiateCredoPayment = ({
  amount,
  email,
  firstname,
  lastname,
  phone,
  onSuccess,
  onClose
}: CredoOptions) => {
  if (!window.CredoWidget) {
    console.error("Credo SDK not loaded");
    return;
  }

  // --- START OF EMERGENCY CLEANUP ---
  // Force the body to be interactive again
  document.body.style.pointerEvents = 'auto';
  document.body.style.overflow = 'auto';
  
  // Remove aria-hidden from the root so the Credo iframe is visible/interactive
  const root = document.getElementById('root');
  if (root) root.removeAttribute('aria-hidden');
  // --- END OF EMERGENCY CLEANUP ---

  const transRef = generateTransactionRef("BOK");

  window.CredoWidget.setup({
    key: import.meta.env.VITE_CREDO_PUBLIC_KEY, 
    customerFirstName: firstname,
    customerLastName: lastname,
    email: email,
    amount: amount * 100, 
    currency: 'NGN',
    renderSize: 0, // 0 triggers the full-screen overlay
    channels: ['card', 'bank'],
    reference: transRef,
    customerPhoneNumber: phone,
    onClose: () => {
      onClose();
    },
    callBack: (response: any) => {
      onSuccess(response);
    },
  });
};