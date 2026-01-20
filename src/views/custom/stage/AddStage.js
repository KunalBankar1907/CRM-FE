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

const AddStage = () => {
    const [isEditMode, setIsEditMode] = useState(true)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [form, setForm] = useState({
        stage_name: '',
    })
    const [errors, setErrors] = useState({})
    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const organization_id = currentUser?.organization_id;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        // Simple validation example
        const newErrors = {}
        if (!form.stage_name) newErrors.stage_name = 'Stage Name is required'

        setErrors(newErrors)

        if (Object.keys(newErrors).length > 0) {
            setLoading(false)
            return
        }

        // Prepare payload
        const payload = {
            organization_id: organization_id,
            stage_name: form.stage_name.trim(),
        }

        try {
            // Call API
            const response = await addEmployee(payload);
            const data = response.data

            if (data.success) {

                // Clear form or redirect
                setForm({
                    stage_name: '',
                })
                navigate('/owner/stage/list', { replace: true });
            } else {
                // setErrors(data.message || 'Failed to add stage')
                if (response?.status === 422 && response.data?.errors) {
                    const backendErrors = response.data.errors

                    const formattedErrors = {}
                    Object.keys(backendErrors).forEach((key) => {
                        // Make sure the key matches your input names
                        formattedErrors[key] = backendErrors[key][0]
                    })

                    setErrors(formattedErrors)
                } else {
                    setErrors(response?.data?.message || message || 'Something went wrong')
                }
            }
        } catch (err) {
            setErrors(err.response?.data?.message || err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }

    }

    return (
        <CCard className="mb-4 shadow-sm">
            <CCardHeader>
                <h5 className="mb-0">Add Stage</h5>
            </CCardHeader>

            <CCardBody>
                <CForm>
                    {/* Name */}
                    <div className="mb-3">
                        <CFormLabel>Stage Name</CFormLabel>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilUser} />
                            </CInputGroupText>
                            <CFormInput
                                name="stage_name"
                                value={form.stage_name}
                                onChange={handleChange}
                                readOnly={!isEditMode}
                                invalid={!!errors.stage_name}
                                placeholder="Enter stage name"
                            />
                            <CFormFeedback invalid>{errors.stage_name}</CFormFeedback>
                        </CInputGroup>
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

    )
}

export default AddStage
