"use client";

import { Phone, Globe, Mail, MapPin, MessageCircle } from "lucide-react";
import type { ListingContactDTO } from "@/types";

/**
 * Contact action links. Each click records an anonymous counter increment via
 * the public contact-click endpoint (fire-and-forget).
 */
export function ContactLinks({
  listingId,
  contact,
  addressLine,
  district,
}: {
  listingId: string;
  contact: ListingContactDTO;
  addressLine?: string;
  district: string;
}): React.ReactNode {
  function track(): void {
    void fetch("/api/listings/contact-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: listingId }),
    }).catch(() => undefined);
  }

  const mapQuery = encodeURIComponent(
    addressLine ? `${addressLine}, ${district}, Bangladesh` : `${district}, Bangladesh`,
  );

  return (
    <div className="flex flex-col gap-2.5">
      {contact.phone ? (
        <a
          href={`tel:${contact.phone.replace(/\s+/g, "")}`}
          onClick={track}
          className="btn-primary w-full"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          কল করুন ({contact.phone})
        </a>
      ) : null}
      {contact.whatsapp ? (
        <a
          href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={track}
          className="btn-secondary w-full text-[#128C7E]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          হোয়াটসঅ্যাপ
        </a>
      ) : null}
      {contact.website ? (
        <a
          href={contact.website}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={track}
          className="btn-secondary w-full"
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          ওয়েবসাইট
        </a>
      ) : null}
      {contact.email ? (
        <a
          href={`mailto:${contact.email}`}
          onClick={track}
          className="btn-secondary w-full"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          ইমেইল
        </a>
      ) : null}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary w-full"
      >
        <MapPin className="h-4 w-4" aria-hidden="true" />
        ম্যাপে দেখুন
      </a>
    </div>
  );
}
