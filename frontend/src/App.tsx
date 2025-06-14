import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Game from './pages/Game'
import Room from './pages/Room'
import { AppContextProvider } from './Context/AppContext'

export default function App() {
  
  return (
    <BrowserRouter>
    <AppContextProvider>
      <Routes>
        <Route path="/" element={<Room />} />
        <Route path="/game/:id" element={<Game />} />
      </Routes>
      </AppContextProvider>
    </BrowserRouter>
  )
}
