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
import { changeLeadStage, getLeadActivities, getLeadById } from '../../../utils/api'
import { toast } from 'react-toastify'
import { capitalizeWord, formatDateDDMMYYYY, renderChangedFields, statusColorMap, statusValues } from '../../../utils/helper'
import { fetchStagesValues } from '../../../utils/service'


const LeadDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [lead, setLead] = useState(null)
    const [activities, setActivities] = useState([])
    const [stagesValues, setStagesValues] = useState([])
    const [stageUpdating, setStageUpdating] = useState(false)

    useEffect(() => {
        const getStages = async () => {
            const values = await fetchStagesValues();
            setStagesValues(values);
        }
        getStages();
    }, []);

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

    const handleStageChange = async (newStage) => {
        if (newStage === lead.status) return;
        setStageUpdating(true);
        try {
            const res = await changeLeadStage(id, { status: newStage });

            if (res.data.success) {
                setLead(prev => ({ ...prev, status: newStage }));

                fetchActivities();

                toast.success('Lead stage updated successfully');
            } else {
                toast.error(res.data.message || 'Failed to update stage');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update stage');
        } finally {
            setStageUpdating(false);
        }
    };
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
                            className="py-1 px-3"
                            style={{ backgroundColor: `${statusColorMap[lead.status]}`, fontSize: '0.875rem', minHeight: '32px', display: 'flex', alignItems: 'center' }}
                        >
                            {lead.status}
                        </CBadge>
                        <CButton
                            size="sm"
                            className='buttonLabel'
                            style={{ minHeight: '32px', padding: '0 1rem', fontSize: '0.875rem' }}
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </CButton>

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
                            <p><strong>Source:</strong> {capitalizeWord(lead.lead_source) || '-'}</p>
                            <p><strong>Priority:</strong> {lead.priority || '-'}</p>
                            {lead.expected_deal_value &&
                                <p><strong>Deal Value:</strong> ₹{lead.expected_deal_value || '-'}</p>
                            }
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
                                onChange={(e) => handleStageChange(e.target.value)}
                            >
                                {/* <option value="">Select Status</option> */}
                                {stagesValues.map((s) => (
                                    <option key={s.stage_name} value={s.stage_name}>{s.stage_name}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {lead.note && (
                <CCard className="mb-4 shadow-sm">
                    <CCardBody>
                        <h6 className="text-primary mb-2">Notes</h6>
                        <p className="mb-0">{lead.note || 'No notes available'}</p>
                    </CCardBody>
                </CCard>
            )}

            {/* ================= ACTIVITY ================= */}
            <CCard className="shadow-sm">
                <CCardHeader>
                    <h6 className="mb-0">Activity Timeline</h6>
                </CCardHeader>

                <CCardBody>
                    {activities.length ? (
                        activities.map((log) => {
                            const details = log.timeline_details;
                            const userName =
                                details.updated_by?.name ||
                                details.created_by?.name ||
                                details.changed_by?.name ||
                                'Unknown';
                            const oldStatus = details?.meta?.old_status;
                            const newStatus = details?.meta?.new_status;

                            return (
                                <div key={log.id} className="d-flex mb-4">
                                    {/* Dot */}
                                    <div className="flex-shrink-0 mt-1 me-3">
                                        <span
                                            className="bg-primary rounded-circle d-block"
                                            style={{ width: '12px', height: '12px' }}
                                        ></span>
                                    </div>

                                    {/* Text */}
                                    <div className="flex-grow-1">
                                        {/* Activity Type */}
                                        <h6 className="mb-1 text-primary text-uppercase" style={{ letterSpacing: '0.5px' }}>
                                            {log.activity_type.replace(/_/g, ' ')}
                                        </h6>

                                        {/* Action description */}
                                        <p className="mb-1">{details.action}</p>

                                        {/* Status change */}
                                        {oldStatus && newStatus && (
                                            <p className="mb-1">
                                                <strong>Stage:</strong> <span className="text-success">{oldStatus}</span> →{' '}
                                                <span className="text-danger">{newStatus}</span>
                                            </p>
                                        )}

                                        {log.activity_type === 'lead_updated' && renderChangedFields(details.meta)}

                                        {/* User and date */}
                                        <small className="text-muted">
                                            By <strong>{userName}</strong> |{' '}
                                            {new Date(log.created_at).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
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
