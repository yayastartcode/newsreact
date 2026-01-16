import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ArticleList from './pages/ArticleList'
import ArticleEditor from './pages/ArticleEditor'
import Categories from './pages/Categories'
import Tags from './pages/Tags'
import MediaLibrary from './pages/MediaLibrary'
import Users from './pages/Users'
import Ads from './pages/Ads'
import Pages from './pages/Pages'
import PageEditor from './pages/PageEditor'
import MenuManager from './pages/MenuManager'
import Settings from './pages/Settings'

function PrivateRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div className="loading">Loading...</div>
    }

    return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
    const { isAdmin, loading } = useAuth()

    if (loading) {
        return <div className="loading">Loading...</div>
    }

    return isAdmin ? children : <Navigate to="/" />
}

export default function App() {
    const { user, loading } = useAuth()

    if (loading) {
        return <div className="loading">Loading...</div>
    }

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="articles" element={<ArticleList />} />
                <Route path="articles/new" element={<ArticleEditor />} />
                <Route path="articles/:id/edit" element={<ArticleEditor />} />
                <Route path="pages" element={<AdminRoute><Pages /></AdminRoute>} />
                <Route path="pages/new" element={<AdminRoute><PageEditor /></AdminRoute>} />
                <Route path="pages/:id" element={<AdminRoute><PageEditor /></AdminRoute>} />
                <Route path="categories" element={<AdminRoute><Categories /></AdminRoute>} />
                <Route path="tags" element={<AdminRoute><Tags /></AdminRoute>} />
                <Route path="media" element={<MediaLibrary />} />
                <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
                <Route path="ads" element={<AdminRoute><Ads /></AdminRoute>} />
                <Route path="menu" element={<AdminRoute><MenuManager /></AdminRoute>} />
                <Route path="settings" element={<AdminRoute><Settings /></AdminRoute>} />
            </Route>
        </Routes>
    )
}

