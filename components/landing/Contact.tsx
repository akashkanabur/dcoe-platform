'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const contactItems = [
  { icon: MapPin, label: 'Address', lines: ['Department of Design and Manufacturing', 'Gulmohar Marg, Devasandra Layout', 'Indian Institute of Science Campus', 'Bengaluru – 560012'] },
  { icon: Phone, label: 'Phone', lines: ['+91 7204830111'] },
  { icon: Mail, label: 'Email', lines: ['dcoe@fsid-iisc.in'] },
  { icon: Clock, label: 'Hours', lines: ['Mon–Fri: 9:30 am – 5:30 pm'] },
]

export default function Contact() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organisation: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.message) {
      toast.error('Please fill in required fields')
      return
    }
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast.success('Message sent! We\'ll get back to you soon.')
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      organisation: '',
      message: ''
    })
    setLoading(false)
  }

  const updateForm = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
  }

  return (
    <section id="contact" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="mb-4"><span className="accent-line" /></div>
            <h2 className="section-heading mb-4">Get in Touch</h2>
            <p className="section-subtitle mb-8">Have questions? Reach out to us and our team will get back to you promptly.</p>
            <div className="space-y-6">
              {contactItems.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-dcoe-green/10 text-dcoe-green flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</div>
                      {item.lines.map((line, j) => (
                        <div key={j} className="text-gray-700 text-sm">{line}</div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="card p-8">
            <h3 className="font-display text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input 
                    type="text" 
                    placeholder="" 
                    className="input" 
                    value={form.firstName}
                    onChange={e => updateForm('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="" 
                    className="input" 
                    value={form.lastName}
                    onChange={e => updateForm('lastName', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="" 
                  className="input" 
                  value={form.email}
                  onChange={e => updateForm('email', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Organisation</label>
                <input 
                  type="text" 
                  placeholder="Company / Institution" 
                  className="input" 
                  value={form.organisation}
                  onChange={e => updateForm('organisation', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea 
                  rows={4} 
                  required
                  placeholder="Tell us how we can help you..." 
                  className="input resize-none" 
                  value={form.message}
                  onChange={e => updateForm('message', e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full justify-center"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
