import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Profile from './pages/Profile'
import About from './pages/About'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route index element={<SignUp/>}/>
      <Route path='signin' element={<SignIn/>}/>
      <Route path='home' element={<Home/>}>
      <Route path='profile' element={<Profile/>}/>
      <Route path='about' element={<About/>}/>
      </Route>
    </Route>
  )
)

function App() {

  return (
    <>
    <RouterProvider router={router}/>
    </>
  )
}

export default App
