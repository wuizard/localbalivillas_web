import { MessageCircle } from "lucide-react";
import { whatsappHref } from "@/shared/config/site";

/** Below md the bottom nav already carries a Help item — two entry points would be clutter. */
export function WhatsAppFab() {
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-6 bottom-6 z-40 hidden size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform duration-[120ms] ease-out hover:scale-105 active:scale-95 md:flex"
    >
      <MessageCircle size={26} strokeWidth={1.8} aria-hidden />
    </a>
  );
}
