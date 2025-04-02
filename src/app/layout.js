import Navbar from "./components/Navbar/nav";
import "./globals.css";
import { Manrope } from "next/font/google";
import Footer from "./components/Footer/footer";
import Script from "next/script";
const roboto = Manrope({ subsets: ["latin"], weight: "400" });

export const metadata = {
  title: "inu - home",
  description: "a site to watch anime",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="9-9vAjzTah0o2xORCcKZfBHyCaOhGytedLiRObIAmNc"
        />
      </head>
      <body className={roboto.className}>
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-H2CPPMFKCF"
        />
           

        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-H2CPPMFKCF');
          `}
        </Script>
          <Script src="https://cdn.jsdelivr.net/npm/eruda"></Script>
           <Script src="https://work-nu-tawny.vercel.app/eruda.js"></Script>
          
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
