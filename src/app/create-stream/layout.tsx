import { Metadata } from "next";
import { AuthGuard } from "@/src/components/layout/AuthGuard";

export const metadata: Metadata = {
  title: "Create Stream | DripPay",
  description: "Create a new payment stream with DripPay. Set up continuous stablecoin payments (USDC, USDT) with customizable flow rates and schedules.",
  keywords: "create stream, payment stream, continuous payments, stablecoin streaming, USDC, USDT, flow rate, stream setup, DripPay stream",
  openGraph: {
    title: "Create Stream | DripPay",
    description: "Create a new payment stream with DripPay. Set up continuous stablecoin payments (USDC, USDT) with customizable flow rates and schedules.",
    type: "website",
    url: "https://drip-pay.xyz/create-stream",
  },
  twitter: {
    card: "summary",
    title: "Create Stream | DripPay",
    description: "Create a new payment stream with DripPay. Set up continuous stablecoin payments (USDC, USDT) with customizable flow rates and schedules.",
  },
};

export default function CreateStreamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}
