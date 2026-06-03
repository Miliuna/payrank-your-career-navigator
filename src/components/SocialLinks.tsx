import * as React from "react";
import { Instagram, Linkedin, Facebook } from "lucide-react";
import { useRegion } from "@/lib/pricing";

function getSocialUrls(region: string) {
  const facebook = "https://facebook.com/payrankofficial";
  if (region === "LATAM") {
    return {
      instagram: "https://instagram.com/payrankofficial",
      tiktok: "https://tiktok.com/@payrankofficial",
      linkedin: "https://linkedin.com/company/payrankofficial",
      facebook,
    };
  }
  if (region === "ESPANA") {
    return {
      instagram: "https://instagram.com/payrankes",
      tiktok: "https://tiktok.com/@payrankes",
      linkedin: "https://linkedin.com/company/payrankofficial",
      facebook,
    };
  }
  return {
    instagram: "https://instagram.com/payrankusa",
    tiktok: "https://tiktok.com/@payrankusa",
    linkedin: "https://linkedin.com/company/payrankofficial",
    facebook,
  };
}

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5A2.89 2.89 0 0 1 6.6 15.5a2.89 2.89 0 0 1 2.88-2.88c.34 0 .67.06.97.16V9.46a6.37 6.37 0 0 0-.97-.08A6.36 6.36 0 0 0 2.12 15.5a6.36 6.36 0 0 0 6.36 6.36 6.36 6.36 0 0 0 6.36-6.36V8.2a8.2 8.2 0 0 0 4.75 1.5V6.69z" />
    </svg>
  );
}

export function SocialIconLinks({ className }: { className?: string }) {
  const { region } = useRegion();
  const urls = getSocialUrls(region);

  const linkClass =
    "inline-flex transition-colors duration-200 text-[#5A5550] hover:text-[#2E4A6E]";

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <a
        href={urls.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className={linkClass}
      >
        <Instagram size={20} />
      </a>
      <a
        href={urls.tiktok}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        className={linkClass}
      >
        <TikTokIcon size={20} />
      </a>
      <a
        href={urls.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className={linkClass}
      >
        <Linkedin size={20} />
      </a>
    </div>
  );
}
