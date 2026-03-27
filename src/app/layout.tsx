import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Robelin II",
  description: "Productos exclusivos para salones de belleza y barberías.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased text-white bg-background min-h-screen flex flex-col relative`}>
        {/* Ambient Glow Effects matching the SeamFlow design */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full mix-blend-screen opacity-50" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[150px] rounded-full mix-blend-screen opacity-50" />
        </div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
