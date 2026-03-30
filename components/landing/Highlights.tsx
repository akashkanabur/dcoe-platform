'use client'

import { motion } from 'framer-motion'
import { Award, Briefcase, Hammer, Building2, Rocket, Network } from 'lucide-react'

const highlights = [
  { icon: Award, title: 'IISc Certified', description: "Receive certification from one of India's most prestigious research institutions.", accent: 'text-dcoe-green bg-dcoe-green/10' },
  { icon: Briefcase, title: 'Industry Ready Skills', description: 'Curriculum designed with industry leaders to ensure job-market relevance.', accent: 'text-blue-600 bg-blue-50' },
  { icon: Hammer, title: 'Hands-on Experience', description: 'Learn by doing — labs, workshops, and real-world projects from day one.', accent: 'text-green-600 bg-green-50' },
  { icon: Building2, title: 'Govt. of Karnataka', description: 'Backed by the Government of Karnataka for quality assurance and reach.', accent: 'text-purple-600 bg-purple-50' },
  { icon: Rocket, title: 'Entrepreneurship', description: 'Build the mindset and skills to launch your own design-led venture.', accent: 'text-orange-600 bg-orange-50' },
  { icon: Network, title: 'Industry Connect', description: 'Access a network of industry mentors, companies, and innovation hubs.', accent: 'text-teal-600 bg-teal-50' },
]

export default function Highlights() {
  return (
    <section id="about" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="flex justify-center mb-4"><span className="accent-line" /></div>
          <h2 className="section-heading mb-4">Program Highlights</h2>
          <p className="section-subtitle max-w-2xl mx-auto">What makes the D-CoE program uniquely positioned to transform your design career.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div key={item.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="group card p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl ${item.accent} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
