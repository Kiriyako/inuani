import Navbar from './components/Navbar/nav'
import './globals.css'
import { Poppins } from 'next/font/google'
import Footer from './components/Footer/footer'
import Script from 'next/script'
const poppins = Poppins({ subsets: ['latin'], weight: '400' })

export const metadata = {
  title: 'inu - home',
  description: 'a site to watch anime',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Script id="googleanalytics" strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-H2CPPMFKCF">

        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', newDate());
          gtag('config', 'G-H2CPPMFKCF')
          `}
        
        </Script>
         <Navbar />
        {children}
        <Footer />
        </body>
    </html>
  )
}
