'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'What is the Centre of Excellence in Design (D-CoE)?', a: 'The Centre of Excellence in Design (D-CoE) is a premier initiative by the Indian Institute of Science (IISc), Bengaluru, supported by the Government of Karnataka. It offers industry-aligned design and innovation programs for students, professionals, faculty, and MSMEs to build practical, future-ready skills.' },
  { q: 'How do D-CoE programs align with industry requirements?', a: 'Our curriculum is developed in close collaboration with leading industry partners, ensuring that every module addresses current and emerging market demands. From Industry 4.0 technologies to design thinking, the content is continuously reviewed by an advisory board of industry professionals.' },
  { q: 'Can the program be conducted outside IISc Bengaluru?', a: 'Yes. D-CoE offers both on-campus and off-campus delivery models. Corporate workshops and faculty development programs can be conducted at your institution or organisation with customised content tailored to your specific needs.' },
  { q: 'Will the program provide software training?', a: 'Absolutely. Depending on the course, participants receive training in industry-standard design, prototyping, and engineering software. This includes CAD tools, PCB design software, digital prototyping platforms, and more.' },
  { q: 'What is the duration of the program?', a: 'Program durations vary. One-day workshops offer intensive exposure, while full courses range from 4 to 8 weeks. Custom corporate programs can be structured based on your organisation\'s schedule and learning objectives.' },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4"><span className="accent-line" /></div>
          <h2 className="section-heading mb-4">Frequently Asked Questions</h2>
          <p className="section-subtitle">Everything you need to know about the D-CoE program.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
