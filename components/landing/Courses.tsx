'use client'
import { motion } from 'framer-motion'
import { Clock, ArrowRight, Layers, Cpu, Brain, Eye, Users, Box, Wrench, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const courses = [
  { icon: Box, title: 'One Day Workshop on Product Design & Innovation', description: 'An intensive one-day immersion into the fundamentals of product design, covering ideation, sketching, and rapid prototyping techniques.', duration: '1 Day', level: 'Beginner' },
  { icon: Cpu, title: 'Industry 4.0 Technologies', description: 'Explore the convergence of AI, IoT, robotics, and advanced manufacturing driving the fourth industrial revolution.', duration: '4 Weeks', level: 'Intermediate' },
  { icon: Brain, title: 'Design Thinking and Methodology', description: 'Master the human-centred design process from empathy mapping to solution prototyping.', duration: '6 Weeks', level: 'All Levels' },
  { icon: Eye, title: 'Aesthetics and Semiotics', description: 'Understand how visual language, symbols, and aesthetics shape user perception and product identity.', duration: '4 Weeks', level: 'Intermediate' },
  { icon: Users, title: 'Ergonomics and Human Factors', description: 'Design products optimised for human use — safety, comfort, efficiency, and usability at the core.', duration: '4 Weeks', level: 'Intermediate' },
  { icon: Layers, title: 'Design Prototyping', description: 'From low-fidelity wireframes to high-fidelity digital prototypes — tools, methods, and best practices.', duration: '5 Weeks', level: 'All Levels' },
  { icon: Wrench, title: 'Mechanical Prototyping', description: 'Hands-on experience with CNC machining, 3D printing, and workshop tools to bring physical concepts to life.', duration: '6 Weeks', level: 'Intermediate' },
  { icon: Zap, title: 'Electronic Prototyping', description: 'Build smart, connected prototypes using microcontrollers, sensors, and PCB design for IoT systems.', duration: '6 Weeks', level: 'Advanced' },
  { icon: TrendingUp, title: 'Business Development & Entrepreneurship', description: 'Turn your design ideas into viable businesses — market research, business models, pitching, and startups.', duration: '4 Weeks', level: 'All Levels' },
]

const levelColor = { 'Beginner': 'bg-green-100 text-green-700', 'Intermediate': 'bg-blue-100 text-blue-700', 'Advanced': 'bg-purple-100 text-purple-700', 'All Levels': 'bg-gray-100 text-gray-700' }

export default function Courses() {
  return (
    <section id="courses" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="flex justify-center mb-4"><span className="accent-line" /></div>
          <h2 className="section-heading mb-4">Our Courses</h2>
          <p className="section-subtitle max-w-2xl mx-auto">Carefully crafted programs blending theory with hands-on practice, guided by IISc faculty and industry experts.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => {
            const Icon = course.icon
            return (
              <motion.div key={course.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }} className="group card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-dcoe-green/10 text-dcoe-green flex items-center justify-center mb-4 group-hover:bg-dcoe-green group-hover:text-white transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-gray-900 mb-2 leading-snug text-base">{course.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4">{course.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                  </div>
                  <Link href="/auth/signup" className="flex items-center gap-1 text-dcoe-green text-sm font-semibold hover:gap-2 transition-all duration-200">
                    Enroll <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
