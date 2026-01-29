import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CImage,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import axios from 'axios'
import { getRole } from '../../../utils/auth'
import { toast } from 'react-toastify'
import { loginUser } from '../../../utils/api'
import dummy_logo from 'src/assets/brand/dummy_logo.png'


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {

      const payload = { email: email.trim(), password };

      // const response = await axios.post('http://localhost:8000/api/auth/login', payload, {
      //   headers: { 'Content-Type': 'application/json' },
      //   validateStatus: (s) => true,
      // })

      const response = await loginUser({ email, password });
      const data = response.data;
      if (data.success) {
        sessionStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.data))


        // Show success toast from backend message
        toast.success(data.message || 'Login successful', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        })


        const role = getRole()?.toLowerCase()

        // Redirect based on role
        if (role === 'owner') {
          navigate('/owner/dashboard', { replace: true })
        } else if (role === 'employee') {
          navigate('/employee/dashboard', { replace: true })
        } else {
          // fallback or unknown role
          setError('Unknown user role')
        }
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} sm={12} md={6} lg={6}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <div className='mx-auto text-center'>
                      <CImage src={dummy_logo} className='img-fluid' style={{ maxWidth: '15rem', width: '100%' }}></CImage>
                      {/* <h1 className='text-center'>Login</h1> */}
                      <p className="text-body-secondary text-center">Sign In to your account</p>
                    </div>
                    {error && (
                      <CAlert color="danger" dismissible onClose={() => setError(null)}>
                        {error}
                      </CAlert>
                    )}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Email/Username"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                       type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <CInputGroupText
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </CInputGroupText>
                    </CInputGroup>
                    <CRow className='text-center mx-auto'>
                      <CCol>
                        <CButton
                          className="buttonLabel px-4"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? 'Logging in...' : 'Login'}
                        </CButton>
                      </CCol>
                      {/* <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol> */}
                    </CRow>
                    <CRow className='mt-2 text-center'>
                      <p>Dont have and account?{' '}
                        <Link to="/register" style={{ textDecoration: "none" }}>
                          Register Now!
                        </Link></p>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              {/* <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard> */}
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
