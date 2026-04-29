import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import TaskForm from './pages/TaskForm.jsx'
import InvoiceList from './pages/InvoiceList.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App>
        <Routes>
          <Route path="/" element={<TaskForm />} />
          <Route path="/invoices" element={<InvoiceList />} />
        </Routes>
      </App>
    </BrowserRouter>
  </StrictMode>,
)
