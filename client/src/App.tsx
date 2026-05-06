import { RouterProvider } from 'react-router-dom'
import router from './router/index'
import MessageContainer from './components/Message'
import { NotificationProvider } from './context/NotificationContext'

function App() {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
      <MessageContainer />
    </NotificationProvider>
  )
}

export default App
