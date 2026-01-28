import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import {
    CCard,
    CCardBody,
    CButton,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CRow,
    CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu, cilOpentype, cilTrash } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

import {
    getAllEnquiries,
    deleteEnquiry,
    getEnquiryById,
} from '../../../utils/api'

import { initDataTable } from '../../../utils/helper'
import ListHeader from '../../../components/custom/ListHeader'
import CustomSpinner from '../../../components/custom/CustomSpinner'
import {
    DEFAULT_LENGTH_CHANGE,
    DEFAULT_PAGE_LENGTH,
    DEFAULT_PAGING,
    DEFAULT_SEARCHING,
    PAGE_LENGTH_MENU,
} from '../../../utils/constant'

/* ---------- FIELD COMPONENT ---------- */
const Field = ({ label, value }) => {
    if (!value) return null
    return (
        <CCol md={6} className="mb-3">
            <label className="text-muted small">{label}</label>
            <div className="fw-semibold">{value}</div>
        </CCol>
    )
}

/* ---------- MAIN COMPONENT ---------- */
const EnquiryList = () => {
    const [enquiries, setEnquiries] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)

    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedEnquiry, setSelectedEnquiry] = useState(null)
    const [viewLoading, setViewLoading] = useState(false)

    const tableRef = useRef(null)
    const navigate = useNavigate()

    /* ---------- FETCH LIST ---------- */
    const fetchEnquiries = async () => {
        setLoading(true)
        try {
            const res = await getAllEnquiries({ search: searchTerm, page })
            if (res.data.success) setEnquiries(res.data.data)
            else toast.error(res.data.message || 'Failed to fetch enquiries')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timeout = setTimeout(fetchEnquiries, 400)
        return () => clearTimeout(timeout)
    }, [searchTerm, page])

    /* ---------- DATATABLE ---------- */
    useEffect(() => {
        if (loading || enquiries.length === 0) return
        const cleanup = initDataTable(
            tableRef,
            {
                searching: DEFAULT_SEARCHING,
                paging: DEFAULT_PAGING,
                pageLength: DEFAULT_PAGE_LENGTH,
                lengthChange: DEFAULT_LENGTH_CHANGE,
                lengthMenu: PAGE_LENGTH_MENU,
                ordering: true,
            },
            true
        )
        return () => cleanup?.()
    }, [enquiries, loading])

    /* ---------- VIEW HANDLER ---------- */
    const handleView = async (id) => {
        setShowViewModal(true)
        setViewLoading(true)
        setSelectedEnquiry(null)

        try {
            const res = await getEnquiryById(id)
            if (res.data.success) {
                setSelectedEnquiry(res.data.data)
            } else {
                toast.error(res.data.message || 'Failed to load enquiry')
                setShowViewModal(false)
            }
        } catch (err) {
            toast.error(err.message || 'Something went wrong')
            setShowViewModal(false)
        } finally {
            setViewLoading(false)
        }
    }

    /* ---------- DELETE ---------- */
    const handleDelete = async (id) => {
        try {
            const res = await deleteEnquiry(id)
            if (res.data.success) {
                toast.success('Enquiry deleted successfully')
                fetchEnquiries()
            }
        } catch {
            toast.error('Failed to delete enquiry')
        }
    }

    return (
        <>
            <CCard>
                <ListHeader
                    title="Enquiries List"
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
                            <table
                                ref={tableRef}
                                className="table table-bordered table-striped table-hover align-middle mb-0"
                            >
                                <thead className="table-primary">
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone Number</th>
                                        <th>Role</th>
                                        {/* <th>Enquiry</th> */}
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enquiries.length ? (
                                        enquiries.map((enquiry, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{enquiry.name}</td>
                                                <td>{enquiry.email}</td>
                                                <td>{enquiry.phone_number}</td>
                                                <td>{enquiry.role}</td>
                                                {/* <td>
                                                    {enquiry.enquiry && enquiry.enquiry.length > 60
                                                        ? enquiry.enquiry.slice(0, 60) + "..."
                                                        : enquiry.enquiry}
                                                </td> */}

                                                <td>
                                                    <div className="table-actions d-flex gap-2 justify-content-center">
                                                        <span
                                                            className="action-btn view"
                                                            style={{ cursor: 'pointer' }}
                                                            // title={`View Enquiry: ${enquiry.name}`}
                                                            onClick={() => handleView(enquiry.id)}
                                                        >
                                                            <CIcon icon={cilOpentype} />
                                                        </span>
                                                        <span
                                                            className="action-btn delete"
                                                            style={{ cursor: 'pointer' }}
                                                            // title={`Delete Enquiry: ${enquiry.name}`}
                                                            onClick={() => handleDelete(enquiry.id)}
                                                        >
                                                            <CIcon icon={cilTrash} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted">
                                                No enquiries found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CCardBody>
                )}
            </CCard>

            {/* ---------- VIEW MODAL ---------- */}
            <CModal
                visible={showViewModal}
                onClose={() => setShowViewModal(false)}
                size="lg"
                backdrop="static"
                className="enquiry-modal"
            >
                <CModalHeader className="enquiry-modal-header">
                    <CModalTitle>Enquiry Details</CModalTitle>
                </CModalHeader>

                <CModalBody className="enquiry-modal-body">
                    {viewLoading ? (
                        <CustomSpinner />
                    ) : (
                        selectedEnquiry && (
                            <CRow>
                                <Field label="Name" value={selectedEnquiry.name} />
                                <Field label="Role" value={selectedEnquiry.role} />
                                <Field label="Institute / Organization" value={selectedEnquiry.institute} />
                                <Field label="City" value={selectedEnquiry.city} />
                                <Field label="Email" value={selectedEnquiry.email} />
                                <Field label="Phone Number" value={selectedEnquiry.phone_number} />
                                <Field label="What do you need?" value={selectedEnquiry.need} />

                                {selectedEnquiry.message && (
                                    <CCol md={12}>
                                        <label className="text-muted small">Message</label>
                                        <div className="enquiry-text-box">
                                            {selectedEnquiry.message}
                                        </div>
                                    </CCol>
                                )}
                            </CRow>
                        )
                    )}
                </CModalBody>

                <CModalFooter className="enquiry-modal-footer">
                    <CButton
                        className='buttonLabel'
                        onClick={() => {
                            setShowViewModal(false)
                            setSelectedEnquiry(null)
                        }}
                    >
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>

            <style>{`
.enquiry-modal .modal-content {
    border-radius: 14px;
    border: 1px solid var(--darkBorderColor);
    background: #fff;
    box-shadow: 0 10px 30px rgba(0,0,0,0.12), 0 20px 60px rgba(0,0,0,0.18);
}

/* Header */
.enquiry-modal-header {
    background: var(--lightColor);
    border-bottom: 1px solid var(--darkBorderColor);
    padding: 1rem 1.25rem;
    position: relative;
}
.enquiry-modal-header::before {
    content: "";
    position: absolute;
    left: 0;
    top: 20%;
    width: 4px;
    height: 60%;
    background: var(--darkColor);
    border-radius: 0 4px 4px 0;
}
.enquiry-modal-header .modal-title {
    color: var(--darkColor);
    font-weight: 600;
    letter-spacing: 0.2px;
}

/* Body */
.enquiry-modal-body {
    padding: 1.25rem;
}

/* Field label and value */
.enquiry-modal-body label {
    color: rgba(11, 58, 130, 0.65);
    font-weight: 500;
    margin-bottom: 2px;
}
.enquiry-modal-body .fw-semibold {
    background: var(--lightColor);
    border: 1px solid var(--darkBorderColor);
    border-radius: 8px;
    padding: 0.45rem 0.6rem;
    color: var(--darkColor);
    box-shadow: inset 0 1px 2px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.05);
}

/* Message box */
.enquiry-text-box {
    background: #f8f9ff;
    border: 1px solid var(--darkBorderColor);
    border-radius: 10px;
    padding: 0.75rem;
    color: #333;
    line-height: 1.5;
    box-shadow: inset 0 1px 2px rgba(255,255,255,0.7), 0 2px 6px rgba(0,0,0,0.08);
}

/* Footer */
.enquiry-modal-footer {
    border-top: 1px solid var(--darkBorderColor);
    background: #fafbff;
}
.enquiry-modal-footer .btn-secondary {
    background: var(--darkColor);
    border-color: var(--darkColor);
    color: #fff;
}
.enquiry-modal-footer .btn-secondary:hover {
    background: #072c63;
    border-color: #072c63;
}
`}</style>

        </>
    )
}

export default EnquiryList
