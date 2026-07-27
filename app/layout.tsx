import type { Metadata, Viewport } from "next";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Dashboard",
  description: "Personal dashboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 h-screen overflow-hidden">
        <div className="flex flex-col sm:flex-row h-full">
          <Sidebar />
          <div className="flex-1 min-h-0 sm:min-w-0 overflow-y-auto">{children}</div>
        </div>
      </body>
    </html>
  );
}
