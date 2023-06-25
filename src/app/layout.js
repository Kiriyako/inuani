import Navbar from './components/Navbar/nav'
import './globals.css'
import { Poppins } from 'next/font/google'
import Footer from './components/Footer/footer'
const poppins = Poppins({ subsets: ['latin'], weight: '400' })

export const metadata = {
  title: 'inu - home',
  description: 'a site to watch anime',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Navbar />
        {children}
        <Footer />
        </body>
    </html>
  )
}
