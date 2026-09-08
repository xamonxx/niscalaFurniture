"use client";

import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import {
  FacebookIcon,
  InstagramIcon,
  ThreadsIcon,
  TikTokIcon,
} from "@/components/ui/social-icons";

const channels = [
  {
    key: "instagram",
    label: "Instagram",
    Icon: InstagramIcon,
    showcaseClass:
      "hover:border-[#E4405F]/35 hover:bg-[radial-gradient(circle_at_30%_110%,#FEDA75_0%,#FA7E1E_28%,#D62976_54%,#962FBF_75%,#4F5BD5_100%)] hover:text-pure-white hover:shadow-[0_22px_65px_-32px_rgba(214,41,118,0.75)]",
  },
  {
    key: "facebook",
    label: "Facebook",
    Icon: FacebookIcon,
    showcaseClass:
      "hover:border-[#1877F2]/30 hover:bg-[#1877F2] hover:text-pure-white hover:shadow-[0_22px_65px_-32px_rgba(24,119,242,0.75)]",
  },
  {
    key: "threads",
    label: "Threads",
    Icon: ThreadsIcon,
    showcaseClass:
      "hover:border-deep-black/30 hover:bg-deep-black hover:text-pure-white hover:shadow-[0_22px_65px_-32px_rgba(9,11,13,0.75)]",
  },
  {
    key: "tiktok",
    label: "TikTok",
    Icon: TikTokIcon,
    showcaseClass:
      "hover:border-deep-black/30 hover:bg-deep-black hover:text-pure-white hover:shadow-[0_22px_65px_-34px_rgba(9,11,13,0.8)]",
  },
] as const;

/**
 * Social profiles.
 *
 * Each channel disappears entirely when its URL is not configured, so the
 * footer never shows a handle the studio does not actually own.
 */
type SocialLinksProps = {
  className?: string;
  variant?: "default" | "showcase";
};

export function SocialLinks({
  className,
  variant = "default",
}: SocialLinksProps) {
  const available = channels.filter(({ key }) => site.social[key]);

  if (available.length === 0) return null;

  const isShowcase = variant === "showcase";

  return (
    <ul
      className={cn(
        isShowcase
          ? "flex flex-wrap items-center justify-center gap-space-md"
          : "flex items-center gap-space-sm",
        className,
      )}
    >
      {available.map(({ key, label, Icon, showcaseClass }) => (
        <li key={key}>
          <a
            href={site.social[key] as string}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} ${site.name}`}
            onClick={() => track("social_click", { channel: key })}
            className={cn(
              "group inline-flex items-center justify-center rounded-md transition-[background-color,border-color,box-shadow,color,scale,translate] duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:translate-y-px",
              isShowcase
                ? cn(
                    "size-[3.25rem] border border-border-hairline bg-surface-container-lowest text-on-surface-variant shadow-hairline hover:scale-[1.05] md:size-[3.75rem] lg:size-[4.25rem]",
                    showcaseClass,
                  )
                : "size-9 text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
            )}
          >
            <Icon className={isShowcase ? "size-7 md:size-8 lg:size-9" : "size-[18px]"} />
          </a>
        </li>
      ))}
    </ul>
  );
}
