import React, { useEffect, useState } from 'react'
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
import {
    cilEnvelopeClosed,
    cilLockLocked,
    cilScreenSmartphone,
    cilUser,
} from '@coreui/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { getEmployeeById, updateEmployee } from '../../../utils/api'
import { toast } from 'react-toastify'
import CustomSpinner from '../../../components/custom/CustomSpinner'

const UpdateEmployee = () => {
    const { id } = useParams()
    const navigate = useNavigate()

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

    const fetchEmployee = async () => {
        try {
            setLoading(true)
            const res = await getEmployeeById(id);

            if (res.data.success) {
                setForm({
                    name: res.data.data.name || '',
                    email: res.data.data.email || '',
                    phone_number: res.data.data.phone_number || '',
                    password: '',
                    confirm_password: '',
                })
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    /* Fetch employee details */
    useEffect(() => {
        fetchEmployee();
    }, [id])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const newErrors = {}
        if (!form.name) newErrors.name = 'Name is required'
        if (!form.email) newErrors.email = 'Email is required'
        if (!form.phone_number) newErrors.phone_number = 'Phone number is required'
        if (form.password && form.password !== form.confirm_password) {
            newErrors.confirm_password = "Passwords don't match"
        }

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) {
            setLoading(false)
            return
        }

        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            phone_number: form.phone_number.trim(),
        }

        // Send password only if updated
        if (form.password) {
            payload.password = form.password
            payload.password_confirmation = form.confirm_password
        }

        try {
            const res = await updateEmployee(id, payload);

            if (res.data.success) {
                toast.success(res.data.message || 'Employee updated successfully');
                navigate('/owner/employee/list', { replace: true });
            } else {
                setErrors(res.data.errors || {})
            }
        } catch (err) {
            setErrors(err.response?.data?.errors || {})
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="text-center mt-5">
                <CustomSpinner />
            </div>
        );
    }
    return (
        <CCard className="mb-4 shadow-sm">
            <CCardHeader>
                <h5 className="mb-0">Update Employee</h5>
            </CCardHeader>

            <CCardBody>
                <CForm>
                    {/* Name */}
                    <div className="mb-3">
                        <CFormLabel>Name</CFormLabel>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilUser} />
                            </CInputGroupText>
                            <CFormInput
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                invalid={!!errors.name}
                            />
                            <CFormFeedback invalid>{errors.name}</CFormFeedback>
                        </CInputGroup>
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                        <CFormLabel>Email</CFormLabel>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilEnvelopeClosed} />
                            </CInputGroupText>
                            <CFormInput
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                invalid={!!errors.email}
                            />
                            <CFormFeedback invalid>{errors.email}</CFormFeedback>
                        </CInputGroup>
                    </div>

                    {/* Phone */}
                    <div className="mb-3">
                        <CFormLabel>Phone Number</CFormLabel>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilScreenSmartphone} />
                            </CInputGroupText>
                            <CFormInput
                                name="phone_number"
                                value={form.phone_number}
                                onChange={handleChange}
                                invalid={!!errors.phone_number}
                            />
                            <CFormFeedback invalid>{errors.phone_number}</CFormFeedback>
                        </CInputGroup>
                    </div>

                    {/* Password (Optional) */}
                    <div className="mb-3">
                        <CFormLabel>New Password (optional)</CFormLabel>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilLockLocked} />
                            </CInputGroupText>
                            <CFormInput
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                            />
                            <CInputGroupText
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: 'pointer' }}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </CInputGroupText>
                        </CInputGroup>
                    </div>

                    {/* Confirm Password */}
                    {form.password && (
                        <div className="mb-3">
                            <CFormLabel>Confirm Password</CFormLabel>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilLockLocked} />
                                </CInputGroupText>
                                <CFormInput
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirm_password"
                                    value={form.confirm_password}
                                    onChange={handleChange}
                                    invalid={!!errors.confirm_password}
                                />
                                <CInputGroupText
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    style={{ cursor: 'pointer' }}
                                >
                                    {showConfirmPassword ? 'Hide' : 'Show'}
                                </CInputGroupText>
                                <CFormFeedback invalid>
                                    {errors.confirm_password}
                                </CFormFeedback>
                            </CInputGroup>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <CButton className='buttonLabel' onClick={handleSubmit} disabled={loading}>
                            {loading ? <CSpinner size="sm" /> : 'Update'}
                        </CButton>
                        <CButton
                            className='buttonLabel-inverse'
                            variant="outline"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </CButton>
                    </div>
                </CForm>
            </CCardBody>
        </CCard>
    )
}

export default UpdateEmployee
