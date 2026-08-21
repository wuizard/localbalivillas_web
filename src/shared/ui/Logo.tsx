import Image from "next/image";
import { cn } from "@/shared/lib/cn";
import { site } from "@/shared/config/site";

type LogoProps = {
  /** `auto` follows the colour scheme; `light` is the white mark for dark grounds. */
  tone?: "auto" | "light";
  width?: number;
  className?: string;
  priority?: boolean;
};

const ASPECT = 874 / 258;

export function Logo({ tone = "auto", width = 148, className, priority = false }: LogoProps) {
  const height = Math.round(width / ASPECT);
  const alt = `${site.name} logo`;

  if (tone === "light") {
    return (
      <Image
        src="/brand/lbv_white_landscape.png"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn("h-auto w-auto", className)}
        style={{ width, height: "auto" }}
      />
    );
  }

  return (
    <span className={cn("inline-flex", className)}>
      <Image
        src="/brand/lbv_primary.png"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="dark:hidden"
        style={{ width, height: "auto" }}
      />
      <Image
        src="/brand/lbv_white_landscape.png"
        alt=""
        aria-hidden
        width={width}
        height={height}
        className="hidden dark:block"
        style={{ width, height: "auto" }}
      />
    </span>
  );
}
