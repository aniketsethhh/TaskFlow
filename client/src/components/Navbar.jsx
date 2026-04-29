import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-indigo-600/95 shadow-lg shadow-indigo-500/20 border-b border-indigo-500/30">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors duration-300">
            <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
            </svg>
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">
            TaskFlow
          </span>
        </NavLink>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white/20 text-white shadow-inner'
                  : 'text-indigo-100 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Log Task
            </span>
          </NavLink>
          <NavLink
            to="/invoices"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white/20 text-white shadow-inner'
                  : 'text-indigo-100 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              All Invoices
            </span>
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
