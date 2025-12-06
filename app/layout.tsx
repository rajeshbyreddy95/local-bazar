import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import './globals.css';
import Toast from '@/components/Toast';

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Local Bazar - Your Local Online Marketplace",
  description: "Discover the best local products with fast delivery from trusted sellers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${poppins.variable} font-poppins antialiased bg-white text-gray-900 overflow-x-hidden`} suppressHydrationWarning>
        {children}
        <Toast />
      </body>
    </html>
  );
}
