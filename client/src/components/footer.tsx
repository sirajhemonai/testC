import { SellSparkLogo } from "@/components/SellSparkLogo";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="py-4">
      <div className="flex justify-center">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <SellSparkLogo clickable={false} />
        </Link>
      </div>
    </footer>
  );
}