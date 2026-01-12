import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer id="footer" className="py-12 px-6 bg-slate-900 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo */}
          <Link to="/" className="font-semibold text-white text-lg">
            UpLevel Automations
          </Link>

          {/* Contact */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-slate-400">
            <a
              href="mailto:roy@uplevelautomations.com"
              className="hover:text-white transition-colors"
            >
              roy@uplevelautomations.com
            </a>
            <a
              href="tel:+13013857585"
              className="hover:text-white transition-colors"
            >
              +1 (301) 385-7585
            </a>
            <a
              href="https://www.linkedin.com/in/roybanwell/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-700 text-center text-sm text-slate-500">
          &copy; 2026 UpLevel Automations. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
