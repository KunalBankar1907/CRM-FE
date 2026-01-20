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
                setLoading(false);
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
        e.preventDefault();
        setLoading(true);
        setErrors({});

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
            return;
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
            const response = await updateEmployee(id, payload);
            const data = response.data;
            if (data.success) {
                toast.success(data.message || 'Employee updated successfully');
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
            setErrors(err.response?.data?.errors || {})
        } finally {
            setLoading(false);
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
        <>
            <CCard className="mb-4 shadow-sm">
                <CCardHeader className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Update Employee</h5>
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
                                    invalid={!!errors.name}
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
                                    invalid={!!errors.email}
                                />
                            </CInputGroup>
                            <CFormFeedback className="text-danger" style={{ fontSize: "0.8rem" }}>{errors.email}</CFormFeedback>
                        </div>

                        {/* Phone */}
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
                                    invalid={!!errors.phone_number}
                                />
                            </CInputGroup>
                            <CFormFeedback className="text-danger" style={{ fontSize: "0.8rem" }} >{errors.phone_number}</CFormFeedback>
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
                                </CInputGroup>
                                <CFormFeedback className="text-danger" style={{ fontSize: "0.8rem" }} >{errors.confirm_password}</CFormFeedback>
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
            <style>{`
                .required-sign{
                    color:red;
            `}
            </style>
        </>
    )
}

export default UpdateEmployee
