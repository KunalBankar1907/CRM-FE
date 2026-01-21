import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import { CCard, CCardBody, CButton, CBadge, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import ListHeader from '../../../components/custom/ListHeader'
import CustomSpinner from '../../../components/custom/CustomSpinner'
import { capitalizeWord, formatDateDDMMYYYY, initDataTable, statusColorMap } from '../../../utils/helper'
import { changeLeadStage, deleteLead, exportLeads, getActiveEmployees, getAllLeads, importLeads } from '../../../utils/api'
import { cilPencil, cilTrash, cilOpentype, cilViewQuilt, cilCloudUpload, cilCloudDownload, cilXCircle, cilCheckCircle } from '@coreui/icons'
import CustomDataTable from '../../../components/custom/CustomDatatable'
import { fetchStagesValues } from '../../../utils/service'
import { DEFAULT_LENGTH_CHANGE, DEFAULT_PAGE_LENGTH, DEFAULT_PAGING, DEFAULT_SEARCHING, PAGE_LENGTH_MENU } from '../../../utils/constant'

// const statusColorMap = {
//     New: 'primary',
//     Contacted: 'info',
//     Qualified: 'warning',
//     Won: 'success',
//     Lost: 'danger',
// }

// const stages = ['New', 'Contacted', 'Qualified', 'Lost', 'Won']

const ListLead = () => {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState('')
    const [users, setUsers] = useState([])
    const [ownerFilter, setOwnerFilter] = useState('')
    const [sourceFilter, setSourceFilter] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('')
    const [followUpFilter, setFollowUpFilter] = useState('')
    const [stagesValues, setStagesValues] = useState([]);
    const [stageUpdating, setStageUpdating] = useState(false);

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [exporting, setExporting] = useState(false);


    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importSummary, setImportSummary] = useState(null);
    const [importErrors, setImportErrors] = useState([]);
    const [isImporting, setIsImporting] = useState(false);


    const [viewMode, setViewMode] = useState('list'); // 'list' or 'pipeline'

    const navigate = useNavigate();
    const tableRef = useRef();
    const dataTableInstance = useRef(null);

    useEffect(() => {
        const getStages = async () => {
            const values = await fetchStagesValues();
            setStagesValues(values);
        }
        getStages();
    }, []);


    const fetchLeads = async () => {
        setLoading(true)
        try {
            const response = await getAllLeads({
                search: searchTerm,
                status: statusFilter,
                assigned_owner: ownerFilter,
                lead_source: sourceFilter,
                priority: priorityFilter,
                follow_up_status: followUpFilter,
                page,
                from_date: fromDate,
                to_date: toDate,
            })

            if (response.data.success) {
                setLeads(response.data.data)
            } else {
                toast.error(response.data.message || 'Failed to fetch leads')
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timeout = setTimeout(fetchLeads, 400)
        return () => clearTimeout(timeout)
    }, [searchTerm, statusFilter, ownerFilter, sourceFilter, priorityFilter, followUpFilter, page, fromDate, toDate])

    const currentUser = JSON.parse(localStorage.getItem('user'))
    const organization_id = currentUser?.organization_id;

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
        fetchUsers()
    }, [organization_id])

    // Group leads by status for pipeline view
    const leadsByStatus = stagesValues.reduce((acc, stage) => {
        acc[stage.stage_name] = leads.filter((lead) => lead.status === stage.stage_name)
        return acc;
    }, {})

    const handleDeleteLead = async (id) => {
        try {
            const response = await deleteLead(id);
            if (response.data.success) {
                toast.success(response.data.message || 'Lead deleted successfully');
                setLeads((prev) => prev.filter((lead) => lead.id !== id));
            } else {
                toast.error(response.data.message || 'Failed to delete lead');
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
        }
    }

    const handleStageChange = async (id, newStage) => {
        // if (newStage === lead.status) return;
        setStageUpdating(true);
        try {
            const res = await changeLeadStage(id, { status: newStage });

            if (res.data.success) {
                // setLeads(prev => ({ ...prev, status: newStage }));

                fetchLeads();

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

    useEffect(() => {
        if (loading || viewMode !== 'list' || leads.length === 0) return;

        const table = tableRef.current;
        if (!table) return;

        // Initialize DataTable
        dataTableInstance.current = $(table).DataTable({
            // paging: false,
            searching: DEFAULT_SEARCHING,
            paging: DEFAULT_PAGING,
            pageLength: DEFAULT_PAGE_LENGTH,
            lengthChange: DEFAULT_LENGTH_CHANGE,
            lengthMenu: PAGE_LENGTH_MENU,
            order: [[0, 'asc']],
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
    }, [leads, loading, viewMode]);


    const handleExport = async () => {
        if (exporting) return;
        try {
            setExporting(true);
            const params = {
                search: searchTerm || '',
                status: statusFilter || '',
                assigned_owner: ownerFilter || '',
                lead_source: sourceFilter || '',
                priority: priorityFilter || '',
                follow_up_status: followUpFilter || '',
                from_date: fromDate || '',
                to_date: toDate || '',
            };

            const response = await exportLeads(params);

            const contentType = response.headers['content-type'];

            const disposition = response.headers['content-disposition'];
            let fileName = `leads_${Date.now()}.csv`;

            if (disposition && disposition.includes('filename=')) {
                fileName = disposition
                    .split('filename=')[1]
                    .replace(/"/g, '');
            }

            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed', error);
        } finally {
            setExporting(false);
        }
    };

    const handleImport = async () => {
        if (!importFile) return;

        setIsImporting(true);
        setImportSummary(null);
        setImportErrors([]);

        try {
            const formData = new FormData();
            formData.append('file', importFile);

            const res = await importLeads(formData); // your API call

            // Backend should return: { success: true, summary: { success: X, failed: Y, errors: [...] } }
            const summary = res?.data?.summary || { success: 0, failed: 0, errors: [] };

            setImportSummary({ success: summary.success, failed: summary.failed });
            setImportErrors(summary.errors || []);

            setIsImporting(false);

            setTimeout(() => {
                setShowImportModal(false);
                fetchLeads();
            }, 3000);
        } catch (err) {
            console.error(err);
            setIsImporting(false);
            toast.error('Import failed');
        }
    };


    return (
        <>
            <div className="p-0">
                <CCard className="mb-2">
                    <CCardBody className="px-0 py-1">
                        <div>
                            <ListHeader
                                title=""
                                layout="two-rows"
                                // onAddClick={() => navigate('/owner/lead/add')}
                                // addButtonLabel="Add Lead"
                                extraButton={
                                    <>
                                        <CButton
                                            className='buttonLabel'
                                            style={{ paddingTop: "0.375rem", paddingBottom: "0.375rem" }}
                                            size="sm"
                                            onClick={() => navigate('/owner/lead/add')}
                                        >
                                            Add Lead
                                        </CButton>
                                        <CButton
                                            // className='buttonLabel'
                                            color='primary'
                                            style={{ paddingTop: "0.375rem", paddingBottom: "0.375rem" }}
                                            size="sm"
                                            onClick={handleExport}
                                        >
                                            {/* Export <CIcon icon={cilCloudDownload} /> */}
                                            {exporting ? (
                                                <>
                                                    <CSpinner size="sm" className="me-2" />
                                                </>
                                            ) : (
                                                <>
                                                    Export <CIcon icon={cilCloudDownload} />
                                                </>
                                            )}
                                        </CButton>
                                        <CButton
                                            // className="buttonLabel"
                                            color='info'
                                            size="sm"
                                            onClick={() => setShowImportModal(true)}
                                        >
                                            Import <CIcon icon={cilCloudUpload} />
                                        </CButton>

                                    </>
                                }
                                searchValue={searchTerm}
                                onSearchChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setPage(1)
                                }}
                                filterComponents={[
                                    <select
                                        key="status"
                                        className="form-select"
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value)
                                            setPage(1)
                                        }}
                                    >
                                        <option value="">All Stages</option>
                                        {stagesValues.map((s) => (
                                            <option key={s.stage_name} value={s.stage_name}>{s.stage_name}</option>
                                        ))}
                                    </select>,
                                    <select
                                        key="owner"
                                        className="form-select"
                                        value={ownerFilter}
                                        onChange={(e) => {
                                            setOwnerFilter(e.target.value)
                                            setPage(1)
                                        }}
                                    >
                                        <option value="">All Owners</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>,
                                    <select
                                        key="source"
                                        className="form-select"
                                        value={sourceFilter}
                                        onChange={(e) => {
                                            setSourceFilter(e.target.value)
                                            setPage(1)
                                        }}
                                    >
                                        <option value="">All Sources</option>
                                        <option value="Referral">Referral</option>
                                        <option value="Website">Website</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="Linkedin">LinkedIn</option>
                                    </select>,
                                    <select
                                        key="priority"
                                        className="form-select"
                                        value={priorityFilter}
                                        onChange={(e) => {
                                            setPriorityFilter(e.target.value)
                                            setPage(1)
                                        }}
                                    >
                                        <option value="">All Priorities</option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>,
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
                                    <div className="date-range-wrapper">
                                        <div className="date-field">
                                            <label className="date-label">From</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={fromDate}
                                                max={toDate || undefined}
                                                onChange={(e) => {
                                                    const val = e.target.value
                                                    setFromDate(val)
                                                    if (toDate && val > toDate) setToDate(val)
                                                    setPage(1)
                                                }}
                                                onClick={(e) => {
                                                    if (e.target.showPicker) {
                                                        e.target.showPicker();
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="date-field">
                                            <label className="date-label">To</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={toDate}
                                                min={fromDate || undefined}
                                                onChange={(e) => {
                                                    setToDate(e.target.value)
                                                    setPage(1)
                                                }}
                                                onClick={(e) => {
                                                    if (e.target.showPicker) {
                                                        e.target.showPicker();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>,

                                    <div>
                                        <CButton
                                            className={`me-2 ${viewMode === "list" ? "buttonLabel" : "buttonLabel-inverse"}`}
                                            // color={viewMode === 'list' ? 'primary' : 'secondary'}
                                            size="sm"
                                            style={{ paddingTop: "0.375rem", paddingBottom: "0.375rem" }}
                                            onClick={() => setViewMode('list')}
                                        >
                                            List View
                                        </CButton>

                                        <CButton
                                            className={`me-2 ${viewMode === "pipeline" ? "buttonLabel" : "buttonLabel-inverse"}`}
                                            // color={viewMode === 'pipeline' ? 'primary' : 'secondary'}
                                            size="sm"
                                            style={{ paddingTop: "0.375rem", paddingBottom: "0.375rem" }}
                                            onClick={() => setViewMode('pipeline')}
                                        >
                                            Pipeline View
                                        </CButton>
                                    </div>
                                ]}
                            />
                        </div>

                        {/* <div className="d-flex justify-content-center gap-1 my-2">
                        <CButton
                            color={viewMode === 'list' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            List View
                        </CButton>

                        <CButton
                            color={viewMode === 'pipeline' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setViewMode('pipeline')}
                        >
                            Pipeline View
                        </CButton>
                    </div> */}

                    </CCardBody>
                    {loading ? (
                        <CustomSpinner />
                    ) : viewMode === 'list' && (
                        <CCardBody className="pt-0">
                            <div className="table-responsive rounded" style={{ backgroundColor: '#fff' }}>
                                <table ref={tableRef} className="table table-bordered table-striped table-hover align-middle mb-0">
                                    <thead className="table-primary">
                                        <tr>
                                            <th>#</th>
                                            <th>Lead Name</th>
                                            <th>Phone</th>
                                            <th>Email</th>
                                            <th>Company</th>
                                            <th>Stage</th>
                                            <th>Assigned To</th>
                                            <th>Priority</th>
                                            <th>Next Follow-Up</th>
                                            <th style={{ textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.length > 0 ? (
                                            leads.map((lead, i) => (
                                                <tr key={lead.id}>
                                                    {/* <td>{lead.id}</td> */}
                                                    <td>{i + 1}</td>
                                                    <td onClick={() => navigate(`/owner/lead/view/${lead.id}`)} style={{ cursor: "pointer" }}>{lead.lead_name}</td>
                                                    <td>{lead.phone_number}</td>
                                                    <td>{lead.email}</td>
                                                    <td>{lead.company_name}</td>
                                                    <td>
                                                        <CBadge
                                                            className="py-1 px-2 text-white"
                                                            style={{
                                                                backgroundColor: statusColorMap[lead.status] || '#6c757d',
                                                                fontSize: '0.875rem',
                                                                minHeight: '32px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            {capitalizeWord(lead.status)}
                                                        </CBadge>

                                                    </td>
                                                    <td>{lead?.assigned_owner?.name || '-'}</td>
                                                    <td>{lead.priority}</td>
                                                    <td>{formatDateDDMMYYYY(lead.next_follow_up)}</td>
                                                    <td>
                                                        <div className="d-flex gap-2 justify-content-center">
                                                            <span
                                                                className="badge bg-dark"
                                                                style={{ cursor: 'pointer', paddingTop: "0.375rem", paddingBottom: "0.375rem" }}
                                                                onClick={() => navigate(`/owner/lead/edit/${lead.id}`)}
                                                                title={`Edit Lead: ${lead.lead_name}`}
                                                            >
                                                                <CIcon icon={cilPencil} />
                                                            </span>
                                                            <span
                                                                className="badge bg-danger"
                                                                style={{ cursor: 'pointer', paddingTop: "0.375rem", paddingBottom: "0.375rem" }}
                                                                onClick={() => handleDeleteLead(lead.id)}
                                                                title={`Delete Lead: ${lead.lead_name}`}
                                                            >
                                                                <CIcon icon={cilTrash} />
                                                            </span>
                                                            <span
                                                                className="badge bg-info"
                                                                style={{ cursor: 'pointer', paddingTop: "0.375rem", paddingBottom: "0.375rem" }}
                                                                onClick={() => navigate(`/owner/lead/view/${lead.id}`)}
                                                                title={`View Lead: ${lead.lead_name}`}
                                                            >
                                                                <CIcon icon={cilOpentype} />
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="10" className="text-center text-muted py-4">
                                                    No leads found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CCardBody>
                    )}

                    {/* Pipeline / Kanban View */}
                    {!loading && viewMode === 'pipeline' && (
                        <CCardBody className="pt-0">
                            <div style={{ overflowX: 'auto' }}>
                                <div className="d-flex gap-3" style={{ minWidth: '900px' }}>
                                    {stagesValues.map((stage) => (
                                        <div
                                            key={stage.id}
                                            style={{
                                                flex: '1 0 220px',
                                                backgroundColor: '#fff',
                                                borderRadius: '8px',
                                                border: '1px solid #0000004b',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                maxHeight: '75vh',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    padding: '10px 15px',
                                                    borderBottom: '1px solid #ddd',
                                                    fontWeight: '600',
                                                    fontSize: '1rem',
                                                    color: `${statusColorMap[stage.stage_name]}`,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <span>{stage.stage_name}</span>
                                                <CBadge style={{
                                                    color: 'var(--lightColor)',
                                                    backgroundColor: `${statusColorMap[stage.stage_name]}`
                                                }}>
                                                    {leadsByStatus[stage.stage_name]?.length || 0}
                                                </CBadge>
                                            </div>
                                            <div
                                                style={{
                                                    padding: '10px',
                                                    overflowY: 'auto',
                                                    flexGrow: 1,
                                                    minHeight: '200px',
                                                }}
                                            >
                                                {leadsByStatus[stage.stage_name]?.length ? (
                                                    leadsByStatus[stage.stage_name].map((lead) => (
                                                        <div
                                                            key={lead.id}
                                                            className="shadow rounded p-3 mb-3"
                                                            style={{
                                                                backgroundColor: '#ffffff',
                                                                cursor: 'pointer',
                                                                border: '1px solid #0000004b',
                                                            }}
                                                            onClick={() => navigate(`/owner/lead/view/${lead.id}`)}
                                                            title={`View Lead: ${lead.lead_name}`}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <strong>{lead.lead_name}</strong>
                                                            </div>
                                                            <div style={{ fontSize: '0.85rem', color: '#555' }}>
                                                                <div>{lead.company_name || '-'}</div>
                                                                <div>Owner: {lead?.assigned_owner?.name || '-'}</div>
                                                                <div>Priority: {lead.priority || '-'}</div>
                                                                {lead.next_follow_up &&
                                                                    <div>Next Follow-Up: {formatDateDDMMYYYY(lead.next_follow_up) || '-'}</div>
                                                                }
                                                            </div>
                                                            <div className="d-flex justify-content-end gap-2 mt-2">
                                                                <CButton
                                                                    size="sm"
                                                                    className="buttonLabel"
                                                                    title={`Edit Lead: ${lead.lead_name}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        navigate(`/owner/lead/edit/${lead.id}`)
                                                                    }}
                                                                >
                                                                    <CIcon icon={cilPencil} />
                                                                </CButton>
                                                                <CButton
                                                                    size="sm"
                                                                    color="danger"
                                                                    title={`Delete Lead: ${lead.lead_name}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleDeleteLead(lead.id)
                                                                    }}
                                                                >
                                                                    <CIcon icon={cilTrash} />
                                                                </CButton>
                                                            </div>
                                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                                <small className="text-muted">Stage</small>

                                                                <select
                                                                    style={{ marginLeft: '1rem' }}
                                                                    className="form-select form-select-sm"
                                                                    value={lead.status}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation()
                                                                        handleStageChange(lead.id, e.target.value)
                                                                    }}
                                                                >
                                                                    {stagesValues.map((stage) => (
                                                                        <option key={stage.id} value={stage.stage_name}>
                                                                            {stage.stage_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-muted text-center mt-3">No leads in this stage</p>
                                                )}
                                            </div>


                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CCardBody>
                    )}
                </CCard>
            </div>

            <CModal
                visible={showImportModal}
                onClose={() => setShowImportModal(false)}
            >
                <CModalHeader>
                    <CModalTitle>Import Leads</CModalTitle>
                </CModalHeader>

                <CModalBody>
                    {/* Download sample CSV */}
                    <div className="mb-3">
                        <a
                            href='/sample_leads_template.csv'
                            download
                            className="btn btn-sm btn-outline-primary"
                        >
                            Download Sample CSV
                        </a>
                    </div>

                    {/* File input */}
                    <div className="mb-3">
                        <input
                            type="file"
                            accept=".csv"
                            className="form-control"
                            onChange={(e) => setImportFile(e.target.files[0])}
                        />
                    </div>

                    {/* Summary after import */}
                    {importSummary && (
                        <div className="mt-3">
                            <h6>Import Summary:</h6>

                            <p className="d-flex align-items-center mb-1">
                                <CIcon
                                    icon={cilCheckCircle}
                                    className="me-2"
                                    style={{ color: "#198754" }}
                                />
                                <span>Success: {importSummary.success}</span>
                            </p>

                            <p className="d-flex align-items-center mb-1">
                                <CIcon
                                    icon={cilXCircle}
                                    className="me-2"
                                    style={{ color: "#dc3545" }}
                                />
                                <span>Failed: {importSummary.failed}</span>
                            </p>

                            {importErrors.length > 0 && (
                                <div className="mt-2">
                                    <h6>Errors:</h6>
                                    <ul style={{ maxHeight: '150px', overflowY: 'auto', paddingLeft: '1rem' }}>
                                        {importErrors.map((err, idx) => (
                                            <li key={idx}>
                                                Row {err.row}: {err.errors.join(', ')}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                </CModalBody>

                <CModalFooter>
                    <CButton
                        color="secondary"
                        onClick={() => setShowImportModal(false)}
                    >
                        Close
                    </CButton>
                    <CButton
                        color="primary"
                        onClick={handleImport}
                        disabled={!importFile || isImporting}
                    >
                        {isImporting ? 'Importing...' : 'Import'}
                    </CButton>
                </CModalFooter>
            </CModal>
            <style>{`
                    .date-range-wrapper {
                        display: flex;
                        gap: 12px;
                        min-width: 260px;
                        }

                        .date-field {
                        display: flex;
                        flex-direction: column;
                        }

                        .date-label {
                        color: #6c757d;
                        margin-bottom: 2px;
                        }

                        /* Mobile handling */
                        @media (max-width: 576px) {
                        .date-range-wrapper {
                            flex-direction: column;
                        }
                        }   

                `}</style>

        </>
    )
}

export default ListLead
