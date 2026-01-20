import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { cilUser, cilLockLocked, cilEnvelopeClosed, cilScreenSmartphone } from '@coreui/icons'
import axios from 'axios'
import { register } from '../../../utils/api'

import dummy_logo from 'src/assets/brand/dummy_logo.png'

const Register = () => {
  const navigate = useNavigate()

  // Step states
  const [step, setStep] = useState(1)

  // Organization state
  const [organizationName, setOrganizationName] = useState('')
  const [organizationEmail, setOrganizationEmail] = useState('')
  const [organizationContactNumber, setOrganizationContactNumber] = useState('')

  // Admin state
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPhoneNumber, setAdminPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [errorMessages, setErrorMessages] = useState([]);


  const [loading, setLoading] = useState(false);


  const validateStep1 = () => {
    const newErrors = {}

    if (!organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required'
    }

    if (!organizationEmail.trim()) {
      newErrors.organizationEmail = 'Organization email is required'
    } else if (!/\S+@\S+\.\S+/.test(organizationEmail)) {
      newErrors.organizationEmail = 'Invalid email address'
    }

    if (!organizationContactNumber.trim()) {
      newErrors.organizationContactNumber = 'Contact number is required'
    } else if (!/^\d+$/.test(organizationContactNumber)) {
      newErrors.organizationContactNumber = 'Only numbers are allowed'
    } else if (organizationContactNumber.length !== 10) {
      newErrors.organizationContactNumber =
        'Contact number must be exactly 10 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  };

  const validateStep2 = () => {
    const newErrors = {}

    if (!adminName.trim()) {
      newErrors.adminName = 'Admin name is required'
    }

    if (!adminEmail.trim()) {
      newErrors.adminEmail = 'Admin email is required'
    } else if (!/\S+@\S+\.\S+/.test(adminEmail)) {
      newErrors.adminEmail = 'Invalid email address'
    }

    if (!adminPhoneNumber.trim()) {
      newErrors.adminPhoneNumber = 'Phone number is required'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!passwordConfirm) {
      newErrors.passwordConfirm = 'Confirm password is required'
    } else if (password !== passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  };

  // Save organization first
  const handleOrganizationSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!validateStep1()) return;
    setStep(2);
  }

  // Save organization + admin together
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setError(null)
    setLoading(true);
    setErrorMessages([]);

    try {
      const payload = {
        organization_name: organizationName.trim(),
        organization_email: organizationEmail.trim(),
        organization_contact: organizationContactNumber.trim(),
        name: adminName.trim(),
        email: adminEmail.trim(),
        phone_number: adminPhoneNumber.trim(),
        password: password,
        password_confirmation: passwordConfirm,
      }

      const response = await register(payload);

      const data = response.data;
      if (data.success) {
        // Save token and user
        sessionStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.data))

        // Redirect based on role
        if (data.data.role.toLowerCase() === 'owner') {
          navigate('/owner/dashboard', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
        return;
      }

      if (data.errors) {
        const messages = Object.values(data.errors).flat();
        setErrorMessages(messages);
      }

    } catch (err) {
      if (err.response?.status === 422) {
        const backendErrors = err.response.data?.errors || {};
        const messages = Object.values(backendErrors).flat();

        setErrorMessages(messages);
      }
      else {
        setErrorMessages([
          err.response?.data?.message || err.message || 'Something went wrong'
        ]);
      }
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
                  <div className='mx-auto text-center'>
                    {/* <h1 className="text-center">Register</h1> */}
                    <CImage src={dummy_logo}></CImage>
                    <p className="text-body-secondary text-center">
                      Create your organization and admin account
                    </p>
                  </div>

                  {/* {error && (
                    <CAlert color="danger" dismissible onClose={() => setError('')}>
                      {error}
                    </CAlert>
                  )} */}

                  {errorMessages.length > 0 && (
                    <CAlert
                      color="danger"
                      dismissible
                      onClose={() => setErrorMessages([])}
                    >
                      {errorMessages.length === 1 ? (
                        <div>{errorMessages[0]}</div>
                      ) : (
                        <ul className="mb-0">
                          {errorMessages.map((msg, index) => (
                            <li key={index}>{msg}</li>
                          ))}
                        </ul>
                      )}
                    </CAlert>
                  )}


                  {step === 1 && (
                    <CForm onSubmit={handleOrganizationSubmit}>
                      <CInputGroup className="mt-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Organization Name"
                          value={organizationName}
                          onChange={(e) => {
                            setOrganizationName(e.target.value)
                            setErrors({ ...errors, organizationName: '' })
                          }}
                        />
                      </CInputGroup>
                      <small className="text-danger">{errors.organizationName}</small>

                      <CInputGroup className="mt-3">
                        <CInputGroupText>
                          <CIcon icon={cilEnvelopeClosed} />
                        </CInputGroupText>
                        <CFormInput
                          type="email"
                          placeholder="Organization Email"
                          value={organizationEmail}
                          onChange={(e) => {
                            setOrganizationEmail(e.target.value)
                            setErrors({ ...errors, organizationEmail: '' })
                          }}
                        />
                      </CInputGroup>
                      <small className="text-danger">{errors.organizationEmail}</small>

                      <CInputGroup className="mt-3">
                        <CInputGroupText>
                          <CIcon icon={cilScreenSmartphone} />
                        </CInputGroupText>
                        <CFormInput
                          type="text"
                          placeholder="Organization Contact"
                          value={organizationContactNumber}
                          // onChange={(e) => setOrganizationContactNumber(e.target.value)}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 10)
                            setOrganizationContactNumber(value)
                            setErrors({
                              ...errors,
                              organizationContactNumber: '',
                            })
                          }}
                        />
                      </CInputGroup>
                      <small className="text-danger">
                        {errors.organizationContactNumber}
                      </small>

                      {/* <CButton color="primary" type="submit" disabled={loading} className="w-100">
                        {loading ? 'Saving...' : 'Next'}
                      </CButton> */}

                      <div className='d-flex justify-content-between mt-3'>
                        <CButton className='buttonLabel-inverse' type="button" onClick={() => navigate('/login')}>
                          Cancel
                        </CButton>
                        <CButton className='buttonLabel' type="submit" disabled={loading}>
                          {loading ? 'Saving...' : 'Next'}
                        </CButton>
                      </div>
                    </CForm>
                  )}

                  {step === 2 && (
                    <CForm onSubmit={handleRegister}>
                      <CInputGroup className="mt-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Admin Name"
                          value={adminName}
                          onChange={(e) => {
                            setAdminName(e.target.value)
                            setErrors({ ...errors, adminName: '' })
                          }}
                        />
                      </CInputGroup>
                      <small className="text-danger">{errors.adminName}</small>

                      <CInputGroup className="mt-3">
                        <CInputGroupText>
                          <CIcon icon={cilEnvelopeClosed} />
                        </CInputGroupText>
                        <CFormInput
                          type="email"
                          placeholder="Admin Email"
                          value={adminEmail}
                          onChange={(e) => {
                            setAdminEmail(e.target.value)
                            setErrors({ ...errors, adminEmail: '' })
                          }}
                        />
                      </CInputGroup>
                      <small className="text-danger">{errors.adminEmail}</small>

                      <CInputGroup className="mt-3">
                        <CInputGroupText>
                          <CIcon icon={cilScreenSmartphone} />
                        </CInputGroupText>
                        <CFormInput
                          type="tel"
                          placeholder="Admin Phone Number"
                          value={adminPhoneNumber}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 10)
                            setAdminPhoneNumber(value)
                            setErrors({ ...errors, adminPhoneNumber: '' })
                          }}
                        />
                      </CInputGroup>
                      <small className="text-danger">{errors.adminPhoneNumber}</small>

                      <CInputGroup className="mt-3">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            setErrors({ ...errors, password: '' })
                          }}
                        />
                        <CInputGroupText
                          style={{ cursor: 'pointer' }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </CInputGroupText>
                      </CInputGroup>
                      <small className="text-danger">{errors.password}</small>

                      <CInputGroup className="mt-3">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm Password"
                          value={passwordConfirm}
                          onChange={(e) => {
                            setPasswordConfirm(e.target.value)
                            setErrors({ ...errors, passwordConfirm: '' })
                          }}
                        />
                        <CInputGroupText
                          style={{ cursor: 'pointer' }}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? 'Hide' : 'Show'}
                        </CInputGroupText>
                      </CInputGroup>
                      <small className="text-danger">
                        {errors.passwordConfirm}
                      </small>

                      {/* <CButton color="primary" type="submit" disabled={loading} className="w-100">
                        {loading ? 'Registering...' : 'Register'}
                      </CButton> */}

                      <div className='d-flex justify-content-between mt-3'>
                        <CButton className='buttonLabel-inverse' type="button" onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setStep(1);
                        }}>
                          Cancel
                        </CButton>
                        <CButton className='buttonLabel' type="submit" disabled={loading}>
                          {loading ? 'Registering...' : 'Register'}
                        </CButton>
                      </div>
                    </CForm>
                  )}
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
