import Navbar from './components/Navbar'

function App({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">
      <Navbar />
      <main className="pt-4 pb-12">
        {children}
      </main>
    </div>
  )
}

export default App
