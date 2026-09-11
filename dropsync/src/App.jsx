import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import Room from './pages/Room'
import { useTheme } from './context/ThemeContext'

export default function App() {
  const { theme } = useTheme()

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2400,
          style: {
            background: theme === 'dark' ? '#18191D' : '#ffffff',
            color: theme === 'dark' ? '#FAFAF8' : '#15161A',
            border: `1px solid ${theme === 'dark' ? '#2A2B30' : '#E6E4DF'}`,
            borderRadius: '12px',
            fontSize: '13px',
            boxShadow: '0 8px 24px -8px rgba(0,0,0,0.18)',
          },
          success: { iconTheme: { primary: '#1FAE6E', secondary: 'white' } },
          error: { iconTheme: { primary: '#E8543D', secondary: 'white' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
