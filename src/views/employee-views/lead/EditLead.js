import React, { useState, useEffect } from 'react'
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
    CFormSelect,
    CRow,
    CCol,
    CFormTextarea,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilPhone, cilEnvelopeClosed, cilBriefcase, cilScreenSmartphone } from '@coreui/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { getActiveEmployees, getLeadById, updateLead } from '../../../utils/api'
import { toast } from 'react-toastify'
import CustomSpinner from '../../../components/custom/CustomSpinner'
import { statusValues } from '../../../utils/helper'

const EditLead = () => {
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [form, setForm] = useState({
        lead_name: '',
        phone_number: '',
        status: 'New',
        assigned_owner_id: '',
        email: '',
        company_name: '',
        lead_source: '',
        expected_deal_value: '',
        priority: 'Medium',
        note: '',
        next_follow_up: '',
    })
    const [errors, setErrors] = useState({})
    const [users, setUsers] = useState([])
    const navigate = useNavigate()
    const { id } = useParams() // Lead ID from route

    const currentUser = JSON.parse(localStorage.getItem('user'))
    const organization_id = currentUser?.organization_id

    // Fetch owners and lead data
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await getActiveEmployees(organization_id)
                if (res.data.success) {
                    setUsers(res.data.data)
                }
            } catch (err) {
                console.error(err)
            }
        }

        const fetchLead = async () => {
            try {
                const res = await getLeadById(id)
                if (res.data.success) {
                    const lead = res.data.data
                    setForm({
                        lead_name: lead.lead_name || '',
                        phone_number: lead.phone_number || '',
                        status: lead.status || 'New',
                        assigned_owner_id: lead.assigned_owner_id || '',
                        email: lead.email || '',
                        company_name: lead.company_name || '',
                        lead_source: lead.lead_source || '',
                        expected_deal_value: lead.expected_deal_value || '',
                        priority: lead.priority || 'Medium',
                        note: lead.note || '',
                        next_follow_up: lead.next_follow_up || '',
                    })
                } else {
                    toast.error(res.data.message || 'Failed to fetch lead data')
                    navigate('/leads/list')
                }
            } catch (err) {
                console.error(err)
                navigate('/leads/list')
            } finally {
                setFetching(false)
            }
        }

        fetchUsers()
        fetchLead()
    }, [id, organization_id, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'lead_name') {
            newValue = value.replace(/[^a-zA-Z\s]/g, '');
        }

        if (name === 'phone_number') {
            newValue = value.replace(/\D/g, '');
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

        // Front-end validation
        const newErrors = {}
        if (!form.lead_name) newErrors.lead_name = 'Lead Name is required'
        if (!form.phone_number) newErrors.phone_number = 'Phone Number is required'
        if (!form.status) newErrors.status = 'Status is required'
        if (!form.assigned_owner_id) newErrors.assigned_owner_id = 'Assigned Owner is required'

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) {
            setLoading(false)
            return
        }

        const payload = {
            ...form,
            organization_id,
            next_follow_up: form.next_follow_up || null,
        }

        try {
            const response = await updateLead(id, payload);
            const data = response.data
            if (data.success) {
                toast.success(data.message || 'Lead updated successfully')
                window.dispatchEvent(new Event('FOLLOWUP_UPDATED'));
                navigate('/employee/lead/list', { replace: true })
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
            toast.error(err.response?.data?.message || err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <CCard className="mb-4 shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Edit Lead</h5>
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
            {fetching ? (
                <CustomSpinner />
            ) : (
                <CCardBody>
                    <CForm>
                        {/* Contact Info Section */}
                        <h6 className="mb-3 text-primary">Contact Information</h6>
                        <hr />
                        <CRow className="mb-3">
                            <CCol md={6}>
                                <CFormLabel>Lead Name <span className='required-sign'>*</span></CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText>
                                        <CIcon icon={cilUser} />
                                    </CInputGroupText>
                                    <CFormInput
                                        name="lead_name"
                                        value={form.lead_name}
                                        onChange={handleChange}
                                        invalid={!!errors.lead_name}
                                        placeholder="Enter lead name"
                                    />
                                </CInputGroup>
                                <CFormFeedback className="text-danger" style={{ fontSize: "0.8rem" }}>{errors.lead_name}</CFormFeedback>
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel>Company Name</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText>
                                        <CIcon icon={cilBriefcase} />
                                    </CInputGroupText>
                                    <CFormInput
                                        name="company_name"
                                        value={form.company_name}
                                        onChange={handleChange}
                                        placeholder="Enter company name"
                                    />
                                </CInputGroup>
                            </CCol>
                        </CRow>

                        <CRow className="mb-3">
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
                                        placeholder="Enter email"
                                        invalid={!!errors.email}
                                    />
                                </CInputGroup>
                                <CFormFeedback className="text-danger" style={{ fontSize: "0.8rem" }}>{errors.email}</CFormFeedback>
                            </CCol>
                            <CCol md={6}>
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
                                        placeholder="Enter phone number"
                                    />
                                </CInputGroup>
                                <CFormFeedback className="text-danger" style={{ fontSize: "0.8rem" }} >{errors.phone_number}</CFormFeedback>
                            </CCol>
                        </CRow>

                        {/* Lead Details Section */}
                        <h6 className="mb-3 text-primary mt-4">Lead Details</h6>
                        <hr />
                        <CRow className="mb-3">
                            <CCol md={6}>
                                <CFormLabel>Status <span className='required-sign'>*</span></CFormLabel>
                                <CFormSelect
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    invalid={!!errors.status}
                                    readOnly
                                    disabled
                                >
                                    <option value="">Select Stages</option>
                                    {statusValues.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </CFormSelect>
                                <CFormFeedback className="text-danger" style={{ fontSize: "0.8rem" }} >{errors.status}</CFormFeedback>
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel>Lead Source</CFormLabel>
                                <CFormSelect
                                    name="lead_source"
                                    value={form.lead_source}
                                    onChange={handleChange}
                                >
                                    <option value="referral">Referral</option>
                                    <option value="website">Website</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="linkedin">LinkedIn</option>
                                </CFormSelect>
                            </CCol>
                        </CRow>

                        <CRow className="mb-3">
                            <CCol md={6}>
                                <CFormLabel>Expected Deal Value</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText>₹</CInputGroupText>
                                    <CFormInput
                                        type="number"
                                        name="expected_deal_value"
                                        value={form.expected_deal_value}
                                        onChange={handleChange}
                                        placeholder="Enter deal value"
                                    />
                                </CInputGroup>
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel>Priority</CFormLabel>
                                <CFormSelect
                                    name="priority"
                                    value={form.priority}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Priority</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </CFormSelect>
                            </CCol>
                        </CRow>

                        {/* Assignment & Follow-Up Section */}
                        <h6 className="mb-3 text-primary mt-4">Assignment & Follow-Up</h6>
                        <hr />
                        <CRow className="mb-3">
                            <CCol md={6}>
                                <CFormLabel>Assigned To <span className='required-sign'>*</span></CFormLabel>
                                <CFormSelect
                                    name="assigned_owner_id"
                                    value={form.assigned_owner_id}
                                    onChange={handleChange}
                                    invalid={!!errors.assigned_owner_id}
                                >
                                    <option value="">Select Owner</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </CFormSelect>
                                <CFormFeedback invalid>{errors.assigned_owner_id}</CFormFeedback>
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel>Next Follow-Up</CFormLabel>
                                <CFormInput
                                    type="datetime-local"
                                    name="next_follow_up"
                                    min={new Date().toISOString().slice(0,16)}
                                    value={form.next_follow_up}
                                    onChange={handleChange}
                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                />
                            </CCol>
                        </CRow>

                        {/* Note */}
                        <div className="mb-3">
                            <CFormLabel>Notes</CFormLabel>
                            <CFormTextarea
                                name="note"
                                value={form.note}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Add additional notes for this lead"
                            />
                        </div>

                        {/* Submit / Cancel Buttons */}
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <CButton className='buttonLabel' onClick={handleSubmit} disabled={loading}>
                                {loading ? <CSpinner size="sm" /> : 'Update'}
                            </CButton>
                            <CButton
                                className='buttonLabel-inverse'
                                variant="outline"
                                onClick={() => navigate('/owner/lead/list')}
                            >
                                Cancel
                            </CButton>
                        </div>
                    </CForm>
                </CCardBody>
            )}
            <style>{`
        .required-sign{
          color:red;
        }
      `}</style>
        </CCard>
    )
}

export default EditLead
