import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Assessment from './pages/Assessment'
import ProcessMapper from './pages/ProcessMapper'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ai-readiness" element={<Assessment />} />
        <Route path="/process-mapper" element={<ProcessMapper />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
