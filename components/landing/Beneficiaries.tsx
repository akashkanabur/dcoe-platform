'use client'
import { motion } from 'framer-motion'
import { Building2, Lightbulb, Factory, GraduationCap, Users } from 'lucide-react'

const beneficiaries = [
  { icon: Building2, label: 'Corporates', desc: 'Upskill product and R&D teams with cutting-edge design methodologies.' },
  { icon: Lightbulb, label: 'Startups', desc: 'Build design-driven products and develop a strong innovation culture.' },
  { icon: Factory, label: 'MSMEs', desc: 'Modernise operations and product lines with Industry 4.0 capabilities.' },
  { icon: GraduationCap, label: 'Engineering Faculty', desc: 'Enrich academic curriculum with practical design and prototyping skills.' },
  { icon: Users, label: 'Students', desc: 'Gain industry-ready skills and IISc certification to fast-track your career.' },
]

export default function Beneficiaries() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="flex justify-center mb-4"><span className="accent-line" /></div>
          <h2 className="section-heading mb-4">Who Benefits</h2>
          <p className="section-subtitle max-w-2xl mx-auto">D-CoE programs are designed for diverse learners across industry and academia.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {beneficiaries.map((b, i) => {
            const Icon = b.icon
            return (
              <motion.div key={b.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="group text-center p-6 rounded-2xl border-2 border-transparent hover:border-dcoe-green/20 hover:bg-green-50/50 transition-all duration-300 cursor-default">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 group-hover:bg-dcoe-green text-gray-500 group-hover:text-white flex items-center justify-center mx-auto mb-3 transition-all duration-300">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="font-display font-bold text-gray-900 text-sm mb-1">{b.label}</div>
                <div className="text-gray-400 text-xs leading-relaxed">{b.desc}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
