import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Profile from './pages/Profile'
import About from './pages/About'
import Nav from './components/navigation/Nav'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="/signup" element={<SignUp />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/nav" element={<Nav />}>
        <Route path="home" element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="about" element={<About />} />
      </Route>
    </Route>
  )
);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
