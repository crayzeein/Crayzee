import { Inter } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GlobalProviders from "@/components/layout/GlobalProviders";
import "./globals.css";

const inter = Inter({
  variable: "--font-main",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  metadataBase: new URL('https://www.crayzee.in'),
  // Child routes set only their own title; the template appends the brand
  title: {
    default: 'CRAYZEE.IN | Gen-Z Streetwear',
    template: '%s | CRAYZEE.IN'
  },
  description: "The sickest collection of Oversized, Anime, and Graphic Tees.",
  alternates: { canonical: '/' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <GlobalProviders>
            {children}
          </GlobalProviders>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
