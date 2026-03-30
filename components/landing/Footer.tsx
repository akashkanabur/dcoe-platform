import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-dcoe-green rounded-lg flex items-center justify-center">
                <span className="text-black font-display font-bold text-sm">D</span>
              </div>
              <div>
                <div className="text-white font-display font-bold text-sm">D-CoE</div>
                <div className="text-gray-500 text-xs">Centre of Excellence in Design</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">A premier initiative by IISc Bengaluru, backed by the Government of Karnataka, advancing design education in India.</p>
          </div>
          <div>
            <div className="text-white font-semibold text-sm mb-4">Quick Links</div>
            <div className="space-y-2 text-sm">
              {['#about', '#courses', '#process', '#contact'].map((href) => (
                <a key={href} href={href} className="block hover:text-white transition-colors capitalize">{href.replace('#', '')}</a>
              ))}
            </div>
          </div>
          <div>
            <div className="text-white font-semibold text-sm mb-4">Platform</div>
            <div className="space-y-2 text-sm">
              <Link href="/auth/login" className="block hover:text-white transition-colors">Student Login</Link>
              <Link href="/auth/signup" className="block hover:text-white transition-colors">Register</Link>
              <Link href="/auth/login?role=trainer" className="block hover:text-white transition-colors">Trainer Login</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div>© {new Date().getFullYear()} D-CoE, IISc Bengaluru. All rights reserved.</div>
          <div className="text-xs">Department of Design and Manufacturing · Indian Institute of Science</div>
        </div>
      </div>
    </footer>
  )
}
