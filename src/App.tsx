import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/layout/Layout'
import Courses from './pages/Courses'
import LearnUnit from './pages/LearnUnit'
import Practice from './pages/Practice'
import WordBook from './pages/WordBook'
import ProgressPage from './pages/Progress'
import Achievements from './pages/Achievements'
import Review from './pages/Review'
import Leaderboard from './pages/Leaderboard'

function App() {
  const basename = import.meta.env.VITE_BASE_PATH || '/'
  return (
    <BrowserRouter basename={basename}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Layout><Courses /></Layout>} />
          <Route path="/learn/:unitId" element={<Layout><LearnUnit /></Layout>} />
          <Route path="/practice/:unitId" element={<Layout><Practice /></Layout>} />
          <Route path="/wordbook" element={<Layout><WordBook /></Layout>} />
          <Route path="/progress" element={<Layout><ProgressPage /></Layout>} />
          <Route path="/achievements" element={<Layout><Achievements /></Layout>} />
          <Route path="/review" element={<Layout><Review /></Layout>} />
          <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
