import { RouterProvider } from 'react-router-dom'
import router from './router/index'
import MessageContainer from './components/Message'

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <MessageContainer />
    </>
  )
}

export default App
