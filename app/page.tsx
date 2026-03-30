import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Process from '@/components/landing/Process'
import Highlights from '@/components/landing/Highlights'
import Courses from '@/components/landing/Courses'
import Beneficiaries from '@/components/landing/Beneficiaries'
import Testimonials from '@/components/landing/Testimonials'
import FAQ from '@/components/landing/FAQ'
import Contact from '@/components/landing/Contact'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Process />
      <Highlights />
      <Courses />
      <Beneficiaries />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  )
}
