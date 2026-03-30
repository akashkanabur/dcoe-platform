'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  { name: 'Priya Sharma', role: 'Product Designer, Infosys', quote: 'The D-CoE program completely transformed how I approach product design. The hands-on prototyping sessions and IISc faculty guidance were invaluable. I landed my dream job within two months of completing the course.', initials: 'PS' },
  { name: 'Rahul Nair', role: 'Startup Founder, Bengaluru', quote: 'As an engineer turning entrepreneur, I needed to understand design thinking. D-CoE gave me not just the methodology but the confidence to build a user-centric product. Our startup raised seed funding six months later.', initials: 'RN' },
  { name: 'Dr. Meena Krishnan', role: 'Associate Professor, MSRIT', quote: 'I attended the Faculty Development Program and it reshaped my entire approach to teaching product design. The curriculum is world-class, and the IISc affiliation adds tremendous credibility.', initials: 'MK' },
  { name: 'Arjun Patel', role: 'Senior Engineer, Bosch India', quote: 'The Electronic Prototyping module was exceptional. Real lab access, expert mentors, and a project-based approach made complex concepts genuinely understandable and applicable.', initials: 'AP' },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  return (
    <section className="py-20 md:py-28 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-0 left-1/3 w-72 h-72 bg-dcoe-green/10 rounded-full blur-3xl" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-4"><span className="accent-line" /></div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-16">What Our Learners Say</h2>
        <div className="relative min-h-[280px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="glass rounded-3xl p-8 md:p-10 text-left">
              <Quote className="w-8 h-8 text-dcoe-green mb-4" />
              <p className="text-gray-200 text-lg leading-relaxed mb-8 italic">{testimonials[current].quote}</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-dcoe-green flex items-center justify-center text-white font-bold font-display">{testimonials[current].initials}</div>
                <div>
                  <div className="text-white font-semibold">{testimonials[current].name}</div>
                  <div className="text-gray-400 text-sm">{testimonials[current].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={prev} className="w-10 h-10 rounded-full glass text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-dcoe-green w-6' : 'bg-gray-600'}`} />
            ))}
          </div>
          <button onClick={next} className="w-10 h-10 rounded-full glass text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
