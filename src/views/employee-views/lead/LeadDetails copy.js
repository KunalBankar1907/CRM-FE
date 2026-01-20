import React, { useEffect, useState } from 'react'
import {
    CCard,
    CCardHeader,
    CCardBody,
    CRow,
    CCol,
    CButton,
    CBadge,
    CFormSelect,
    CSpinner,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLeadActivities, getLeadById } from '../../../utils/api'
import { toast } from 'react-toastify'
import { formatDateDDMMYYYY, statusValues } from '../../../utils/helper'


const statusColorMap = {
    New: 'primary',
    Contacted: 'info',
    Qualified: 'warning',
    Won: 'success',
    Lost: 'danger',
}

const LeadDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [lead, setLead] = useState(null)
    const [activities, setActivities] = useState([])
    const [stageUpdating, setStageUpdating] = useState(false)

    /* ---------- Fetch Lead ---------- */
    const fetchLead = async () => {
        try {
            const res = await getLeadById(id)
            if (res.data.success) {
                setLead(res.data.data)
            }
        } catch (err) {
            toast.error('Failed to load lead')
        } finally {
            setLoading(false)
        }
    }

    /* ---------- Fetch Activity ---------- */
    const fetchActivities = async () => {
        try {
            const res = await getLeadActivities(id)
            if (res.data.success) {
                setActivities(res.data.data.activities)
                setLead(prev => ({
                    ...prev,
                    owner_name: res.data.data.owner_name || (prev?.assigned_owner_name || '-'),
                }))
            }
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchLead()
        fetchActivities()
    }, [id])

    /* ---------- Stage Change ---------- */
    const handleStageChange = async (newStage) => {
        if (newStage === lead.status) return

        setStageUpdating(true)
        try {
            // const res = await updateLeadStage(id, { status: newStage })
            if (res.data.success) {
                setLead({ ...lead, status: newStage })
                fetchActivities()
                toast.success('Lead stage updated')
            }
        } catch (err) {
            toast.error('Failed to update stage')
        } finally {
            setStageUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="text-center mt-5">
                <CSpinner />
            </div>
        )
    }

    if (!lead) return null

    return (
        <>
            {/* ================= HEADER ================= */}
            <CCard className="mb-3 shadow-sm">
                <CCardHeader className="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-0">{lead.lead_name}</h5>
                        <small className="text-muted">{lead.company_name || '-'}</small>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <CBadge
                            color={statusColorMap[lead.status]}
                            className="py-1 px-3"
                            style={{ fontSize: '0.875rem', minHeight: '32px', display: 'flex', alignItems: 'center' }}
                        >
                            {lead.status}
                        </CBadge>

                        {/* <CButton
                            size="sm"
                            color="primary"
                            style={{ minHeight: '32px', padding: '0 1rem', fontSize: '0.875rem' }}
                            onClick={() => navigate(`/owner/lead/edit/${lead.id}`)}
                        >
                            Edit
                        </CButton> */}
                    </div>
                </CCardHeader>
            </CCard>

            {/* ================= DETAILS ================= */}
            <CCard className="mb-4 shadow-sm">
                <CCardBody>
                    <CRow>
                        {/* Contact */}
                        <CCol md={4}>
                            <h6 className="text-primary mb-3">Contact Info</h6>
                            <p><strong>Phone:</strong> {lead.phone_number}</p>
                            <p><strong>Email:</strong> {lead.email || '-'}</p>
                        </CCol>

                        {/* Lead */}
                        <CCol md={4}>
                            <h6 className="text-primary mb-3">Lead Details</h6>
                            <p><strong>Source:</strong> {lead.lead_source || '-'}</p>
                            <p><strong>Priority:</strong> {lead.priority || '-'}</p>
                            <p><strong>Deal Value:</strong> ₹{lead.expected_deal_value || '-'}</p>
                        </CCol>

                        {/* Assignment */}
                        <CCol md={4}>
                            <h6 className="text-primary mb-3">Assignment</h6>
                            <p><strong>Owner:</strong> {lead.owner_name}</p>
                            <p>
                                <strong>Next Follow-up:</strong>{' '}
                                {formatDateDDMMYYYY(lead.next_follow_up)}
                            </p>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* ================= STAGE CHANGE ================= */}
            <CCard className="mb-4 shadow-sm">
                <CCardBody>
                    <CRow className="align-items-center justify-content-between">
                        <CCol md={4}>
                            <strong>Change Stage</strong>
                        </CCol>

                        <CCol md={4}>
                            <CFormSelect
                                value={lead.status}
                                disabled={stageUpdating}
                                // onChange={(e) => handleStageChange(e.target.value)}
                                onChange={(e) => console.log('changed')}
                            >
                                {/* <option value="">Select Status</option> */}
                                {statusValues.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* ================= NOTES ================= */}
            <CCard className="mb-4 shadow-sm">
                <CCardBody>
                    <h6 className="text-primary mb-2">Notes</h6>
                    <p className="mb-0">{lead.note || 'No notes available'}</p>
                </CCardBody>
            </CCard>

            {/* ================= ACTIVITY ================= */}
            <CCard className="shadow-sm">
                <CCardHeader>
                    <h6 className="mb-0">Activity Timeline</h6>
                </CCardHeader>

                <CCardBody>
                    {activities.length ? (
                        activities.map((log) => {
                            const details = log.timeline_details;
                            // Determine user name who performed the action (updated_by or created_by)
                            const userName = details.updated_by?.name || details.created_by?.name || 'Unknown';

                            return (
                                <div key={log.id} className="d-flex mb-4">
                                    {/* Dot with margin-end */}
                                    <div className="flex-shrink-0 mt-1 me-3">
                                        <span
                                            className="bg-primary rounded-circle d-block"
                                            style={{ width: '12px', height: '12px' }}
                                        ></span>
                                    </div>

                                    {/* Text container with flex-grow */}
                                    <div className="flex-grow-1">
                                        {/* Activity Type - uppercase with spacing */}
                                        <p className="mb-1 fw-bold text-uppercase">{log.activity_type.replace(/_/g, ' ')}</p>

                                        {/* Action description */}
                                        <p className="mb-1 text-secondary">{details.action}</p>

                                        {/* User and date */}
                                        <small className="text-muted">
                                            By {userName} | {new Date(log.created_at).toLocaleDateString('en-GB')}
                                        </small>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-muted mb-0">No activity found</p>
                    )}
                </CCardBody>


            </CCard>
        </>
    )
}

export default LeadDetails
