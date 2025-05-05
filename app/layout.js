import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

// app/layout.js
export const metadata = {
  title: {
    default: "FollowUpFollow",
    template: "%s | FollowUpFollow",
  },
  description: "A lightweight, PWA-ready CRM designed for solo founders and small teams.",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
