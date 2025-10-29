import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/contexts/ToastContext";
import ToastContainer from "@/components/ui/Toast";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "Alabili - Your Trusted Online Shopping Destination in Bangladesh",
    template: "%s | Alabili",
  },
  description: "Shop at Alabili for the latest products with great deals. Quality products, fast delivery, cash on delivery, and excellent customer service across Bangladesh.",
  keywords: ["alabili", "online shopping bangladesh", "ecommerce", "cash on delivery", "products", "deals", "Bangladesh", "dhaka shopping"],
  authors: [{ name: "Alabili" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Alabili",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Alabili - Online Shopping in Bangladesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alabili - Your Trusted Online Shopping Destination",
    description: "Shop the latest products at Alabili with great deals and fast delivery across Bangladesh",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>
          <CartProvider>
            {children}
          </CartProvider>
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
