import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes, Navigate, BrowserRouter } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import  './assets/css/commonStyle.css'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'

import { isAuthenticated, getRole } from './utils/auth'
import PublicRoute from './route/PublicRoute'
import ProtectedRoute from './route/ProtectedRoute'
import { ToastContainer } from 'react-toastify'
import CustomSpinner from './components/custom/CustomSpinner'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const Unauthorized = React.lazy(
  () => import('./views/pages/unauthorized/Unauthorized')
)


const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme);
      return;
    }

    if (isColorModeSet()) {
      return;
    }

    // setColorMode(storedTheme)
    setColorMode(storedTheme || 'light')

  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    // <HashRouter>
    //   <Suspense
    //     fallback={
    //       <div className="pt-3 text-center">
    //         <CSpinner color="primary" variant="grow" />
    //       </div>
    //     }
    //   >
    //     <Routes>
    //       <Route exact path="/login" name="Login Page" element={<Login />} />
    //       <Route exact path="/register" name="Register Page" element={<Register />} />
    //       <Route exact path="/404" name="Page 404" element={<Page404 />} />
    //       <Route exact path="/500" name="Page 500" element={<Page500 />} />
    //       <Route path="*" name="Home" element={<DefaultLayout />} />
    //     </Routes>
    //   </Suspense>
    // </HashRouter>

    <BrowserRouter>
      {/* ToastContainer placed once at top-level */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* <Suspense fallback={<CSpinner color="primary" />}> */}
      <Suspense fallback={<CustomSpinner/>}>
        <Routes>

          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Owner Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
            <Route path="/owner/*" element={<DefaultLayout />} />
          </Route>

          {/* Employee Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
            <Route path="/employee/*" element={<DefaultLayout />} />
          </Route>

          {/* Root Route */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                getRole() === 'owner'
                  ? <Navigate to="/owner/dashboard" replace />
                  : <Navigate to="/employee/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="*" element={<Page404 />} />
          <Route path="/404" element={<Page404 />} />


        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
