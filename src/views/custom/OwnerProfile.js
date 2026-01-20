// OwnerProfile.js
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
    CImage,
    CRow,
    CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeClosed, cilLockLocked, cilScreenSmartphone, cilUser, cilStar, cilAccountLogout } from '@coreui/icons'
import { toast } from 'react-toastify'
import CustomSpinner from '../../components/custom/CustomSpinner'
import { getMyProfile, updateMyProfile } from '../../utils/api'
import { IMAGE_BASE_URL } from '../../utils/helper'

const OwnerProfile = () => {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone_number: '',
        role: '',
        password: '',
        confirm_password: '',
        profile_pic: null,
    })
    const [errors, setErrors] = useState({})
    const [profilePreview, setProfilePreview] = useState('')

    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)
                const res = await getMyProfile()
                if (res.data.success) {
                    const data = res.data.data
                    setForm({
                        name: data.name || '',
                        email: data.email || '',
                        phone_number: data.phone_number || '',
                        role: data.role || '',
                        password: '',
                        confirm_password: '',
                        profile_pic: data.profile_pic || '',
                    })
                    setProfilePreview(data.profile_pic || '')
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {

            if (img.width !== 200 || img.height !== 200) {
                toast.error("Profile picture must be 200x200 pixels")
                e.target.value = ""
                URL.revokeObjectURL(objectUrl)
                return
            }

            setForm((prev) => ({ ...prev, profile_pic: file }))
            setProfilePreview(objectUrl)
        }
        img.onerror = () => {
            toast.error('Invalid image file')
            e.target.value = ''
            URL.revokeObjectURL(objectUrl)
        }
        img.src = objectUrl
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const newErrors = {}

        if (!form.name) newErrors.name = 'Name is required'
        if (!form.email) newErrors.email = 'Email is required'
        if (!form.phone_number) newErrors.phone_number = 'Phone number is required'
        if (form.password && form.password !== form.confirm_password)
            newErrors.confirm_password = "Passwords don't match"

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) {
            setLoading(false)
            return
        }

        try {
            const payload = new FormData()
            payload.append('name', form.name)
            payload.append('email', form.email)
            payload.append('phone_number', form.phone_number)
            payload.append('role', form.role)
            if (form.password) {
                payload.append('password', form.password)
                payload.append('password_confirmation', form.confirm_password)
            }
            if (form.profile_pic instanceof File) payload.append('profile_pic', form.profile_pic)

            const res = await updateMyProfile(payload)
            if (res.data.success) {
                toast.success(res.data.message || 'Profile updated successfully!')
                setForm({ ...form, password: '', confirm_password: '', profile_pic: null })

                const updatedProfilePic = res.data.data?.profile_pic || null
                if (updatedProfilePic) setProfilePreview(updatedProfilePic);

                const currentUser = JSON.parse(localStorage.getItem('user'))
                if (currentUser) {
                    const updatedUser = {
                        ...currentUser,
                        name: res.data.data.name,
                        email: res.data.data.email,
                        phone_number: res.data.data.phone_number,
                        profile_pic: updatedProfilePic,
                    }

                    localStorage.setItem('user', JSON.stringify(updatedUser))

                    window.dispatchEvent(
                        new CustomEvent('profile-updated', { detail: updatedUser.profile_pic })
                    )
                }


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
        )
    }

    return (
        <CCard className="mb-4 shadow-sm">
            <CCardHeader>
                <h5 className="mb-0">My Profile</h5>
            </CCardHeader>
            <CCardBody>
                <CForm onSubmit={handleSubmit}>
                    {/* Profile Picture */}
                    <CRow className="mb-4">
                        <CCol md={6}>
                            {profilePreview ? (
                                <CImage
                                    rounded
                                    thumbnail
                                    width={120}
                                    height={120}
                                    // src={profilePreview}
                                    src={profilePreview.startsWith('blob:') ? profilePreview : `${IMAGE_BASE_URL}/uploads/${profilePreview}`}
                                    style={{ objectFit: 'cover', border: '1px solid #ccc', borderRadius: '25%' }}
                                />
                            ) : (
                                <CIcon icon={cilUser} width={120}
                                    height={120} className="text-secondary"
                                    style={{ objectFit: 'cover', border: '1px solid #ccc', borderRadius: '25%' }} />
                            )}
                            {/* </CCol>
                        <CCol md={6}> */}
                            <CFormInput
                                type="file"
                                className="mt-2"
                                onChange={handleFileChange}
                            />
                        </CCol>

                    </CRow>

                    {/* Name */}
                    <CRow className="mb-3">
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
                    </CRow>

                    <CRow className="mb-3">
                        {/* Email */}
                        <CCol md={6}>
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
                        </CCol>

                        <CCol md={6}>
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
                        </CCol>

                    </CRow>

                    {/* Password */}
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
                                invalid={!!errors.password}
                            />
                            <CInputGroupText
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: 'pointer' }}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </CInputGroupText>
                            <CFormFeedback invalid>{errors.password}</CFormFeedback>
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
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {showConfirmPassword ? 'Hide' : 'Show'}
                                </CInputGroupText>
                                <CFormFeedback invalid>{errors.confirm_password}</CFormFeedback>
                            </CInputGroup>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <CButton className="buttonLabel" type="submit" disabled={loading}>
                            {loading ? <CSpinner size="sm" /> : 'Update Profile'}
                        </CButton>
                    </div>
                </CForm>
            </CCardBody>
        </CCard>
    )
}

export default OwnerProfile
