import { createRoot } from 'react-dom/client'
import './global.css'
import { AppRouts } from './routes/routes'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <AppRouts />
    </BrowserRouter>
)
