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
import { changeLeadConverted, changeLeadFeedback, changeLeadOpportunity, changeLeadStage, changeLeadStatus, getLeadActivities, getLeadById } from '../../../utils/api'
import { toast } from 'react-toastify'
import { capitalizeWord, feedbackValues, fieldLabelMap, formatDateDDMMYYYY, formattedDate, renderChangedFields, stagesColorMap, stagesValues, statusColorMap, statusValues } from '../../../utils/helper'
import { fetchStagesValues } from '../../../utils/service'
import CIcon from '@coreui/icons-react'
import { cilArrowThickRight } from '@coreui/icons'


// const stagesColorMap = {
//     New: 'primary',
//     Contacted: 'info',
//     Qualified: 'warning',
//     Won: 'success',
//     Lost: 'danger',
// }

const LeadDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [lead, setLead] = useState(null)
    const [activities, setActivities] = useState([])
    const [stageUpdating, setStageUpdating] = useState(false);
    const [leadNote, setLeadNote] = useState('')
    const [feedback, setFeedback] = useState(lead?.feedback || '');
    const [opportunityDiscussed, setOpportunityDiscussed] = useState(lead?.opportunity_discussed || '');
    const [converted, setConverted] = useState(lead?.converted || '');
    const [feedbackUpdating, setFeedbackUpdating] = useState(false);
    const [opportunityUpdating, setOpportunityUpdating] = useState(false);
    const [convertedUpdating, setConvertedUpdating] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    const fetchLead = async () => {
        try {
            const res = await getLeadById(id)
            if (res.data.success) {
                setLead(res.data.data);

                // const leadData = res.data.data;
                // setLead(leadData);
                // setLeadNote(leadData.note || '')


                //  const leadData = res.data.data;
                // // Ensure note is always a string
                // const note = leadData.note
                //     ? typeof leadData.note === 'object'
                //         ? leadData.note.new || ''
                //         : leadData.note
                //     : '';

                // setLead({ ...leadData, note });
                // setLeadNote(note);
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

    const handleStageChange = async (newStage) => {
        if (newStage === lead.stage) return;
        setStageUpdating(true);
        try {
            const res = await changeLeadStage(id, { stage: newStage });

            if (res.data.success) {
                setLead(prev => ({ ...prev, stage: newStage }));

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

    const handleFeedbackChange = async (newFeedback) => {
        if (newFeedback === lead.feedback) return;

        setFeedbackUpdating(true);

        try {
            const res = await changeLeadFeedback(id, { feedback: newFeedback });

            if (res.data.success) {
                setLead(prev => ({ ...prev, feedback: newFeedback }));
                toast.success('Feedback updated successfully');
            } else {
                toast.error(res.data.message || 'Failed to update feedback');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update feedback');
        } finally {
            setFeedbackUpdating(false);
        }
    };
    const handleOpportunityChange = async (value) => {
        if (value === lead.opportunity_discussed) return;

        setOpportunityUpdating(true);

        try {
            const res = await changeLeadOpportunity(id, {
                opportunity_discussed: value
            });

            if (res.data.success) {
                setLead(prev => ({ ...prev, opportunity_discussed: value }));
                toast.success('Opportunity status updated');
            } else {
                toast.error(res.data.message || 'Failed to update');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update');
        } finally {
            setOpportunityUpdating(false);
        }
    };
    const handleConvertedChange = async (value) => {
        if (value === lead.converted) return;

        setConvertedUpdating(true);

        try {
            const res = await changeLeadConverted(id, {
                converted: value
            });

            if (res.data.success) {
                setLead(prev => ({ ...prev, converted: value }));
                toast.success('Converted status updated');
            } else {
                toast.error(res.data.message || 'Failed to update');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update');
        } finally {
            setConvertedUpdating(false);
        }
    };
    const handleStatusChange = async (value) => {
        if (value === lead.status) return;

        setStatusUpdating(true);

        try {
            const res = await changeLeadStatus(id, {
                status: value
            });

            if (res.data.success) {
                setLead(prev => ({ ...prev, status: value }));
                fetchActivities();
                toast.success('Status updated');
            } else {
                toast.error(res.data.message || 'Failed to update');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update');
        } finally {
            setStatusUpdating(false);
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
                <CCardHeader
                    className="d-flex flex-column flex-md-row
                    justify-content-between align-items-start align-items-md-center
                    gap-3">
                    {/* Left side: Account name and company */}
                    <div>
                        <h5 className="mb-1">{lead.account_name}</h5>
                        <small className="text-muted">{lead.company_name || '-'}</small>
                    </div>

                    {/* Right side: badge + buttons */}
                    <div className="d-flex flex-wrap gap-2">
                        <CBadge
                            className="py-1 px-3"
                            style={{
                                backgroundColor: stagesColorMap[lead.stage],
                                fontSize: '0.875rem',
                                minHeight: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {lead.stage}
                        </CBadge>

                        <CButton
                            size="sm"
                            className="buttonLabel"
                            style={{ minHeight: '32px', padding: '0 1rem', fontSize: '0.875rem' }}
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </CButton>

                        {/* <CButton
                            size="sm"
                            color="primary"
                            className="buttonLabel"
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
                            {/* <h6 className="text-primary mb-3">Contact Info</h6> */}
                            {lead.contact_name && <p><strong>Name:</strong> {lead.contact_name}</p>}
                            {lead.phone_number && <p><strong>Phone:</strong> {lead.phone_number}</p>}
                            {lead.email && <p><strong>Email:</strong> {lead.email || '-'}</p>}
                            {lead.city && <p><strong>City:</strong> {lead.city || '-'}</p>}
                        </CCol>

                        {/* Lead */}
                        <CCol md={4}>
                            {/* <h6 className="text-primary mb-3">Lead Details</h6> */}
                            {lead.lead_source && <p><strong>Source:</strong> {capitalizeWord(lead.lead_source) || '-'}</p>}
                            {lead.priority && <p><strong>Priority:</strong> {lead.priority || '-'}</p>}
                            {lead.expected_deal_value &&
                                <p><strong>Deal Value:</strong> ₹{lead.expected_deal_value || '-'}</p>
                            }
                            {lead.account_size && <p><strong>Account Size:</strong> ₹{lead.account_size || '-'}</p>}
                        </CCol>

                        {/* Assignment */}
                        <CCol md={4}>
                            {/* <h6 className="text-primary mb-3">Assignment</h6> */}
                            <p><strong>Assigned To:</strong> {lead.owner_name}</p>
                            <p>
                                <strong>Next Follow-up:</strong>{' '}
                                {formatDateDDMMYYYY(lead.next_follow_up)}
                            </p>
                            {lead?.last_activity_date && <p><strong>Last Activity Date:</strong> {formattedDate(lead.last_activity_date)}</p>}
                            {lead.engagement_volume && <p><strong>Engagement Volume:</strong> {lead.engagement_volume || '-'}</p>}
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* ================= STAGE CHANGE ================= */}
            <CCard className="mb-4 shadow-sm">
                <CCardBody>
                    <CRow className="mb-3">
                        {/* Stage */}
                        <CCol md={6} className="d-flex align-items-center">
                            <strong className="me-3" style={{ minWidth: '140px' }}>Change Stage</strong>
                            <CFormSelect
                                value={lead.stage}
                                disabled={stageUpdating}
                                onChange={(e) => handleStageChange(e.target.value)}
                            >
                                {stagesValues.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </CFormSelect>
                        </CCol>

                        {/* Feedback */}
                        <CCol md={6} className="d-flex align-items-center">
                            <strong className="me-3" style={{ minWidth: '140px' }}>Feedback</strong>
                            <CFormSelect
                                name="feedback"
                                value={lead?.feedback || ''}
                                disabled={feedbackUpdating}
                                onChange={(e) => handleFeedbackChange(e.target.value)}
                            >
                                <option value="">Select feedback</option>
                                {feedbackValues.map((f) => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                    </CRow>

                    <CRow className="mb-3">
                        {/* Opportunity Discussed */}
                        <CCol md={6} className="d-flex align-items-center">
                            <strong className="me-3" style={{ minWidth: '140px' }}>Opportunity Discussed</strong>
                            <CFormSelect
                                value={lead?.opportunity_discussed || ''}
                                disabled={opportunityUpdating}
                                onChange={(e) => handleOpportunityChange(e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </CFormSelect>
                        </CCol>

                        {/* Converted */}
                        <CCol md={6} className="d-flex align-items-center">
                            <strong className="me-3" style={{ minWidth: '140px' }}>Converted</strong>
                            <CFormSelect
                                value={lead?.converted || ''}
                                disabled={convertedUpdating}
                                onChange={(e) => handleConvertedChange(e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </CFormSelect>
                        </CCol>
                    </CRow>
                    <CRow>
                        {/* Status */}
                        <CCol md={6} className="d-flex align-items-center">
                            <strong className="me-3" style={{ minWidth: '140px' }}>Status</strong>
                            <CFormSelect
                                value={lead?.status || ''}
                                disabled={statusUpdating}
                                onChange={(e) => handleStatusChange(e.target.value)}
                            >
                                <option value="">Select</option>
                                {statusValues.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
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
                        <p className="mb-0">{lead.note}</p>
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
                            const oldStage = details?.meta?.old_stage;
                            const newStage = details?.meta?.new_stage;
                            const priority = details?.meta?.priority;
                            const followUpAt = details?.meta?.follow_up_at;

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

                                        {/* Stage change */}
                                        {oldStage && newStage && (
                                            <p className="mb-1">
                                                <strong>Stage:</strong> <span
                                                    style={{
                                                        color: stagesColorMap[oldStage]
                                                    }}>{oldStage}</span> <CIcon icon={cilArrowThickRight} />{' '}
                                                <span style={{
                                                    color: stagesColorMap[newStage]
                                                }}>{newStage}</span>
                                            </p>
                                        )}
                                        
                                        {/* Status change */}
                                        {oldStatus && newStatus && (
                                            <p className="mb-1">
                                                <strong>Status:</strong> <span
                                                    style={{
                                                        color: statusColorMap[oldStatus]
                                                    }}>{oldStatus}</span> <CIcon icon={cilArrowThickRight} />{' '}
                                                <span style={{
                                                    color: statusColorMap[newStatus]
                                                }}>{newStatus}</span>
                                            </p>
                                        )}

                                        {/* {followUpAt && (
                                            <p className="mb-1">
                                                <strong>Follow Up At:</strong> <span className="text-success">{followUpAt}</span>
                                            </p>
                                        )} */}

                                        {log.activity_type === 'follow_up_updated' && renderChangedFields(details.meta)}

                                        {log.activity_type === 'lead_updated' && renderChangedFields(details.meta)}

                                        {log.activity_type === 'follow_up_completed' && renderChangedFields(details.meta)}
                                        
                                        {/* {log.activity_type === 'lead_status_changed' && renderChangedFields(details.meta)} */}

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
