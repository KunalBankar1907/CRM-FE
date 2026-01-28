import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import {
    CCard,
    CCardBody,
    CButton,
    CSpinner,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CForm,
    CFormInput,
    CFormLabel,
    CInputGroup,
    CInputGroupText,
    CFormFeedback,
    CFormSwitch,
    CRow,
    CCol,
    CBadge,
    CFormSelect,
    CFormTextarea,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu, cilOpentype, cilPencil, cilTask, cilTransfer, cilTrash } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

import {
    addFollowUp,
    addFollowUpAsMarkDone,
    addStage,
    changeStageStatus,
    deleteStage,
    getAllFollowups,
    getAllLeadsForFollowup,
    getAllStages,
    getFollowupById,
    getStageById,
    reorderStage,
    updateStage,
} from '../../../utils/api'

import { capitalizeWord, FOLLOW_UP_OUTCOMES, followupStatusColorMap, formatDateDDMMYYYY, initDataTable } from '../../../utils/helper'
import ListHeader from '../../../components/custom/ListHeader'
import CustomSpinner from '../../../components/custom/CustomSpinner'
import { DEFAULT_LENGTH_CHANGE, DEFAULT_PAGE_LENGTH, DEFAULT_PAGING, DEFAULT_SEARCHING, PAGE_LENGTH_MENU } from '../../../utils/constant'

// ADD MODAL
const AddModals = ({ visible, onClose, onSuccess }) => {
    const [form, setForm] = useState({ stage_name: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const currentUser = JSON.parse(localStorage.getItem('user'))
    const organization_id = currentUser?.organization_id

    const handleChange = (e) => {
        setForm({ stage_name: e.target.value })
        setErrors({})
    }

    const handleSubmit = async () => {
        if (!form.stage_name.trim()) {
            setErrors({ stage_name: 'Stage name is required' })
            return
        }
        setLoading(true)
        try {
            const payload = { organization_id, stage_name: form.stage_name.trim(), stage_status: "enable" }
            const res = await addStage(payload)
            if (res.data?.success) {
                toast.success('Stage added successfully')
                setForm({ stage_name: '' })
                onSuccess()
            } else {
                setErrors(res.data?.errors || {})
            }
        } catch (err) {
            setErrors(err.response?.data?.errors || {})
        } finally {
            setLoading(false)
        }
    }

    return (
        <CModal visible={visible} alignment="center" onClose={onClose} autoFocus={false} backdrop="static"    // prevent closing on outside click
            keyboard={false}>
            <CModalHeader>
                <CModalTitle>Add Stage</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CForm>
                    <CRow>
                        <CFormLabel>Stage Name</CFormLabel>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilTransfer} />
                            </CInputGroupText>
                            <CFormInput
                                value={form.stage_name}
                                onChange={handleChange}
                                invalid={!!errors.stage_name}
                                placeholder="Enter stage name"
                            />
                            <CFormFeedback invalid>{errors.stage_name}</CFormFeedback>
                        </CInputGroup>
                    </CRow>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton
                    className="buttonLabel-inverse"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancel
                </CButton>
                <CButton className="buttonLabel" onClick={handleSubmit} disabled={loading}>
                    {loading ? <CSpinner size="sm" /> : 'Save'}
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

// const AddFollowUpModal = ({ visible, onClose, onSuccess }) => {
const AddModal = ({ visible, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        lead_id: '',
        follow_up_at: '',
        note: '',
    })
    const [leads, setLeads] = useState([])
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (visible) {
            fetchLeads()
        }
    }, [visible])

    const fetchLeads = async () => {
        try {
            const res = await getAllLeadsForFollowup()
            if (res.data?.success) {
                setLeads(res.data.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch leads', err)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setErrors({})
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const res = await addFollowUp({
                ...form,
                is_completed: 0,
            })

            if (res.data?.success) {
                toast.success(res.data.message || 'Follow-up added successfully')
                window.dispatchEvent(new Event('FOLLOWUP_UPDATED'));
                onSuccess()
                onClose()
                setForm({ lead_id: '', follow_up_at: '', note: '' })
            } else {
                if (res.data?.errors) {
                    setErrors(res.data.errors)
                } else {
                    toast.error(res.data?.message || 'Something went wrong')
                }
            }
        } catch (err) {
            // 🔹 Catch network / server errors
            toast.error(err.response?.data?.message || 'Failed to add follow-up')
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <CModal visible={visible} alignment="center" onClose={onClose} backdrop="static">
            <CModalHeader>
                <CModalTitle>Add Follow-up</CModalTitle>
            </CModalHeader>

            <CModalBody>
                <CForm>
                    {/* Lead */}
                    <div>
                        <CFormLabel>Select Lead</CFormLabel>
                        <CFormSelect
                            className="mb-2"
                            name="lead_id"
                            value={form.lead_id}
                            onChange={handleChange}
                            invalid={!!errors.lead_id}
                        >
                            <option value="">Select Lead</option>
                            {leads.map((lead) => (
                                <option key={lead.id} value={lead.id}>
                                    {lead.lead_name}
                                </option>
                            ))}
                        </CFormSelect>
                    </div>

                    {/* Follow-up date */}
                    <div>
                        <CFormLabel>Select Follow up date</CFormLabel>
                        <CFormInput
                            className='mb-2'
                            type="datetime-local"
                            name="follow_up_at"
                            min={new Date().toISOString().slice(0, 16)}
                            value={form.follow_up_at}
                            onChange={handleChange}
                            onClick={(e) => {
                                if (e.target.showPicker) {
                                    e.target.showPicker();
                                }
                            }}
                        />
                    </div>

                    {/* Note */}
                    <div>
                        <CFormLabel>Note</CFormLabel>
                        <CFormTextarea
                            className='mb-2'
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            placeholder="Optional note"
                        />
                    </div>
                </CForm>
            </CModalBody>

            <CModalFooter>
                <CButton className="buttonLabel-inverse" onClick={onClose}>Cancel</CButton>
                <CButton className='buttonLabel' onClick={handleSubmit} disabled={loading}>
                    Save
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

const CompleteFollowUpModal = ({ visible, followUpId, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        outcome: '',
        next_follow_up_note: '',
        next_follow_up: '',
    })

    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!form.outcome) {
            setErrors({ outcome: 'Outcome is required' })
            return
        }

        try {
            setLoading(true)
            const res = await addFollowUpAsMarkDone({
                followUpId: followUpId,
                outcome: form.outcome,
                next_follow_up_note: form.next_follow_up_note,
                next_follow_up: form.next_follow_up || null,
            })

            if (res.data?.success) {
                toast.success(res.data.message || 'Follow-up marked as done successfully')
                window.dispatchEvent(new Event('FOLLOWUP_UPDATED'));
                onSuccess()
                onClose()
                setForm({ outcome: '', next_follow_up_note: '', next_follow_up: '' })
            } else {
                setErrors(res.data?.errors || {})
            }
        } catch (err) {
            setErrors(err.response?.data?.errors || {})
            toast.error(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }


    return (
        <CModal visible={visible} onClose={onClose} backdrop="static">
            <CModalHeader>
                <CModalTitle>Mark Follow-up as Done</CModalTitle>
            </CModalHeader>

            <CModalBody>
                <CForm>
                    {/* Outcome */}
                    <div>
                        <CFormLabel>Select Outcome</CFormLabel>
                        <CFormSelect
                            className='mb-2'
                            name="outcome"
                            value={form.outcome}
                            onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                            invalid={!!errors.outcome}
                        >
                            <option value="">Select Outcome</option>
                            {FOLLOW_UP_OUTCOMES.map((o) => (
                                <option key={o} value={o}>
                                    {o}
                                </option>
                            ))}
                        </CFormSelect>
                    </div>

                    {/* Note */}
                    <div>
                        <CFormLabel>Note</CFormLabel>
                        <CFormTextarea
                            className='mb-2'
                            name="next_follow_up_note"
                            value={form.next_follow_up_note}
                            onChange={(e) => setForm({ ...form, next_follow_up_note: e.target.value })}
                            placeholder="Optional note"
                        />
                    </div>

                    {/* Next follow-up */}
                    <div>
                        <CFormLabel>Next Follow up</CFormLabel>
                        <CFormInput
                            type="datetime-local"
                            className='mb-2'
                            name="next_follow_up"
                            min={new Date().toISOString().slice(0, 16)}
                            value={form.next_follow_up}
                            onChange={(e) => setForm({ ...form, next_follow_up: e.target.value })}
                            onClick={(e) => {
                                if (e.target.showPicker) {
                                    e.target.showPicker();
                                }
                            }}
                        />
                    </div>
                </CForm>
            </CModalBody>

            <CModalFooter>
                <CButton className="buttonLabel-inverse" variant="outline" onClick={onClose}>
                    Cancel
                </CButton>
                <CButton className='buttonLabel' onClick={handleSubmit} disabled={loading}>
                    Mark Done
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

// EDIT  MODAL 
const EditModal = ({ visible, onClose, onSuccess, followupId }) => {
    const [form, setForm] = useState({ stage_name: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)

    const currentUser = JSON.parse(localStorage.getItem('user'))
    const organization_id = currentUser?.organization_id

    useEffect(() => {
        if (!visible || !followupId) return
        const fetchFollowUp = async () => {
            setFetching(true)
            try {
                const res = await getStageById(followupId)
                if (res.data?.success && res.data?.data) {
                    setForm({ stage_name: res.data.data.stage_name || '' })
                } else {
                    toast.error('Failed to fetch stage details')
                }
            } catch (err) {
                toast.error('Error fetching stage details')
            } finally {
                setFetching(false)
            }
        }
        fetchFollowUp()
    }, [visible, followupId])

    const handleChange = (e) => {
        setForm({ stage_name: e.target.value })
        setErrors({})
    }

    const handleSubmit = async () => {
        if (!form.stage_name.trim()) {
            setErrors({ stage_name: 'Stage name is required' })
            return
        }
        setLoading(true)
        try {
            const payload = { organization_id, stage_name: form.stage_name.trim() }
            const res = await updateStage(stageId, payload)
            if (res.data?.success) {
                toast.success('Stage updated successfully')
                onSuccess()
                onClose()
            } else {
                setErrors(res.data?.errors || {})
            }
        } catch (err) {
            setErrors(err.response?.data?.errors || {})
        } finally {
            setLoading(false)
        }
    }

    return (
        <CModal visible={visible} alignment="center" onClose={onClose} autoFocus={false} backdrop="static"    // prevent closing on outside click
            keyboard={false}>
            <CModalHeader>
                <CModalTitle>Edit Stage</CModalTitle>
            </CModalHeader>
            <CModalBody>
                {fetching ? (
                    <CSpinner size="sm" />
                ) : (
                    <CForm>
                        <CRow>
                            <CFormLabel>Stage Name</CFormLabel>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilTransfer} />
                                </CInputGroupText>
                                <CFormInput
                                    value={form.stage_name}
                                    onChange={handleChange}
                                    invalid={!!errors.stage_name}
                                    placeholder="Enter stage name"
                                />
                                <CFormFeedback invalid>{errors.stage_name}</CFormFeedback>
                            </CInputGroup>
                        </CRow>
                    </CForm>
                )}
            </CModalBody>
            <CModalFooter>
                <CButton
                    className="buttonLabel-inverse"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading || fetching}
                >
                    Cancel
                </CButton>
                <CButton
                    className="buttonLabel"
                    onClick={handleSubmit}
                    disabled={loading || fetching}
                >
                    {loading ? <CSpinner size="sm" /> : 'Update'}
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

const ViewFollowUpModal = ({ visible, followUpId, onClose }) => {
    const [followUp, setFollowUp] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (visible && followUpId) {
            fetchFollowUpDetails(followUpId)
        }
    }, [visible, followUpId])

    const fetchFollowUpDetails = async (id) => {
        setLoading(true)
        try {
            const res = await getFollowupById(id)
            if (res.data?.success) {
                setFollowUp(res.data.data)
            } else {
                toast.error(res.data?.message || 'Failed to fetch follow-up')
                onClose()
            }
        } catch (err) {
            toast.error(err.message || 'Failed to fetch follow-up')
            onClose()
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <CModal visible={visible} onClose={onClose} backdrop="static" size="lg" className="view-modal">
                <CModalHeader className="view-modal-header">
                    <CModalTitle>View Follow-up Details</CModalTitle>
                </CModalHeader>

                <CModalBody className="view-modal-body">
                    {loading ? (
                        <div className="text-center">Loading...</div>
                    ) : followUp ? (
                        <CForm>
                            <div className="mb-2">
                                <CFormLabel>Lead Name</CFormLabel>
                                <CFormInput value={followUp.lead?.lead_name || '-'} readOnly className="readonly-input" />
                            </div>

                            <div className="mb-2">
                                <CFormLabel>Follow-up Date</CFormLabel>
                                <CFormInput value={formatDateDDMMYYYY(followUp.follow_up_at) || '-'} readOnly className="readonly-input" />
                            </div>

                            <div className="mb-2">
                                <CFormLabel>Status</CFormLabel>
                                <CBadge
                                    className="mx-2 py-1 px-2 text-white status-badge"
                                    style={{
                                        backgroundColor: followupStatusColorMap[followUp.status] || '#6c757d',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {followUp.status}
                                </CBadge>
                            </div>

                            {followUp.outcome &&
                                <div className="mb-2">
                                    <CFormLabel>Outcome</CFormLabel>
                                    <CFormInput value={followUp.outcome || '-'} readOnly className="readonly-input" />
                                </div>
                            }

                            {followUp.next_follow_up_note &&
                                <div className="mb-2">
                                    <CFormLabel>Completion Note</CFormLabel>
                                    <CFormTextarea value={followUp.next_follow_up_note || '-'} readOnly className="readonly-input textarea-box" />
                                </div>
                            }

                            {followUp.next_follow_up && (
                                <div className="mb-2">
                                    <CFormLabel>Next Follow-up Date</CFormLabel>
                                    <CFormInput value={formatDateDDMMYYYY(followUp.next_follow_up)} readOnly className="readonly-input" />
                                </div>
                            )}
                        </CForm>
                    ) : (
                        <div className="text-center text-muted">No details available</div>
                    )}
                </CModalBody>

                <CModalFooter className="view-modal-footer">
                    <CButton className="buttonLabel" onClick={onClose}>
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>
            <style>{`
            /* Modal wrapper */
            .view-modal .modal-content {
            border-radius: 14px;
            border: 1px solid var(--darkBorderColor);
            background: #fff;
            box-shadow:
                0 10px 30px rgba(0,0,0,0.12),
                0 20px 60px rgba(0,0,0,0.18);
            }

            /* Header */
            .view-modal-header {
            background: var(--lightColor);
            border-bottom: 1px solid var(--darkBorderColor);
            padding: 1rem 1.25rem;
            position: relative;
            }

            .view-modal-header .modal-title {
            color: var(--darkColor);
            font-weight: 600;
            letter-spacing: 0.2px;
            }

            /* Optional left accent like sidebar */
            .view-modal-header::before {
            content: "";
            position: absolute;
            left: 0;
            top: 20%;
            width: 4px;
            height: 60%;
            background: var(--darkColor);
            border-radius: 0 4px 4px 0;
            }

            /* Body */
            .view-modal-body {
            padding: 1.25rem;
            }

            .readonly-input {
            background: var(--lightColor);
            border: 1px solid var(--darkBorderColor);
            border-radius: 8px;
            color: var(--darkColor);
            font-weight: 500;
            padding: 0.5rem 0.65rem;
            box-shadow:
                inset 0 1px 2px rgba(255, 255, 255, 0.6),
                0 1px 2px rgba(0,0,0,0.05);
            }

            .textarea-box {
            min-height: 80px;
            line-height: 1.5;
            }

            .status-badge {
            border-radius: 6px;
            font-weight: 500;
            }

            /* Footer */
            .view-modal-footer {
            border-top: 1px solid var(--darkBorderColor);
            background: #fafbff;
            }

            .view-modal-footer .buttonLabel {
            background: var(--darkColor);
            border-color: var(--darkColor);
            color: #fff;
            }

            .view-modal-footer .buttonLabel:hover {
            background: #072c63;
            border-color: #072c63;
            }
        `}</style>
        </>
    )
}
// FOLLOW-UP LIST 
const FollowUpList = () => {
    const [followUps, setFollowUps] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [viewModal, setViewModal] = useState({ open: false, id: null })

    const [completeModal, setCompleteModal] = useState(null)
    const [followUpFilter, setFollowUpFilter] = useState('')

    const [editFollowupId, setEditFollowupId] = useState(null)

    const tableRef = useRef(null)
    const navigate = useNavigate();
    const dataTableInstance = useRef(null);

    const fetchFollowUps = async () => {
        setLoading(true)
        try {
            const res = await getAllFollowups({ search: searchTerm, status, page, followUpFilter })
            if (res.data.success) setFollowUps(res.data.data)
            else toast.error(res.data.message || 'Failed to fetch stages')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timeout = setTimeout(fetchFollowUps, 400)
        return () => clearTimeout(timeout)
    }, [searchTerm, status, page, followUpFilter])


    // const handleDelete = async (id) => {
    //     try {
    //         const res = await deleteStage(id);
    //         if (res.data.success) {
    //             toast.success('Follow-up deleted successfully')
    //             await fetchStages();
    //         }
    //     } catch {
    //         toast.error('Failed to delete stage')
    //     }
    // }

    const handleToggleStageStatus = async (stageId) => {
        try {
            const res = await changeStageStatus(stageId);

            if (res.data.success) {
                toast.success(res.data.message);
                await fetchStages();
            } else {
                toast.error(res.data.message || 'Failed to change status');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change status');
        }
    };

    useEffect(() => {
        if (loading || followUps.length === 0) return;

        const table = tableRef.current;
        if (!table) return;

        // Initialize DataTable
        dataTableInstance.current = $(table).DataTable({
            // paging: false,
            searching: DEFAULT_SEARCHING,
            paging: DEFAULT_PAGING,
            pageLength: DEFAULT_PAGE_LENGTH,
            lengthChange: DEFAULT_LENGTH_CHANGE,
            lengthMenu: PAGE_LENGTH_MENU
        });

        return () => {
            try {
                // Destroy only if table is still in the DOM
                if (dataTableInstance.current) {
                    dataTableInstance.current.destroy(true);
                    dataTableInstance.current = null;
                }
            } catch (err) {
                console.warn('DataTable destroy failed:', err);
            }
        }
    }, [followUps, loading]);

    return (
        <>
            <div className="p-0">
                <CCard>
                    <ListHeader
                        // title="Follow-Up"
                        layout="two-rows"
                        addButtonLabel="Add Follow-Up"
                        onAddClick={() => setShowAddModal(true)}
                        searchValue={searchTerm}
                        onSearchChange={(e) => {
                            setSearchTerm(e.target.value)
                            setPage(1)
                        }}
                        filterComponents={[
                            <select
                                key="followup"
                                className="form-select"
                                value={followUpFilter}
                                onChange={(e) => {
                                    setFollowUpFilter(e.target.value)
                                    setPage(1)
                                }}
                            >
                                <option value="">All Follow-Ups</option>
                                <option value="Overdue">Overdue</option>
                                <option value="Today">Today</option>
                                <option value="Upcoming">Upcoming</option>
                            </select>,
                        ]}
                    />
                    {loading ? (
                        <CustomSpinner />
                    ) : (
                        <CCardBody className="pt-0">
                            <div className="table-responsive rounded bg-white">
                                <table ref={tableRef} className="table table-bordered table-striped table-hover align-middle mb-0">
                                    <thead className="table-primary">
                                        <tr>
                                            <th>#</th>
                                            <th>Lead Name</th>
                                            <th>Follow-up At</th>
                                            <th>Status</th>
                                            {/* <th>Outcome</th> */}
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {followUps.length ? (
                                            followUps.map((f, i) => (
                                                <tr key={f.id}>
                                                    {/* <td>{f.id}</td> */}
                                                    <td>{i + 1}</td>
                                                    <td>{f.lead?.lead_name ?? '-'}</td>
                                                    <td>{formatDateDDMMYYYY(f.follow_up_at)}</td>
                                                    {/* <td>{f.status}</td> */}
                                                    <td>
                                                        <CBadge
                                                            className="py-1 px-2 text-white"
                                                            style={{
                                                                backgroundColor: followupStatusColorMap[f.status] || '#6c757d',
                                                                fontSize: '0.875rem',
                                                                minHeight: '32px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            {capitalizeWord(f.status)}
                                                        </CBadge>
                                                    </td>
                                                    {/* <td>
                                                    <CButton
                                                        size="sm"
                                                        color="success"
                                                        onClick={() => setCompleteModal(f.id)}
                                                        disabled={f.status === 'Done'}>
                                                        Mark Done
                                                    </CButton>
                                                </td> */}
                                                    {/* <td>{f.outcome ?? '-'}</td> */}
                                                    {/* <td>
                                                    <span className="badge bg-success">
                                                        {capitalizeWord(f.stage_status || 'active')}
                                                    </span>
                                                </td> */}


                                                    <td className="text-center">
                                                        <span
                                                            className={`badge ${f.status === 'Done' ? 'bg-secondary' : 'bg-success'} me-2`}
                                                            style={{ padding: '0.35em 0.75em', cursor: f.status === 'Done' ? 'not-allowed' : 'pointer' }}
                                                            onClick={() => f.status !== 'Done' && setCompleteModal({ open: true, id: f.id })}
                                                            title="Mark as Done"
                                                        >
                                                            <CIcon icon={cilTask} />
                                                        </span>
                                                        {f.status === 'Done' && (
                                                            <span
                                                                className={`badge bg-info me-2`}
                                                                style={{ padding: '0.35em 0.75em', cursor: 'pointer' }}
                                                                onClick={() => setViewModal({ open: true, id: f.id })}
                                                                title="View Follow-up Details"
                                                            >
                                                                <CIcon icon={cilOpentype} />
                                                            </span>
                                                        )}
                                                        {/* <span
                                                        className="badge bg-dark me-2"
                                                        style={{ padding: '0.35em 0.75em', cursor: 'pointer' }}
                                                    // onClick={() => {
                                                    //     setEditFollowupId(f.id)
                                                    //     setShowEditModal(true)
                                                    // }}
                                                    >
                                                        <CIcon icon={cilPencil} />
                                                    </span> */}
                                                        {/* <span
                                                        className="badge bg-danger"
                                                        style={{ padding: '0.35em 0.75em', cursor: 'pointer' }}
                                                    // onClick={() => handleDelete(f.id)}
                                                    >
                                                        <CIcon icon={cilTrash} />
                                                    </span> */}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center text-muted">
                                                    No follow-ups found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CCardBody>
                    )}
                </CCard>

                {/* ADD MODAL */}
                <AddModal
                    visible={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false)
                        fetchFollowUps()
                    }}
                />

                {/* EDIT MODAL */}
                <EditModal
                    visible={showEditModal}
                    followupId={editFollowupId}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={fetchFollowUps}
                />

                {/* COMPLETE MODAL */}
                <CompleteFollowUpModal
                    visible={!!completeModal}
                    followUpId={completeModal ? completeModal.id : completeModal}
                    onClose={() => setCompleteModal(null)}
                    onSuccess={fetchFollowUps}
                />

                {/* VIEW MODAL */}
                <ViewFollowUpModal
                    visible={viewModal.open}
                    followUpId={viewModal.id}
                    onClose={() => setViewModal({ open: false, id: null })}
                />



            </div>
        </>
    )
}

export default FollowUpList
