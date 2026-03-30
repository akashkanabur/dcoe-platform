'use client'

import { motion } from 'framer-motion'
import { Lightbulb, Target, Search, Layers } from 'lucide-react'

const steps = [
  {
    icon: Lightbulb,
    title: 'Ideate',
    description:
      'Generate creative solutions and innovative ideas through collaborative brainstorming sessions guided by industry experts.',
    color: 'bg-amber-50 text-amber-600',
    border: 'border-amber-200',
  },
  {
    icon: Target,
    title: 'Select',
    description:
      'Evaluate and choose the most viable concepts based on feasibility, impact, and alignment with user needs.',
    color: 'bg-blue-50 text-blue-600',
    border: 'border-blue-200',
  },
  {
    icon: Search,
    title: 'Identify',
    description:
      'Discover key opportunities and challenges through in-depth research and user-centred design methodologies.',
    color: 'bg-green-50 text-green-600',
    border: 'border-green-200',
  },
  {
    icon: Layers,
    title: 'Consolidate',
    description:
      'Integrate learnings and refine prototypes into production-ready solutions ready for real-world implementation.',
    color: 'bg-purple-50 text-purple-600',
    border: 'border-purple-200',
  },
]

export default function Process() {
  return (
    <section id="process" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <span className="accent-line" />
          </div>
          <h2 className="section-heading mb-4">Our Innovation Process</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            A structured four-step methodology that transforms ideas into impactful design solutions.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent z-10" />
                )}

                <div className={`card p-6 border-2 ${step.border} hover:-translate-y-1 transition-transform duration-300`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm ml-auto">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
