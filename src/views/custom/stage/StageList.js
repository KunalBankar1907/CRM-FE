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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu, cilPencil, cilTransfer, cilTrash } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

import {
    addStage,
    changeStageStatus,
    deleteStage,
    getAllStages,
    getStageById,
    reorderStage,
    updateStage,
} from '../../../utils/api'

import { capitalizeWord, initDataTable } from '../../../utils/helper'
import ListHeader from '../../../components/custom/ListHeader'
import CustomSpinner from '../../../components/custom/CustomSpinner'
import { DEFAULT_LENGTH_CHANGE, DEFAULT_PAGE_LENGTH, DEFAULT_PAGING, DEFAULT_SEARCHING, PAGE_LENGTH_MENU } from '../../../utils/constant'

// ADD STAGE MODAL
const AddStageModal = ({ visible, onClose, onSuccess }) => {
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

// EDIT STAGE MODAL 
const EditStageModal = ({ visible, onClose, onSuccess, stageId }) => {
    const [form, setForm] = useState({ stage_name: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)

    const currentUser = JSON.parse(localStorage.getItem('user'))
    const organization_id = currentUser?.organization_id

    useEffect(() => {
        if (!visible || !stageId) return
        const fetchStage = async () => {
            setFetching(true)
            try {
                const res = await getStageById(stageId)
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
        fetchStage()
    }, [visible, stageId])

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

// STAGE LIST 
const StageList = () => {
    const [stages, setStages] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editStageId, setEditStageId] = useState(null)

    const tableRef = useRef(null)
    const navigate = useNavigate();
    const dataTableInstance = useRef(null);

    const fetchStages = async () => {
        setLoading(true)
        try {
            const res = await getAllStages({ search: searchTerm, status, page })
            if (res.data.success) setStages(res.data.data)
            else toast.error(res.data.message || 'Failed to fetch stages')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timeout = setTimeout(fetchStages, 400)
        return () => clearTimeout(timeout)
    }, [searchTerm, status, page])


    const handleStageReorder = async (reorderedStages) => {
        try {
            const payload = {
                stages: reorderedStages,
            }
            const res = await reorderStage(payload);
            if (res && res.data.success) {
                await fetchStages();
            } else {
                toast.error('Something went wrong');
            }
        } catch (error) {
            console.error('Stage reorder failed', error)
        }
    }


    // useEffect(() => {
    //     if (!loading && stages.length > 0) {
    //         // const destroy = initDataTable(tableRef)
    //         const destroy = initDataTable(tableRef, {
    //             onRowReorder: handleStageReorder,
    //         })
    //         return () => destroy()
    //     }
    // }, [stages, loading])

    useEffect(() => {
        if (loading || stages.length === 0) return;

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
    }, [stages, loading]);

    const handleDelete = async (id) => {
        try {
            const res = await deleteStage(id);
            if (res.data.success) {
                toast.success('Stage deleted successfully')
                await fetchStages();
            }
        } catch {
            toast.error('Failed to delete stage')
        }
    }

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

    return (
        <div className="p-0">
            <CCard>
                <ListHeader
                    title="Stages"
                    addButtonLabel="Add Stage"
                    onAddClick={() => setShowAddModal(true)}
                    searchValue={searchTerm}
                    onSearchChange={(e) => {
                        setSearchTerm(e.target.value)
                        setPage(1)
                    }}
                />
                {loading ? (
                    <CustomSpinner />
                ) : (
                    <CCardBody className="pt-0">
                        <div className="table-responsive rounded bg-white">
                            <table ref={tableRef} className="table table-bordered table-striped table-hover align-middle mb-0">
                                <thead className="table-primary">
                                    <tr>
                                        <th></th>
                                        <th>ID</th>
                                        <th>Order</th>
                                        <th>Stage</th>
                                        <th>Status</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stages.length ? (
                                        stages.map((stage) => (
                                            <tr key={stage.id}>
                                                <td className="reorder-handle text-center">
                                                    <CIcon icon={cilMenu} style={{ cursor: 'grab' }} />
                                                </td>
                                                <td>{stage.id}</td>
                                                <td>{stage.stage_order}</td>
                                                <td>{stage.stage_name}</td>
                                                {/* <td>
                                                    <span className="badge bg-success">
                                                        {capitalizeWord(stage.stage_status || 'active')}
                                                    </span>
                                                </td> */}

                                                <td>
                                                    <CFormSwitch
                                                        className="mx-1"
                                                        color={stage.stage_status === 'enable' ? 'success' : 'secondary'}
                                                        variant="3d"
                                                        shape="pill"
                                                        checked={stage.stage_status === 'enable'}
                                                        onChange={() => handleToggleStageStatus(stage.id)}
                                                    />
                                                    {/* <span className="ms-2">{capitalizeWord(stage.stage_status)}</span> */}
                                                </td>

                                                <td className="text-center">
                                                    <span
                                                        className="badge bg-dark me-2"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => {
                                                            setEditStageId(stage.id)
                                                            setShowEditModal(true)
                                                        }}
                                                    >
                                                        <CIcon icon={cilPencil} />
                                                    </span>
                                                    <span
                                                        className="badge bg-danger"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleDelete(stage.id)}
                                                    >
                                                        <CIcon icon={cilTrash} />
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted">
                                                No stages found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CCardBody>
                )}
            </CCard>

            {/* ADD STAGE MODAL */}
            <AddStageModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    setShowAddModal(false)
                    fetchStages()
                }}
            />

            {/* EDIT STAGE MODAL */}
            <EditStageModal
                visible={showEditModal}
                stageId={editStageId}
                onClose={() => setShowEditModal(false)}
                onSuccess={fetchStages}
            />
        </div>
    )
}

export default StageList
