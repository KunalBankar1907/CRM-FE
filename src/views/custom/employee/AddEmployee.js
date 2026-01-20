import React, { useState } from 'react'
import {
    CCard,
    CCardHeader,
    CCardBody,
    CForm,
    CFormInput,
    CFormLabel,
    CButton,
    CSpinner,
    CInputGroup,
    CInputGroupText,
    CFormFeedback,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeClosed, cilLockLocked, cilPhone, cilScreenSmartphone, cilUser } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { addEmployee } from '../../../utils/api'

const AddEmployee = () => {
    const [isEditMode, setIsEditMode] = useState(true)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
    })
    const [errors, setErrors] = useState({})
    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const organization_id = currentUser?.organization_id;

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'name') {
            newValue = value.replace(/[^a-zA-Z\s]/g, '');
        }

        if (name === 'phone_number') {
            // newValue = value.replace(/\D/g, '');
            newValue = value.replace(/\D/g, '').slice(0, 10);

        }

        setForm(prev => ({
            ...prev,
            [name]: newValue
        }));
        // setForm({ ...form, [e.target.name]: e.target.value })

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        // Simple validation example
        const newErrors = {}
        if (!form.name) newErrors.name = 'Name is required'
        if (!form.email) newErrors.email = 'Email is required'
        if (!form.phone_number) newErrors.phone_number = 'Phone number is required'
        if (!form.password) newErrors.password = 'Password is required'
        if (form.password !== form.confirm_password)
            newErrors.confirm_password = "Passwords don't match"

        setErrors(newErrors)

        if (Object.keys(newErrors).length > 0) {
            setLoading(false)
            return
        }

        // Prepare payload
        const payload = {
            organization_id: organization_id,
            name: form.name.trim(),
            email: form.email.trim(),
            phone_number: form.phone_number.trim(),
            password: form.password,
            password_confirmation: form.confirm_password,
        }

        try {
            // Call API
            const response = await addEmployee(payload);
            const data = response.data

            if (data.success) {

                // Clear form or redirect
                setForm({
                    name: '',
                    email: '',
                    phone_number: '',
                    password: '',
                    confirm_password: '',
                })
                navigate('/owner/employee/list', { replace: true });
            } else if (response.status === 422 && response.data.errors) {
                // Map backend errors to state
                const formattedErrors = Object.keys(response.data.errors).reduce((acc, key) => {
                    acc[key] = response.data.errors[key][0]
                    return acc
                }, {})
                setErrors(formattedErrors)
            } else {
                setErrors({ global: response?.data?.message || 'Something went wrong' })
            }
        } catch (err) {
            setErrors(err.response?.data?.message || err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }

    }

    return (
        <>
            <CCard className="mb-4 shadow-sm">
                <CCardHeader className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Add Employee</h5>
                    <div className="d-flex align-items-center gap-2">
                        <CButton
                            size="sm"
                            className='buttonLabel'
                            style={{ minHeight: '32px', padding: '0 1rem', fontSize: '0.875rem' }}
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </CButton>
                    </div>
                </CCardHeader>

                <CCardBody>
                    <CForm>
                        {/* Name */}
                        <div className="mb-3">
                            <CFormLabel>Name <span className='required-sign'>*</span></CFormLabel>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilUser} />
                                </CInputGroupText>
                                <CFormInput
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    readOnly={!isEditMode}
                                    invalid={!!errors.name}
                                    placeholder="Enter full name"
                                />
                            </CInputGroup>
                            <CFormFeedback className="text-danger" style={{ fontSize: "0.8rem" }}>{errors.name}</CFormFeedback>
                        </div>

                        {/* Email */}
                        <div className="mb-3">
                            <CFormLabel>Email <span className='required-sign'>*</span></CFormLabel>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilEnvelopeClosed} />
                                </CInputGroupText>
                                <CFormInput
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    readOnly={!isEditMode}
                                    invalid={!!errors.email}
                                    placeholder="Enter email"
                                />
                            </CInputGroup>
                            <CFormFeedback className="text-danger" style={{ fontSize: "0.8rem" }}>{errors.email}</CFormFeedback>
                        </div>

                        {/* Phone Number */}
                        <div className="mb-3">
                            <CFormLabel>Phone Number <span className='required-sign'>*</span></CFormLabel>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilScreenSmartphone} />
                                </CInputGroupText>
                                <CFormInput
                                    name="phone_number"
                                    value={form.phone_number}
                                    onChange={handleChange}
                                    readOnly={!isEditMode}
                                    invalid={!!errors.phone_number}
                                    placeholder="Enter phone number"
                                />
                            </CInputGroup>
                            <CFormFeedback className="text-danger" style={{ fontSize: "0.8rem" }} >{errors.phone_number}</CFormFeedback>
                        </div>

                        {/* Password */}
                        <div className="mb-3">
                            <CFormLabel>Password <span className='required-sign'>*</span></CFormLabel>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilLockLocked} />
                                </CInputGroupText>
                                <CFormInput
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    readOnly={!isEditMode}
                                    invalid={!!errors.password}
                                    placeholder="Enter password"
                                />
                                <CInputGroupText
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </CInputGroupText>
                            </CInputGroup>
                            <CFormFeedback className="text-danger" style={{ fontSize: "0.8rem" }} >{errors.password}</CFormFeedback>
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-3">
                            <CFormLabel>Confirm Password <span className='required-sign'>*</span></CFormLabel>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilLockLocked} />
                                </CInputGroupText>
                                <CFormInput
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirm_password"
                                    value={form.confirm_password}
                                    onChange={handleChange}
                                    readOnly={!isEditMode}
                                    invalid={!!errors.confirm_password}
                                    placeholder="Confirm password"
                                />
                                <CInputGroupText
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? 'Hide' : 'Show'}
                                </CInputGroupText>
                            </CInputGroup>
                            <CFormFeedback className="text-danger" style={{ fontSize: "0.8rem" }} >{errors.confirm_password}</CFormFeedback>
                        </div>

                        {/* Save / Cancel Buttons at the bottom */}
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <CButton className='buttonLabel' onClick={handleSubmit} disabled={loading}>
                                {loading ? <CSpinner size="sm" /> : 'Save'}
                            </CButton>
                            <CButton
                                className='buttonLabel-inverse'
                                variant="outline"
                                onClick={() => setIsEditMode(false)}
                            >
                                Cancel
                            </CButton>
                        </div>
                    </CForm>
                </CCardBody>
            </CCard>
            <style>{`
                .required-sign{
                    color:red;
            `}
            </style>
        </>
    )
}

export default AddEmployee
