import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { CCard, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import ListHeader from '../../../components/custom/ListHeader'
import CustomSpinner from '../../../components/custom/CustomSpinner'
import { capitalizeWord, formatDateDDMMYYYY } from '../../../utils/helper'
import { getActiveEmployees, getAllLeads } from '../../../utils/api'
import { cilLowVision, cilOpentype, cilPencil, cilTrash, cilViewQuilt } from '@coreui/icons'

const ListLead = () => {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState('')
    const [users, setUsers] = useState([]);
    const [ownerFilter, setOwnerFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('')
    const [followUpFilter, setFollowUpFilter] = useState('')

    const navigate = useNavigate()

    // Fetch leads from backend
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
    }, [searchTerm, statusFilter, ownerFilter, sourceFilter, priorityFilter, followUpFilter, page])

    const currentUser = JSON.parse(localStorage.getItem('user'));
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

    // const handleDelete = async (id) => {
    //     if (!window.confirm('Are you sure you want to delete this lead?')) return
    //     try {
    //         const response = await deleteLead(id)
    //         if (response.data.success) {
    //             toast.success(response.data.message || 'Lead deleted successfully')
    //             setLeads((prev) => prev.filter((lead) => lead.id !== id))
    //         } else {
    //             toast.error(response.data.message || 'Failed to delete lead')
    //         }
    //     } catch (error) {
    //         toast.error(error.message || 'Something went wrong')
    //     }
    // }

    // const handleStatusChange = async (id) => {
    //     try {
    //         const response = await changeLeadStatus(id)
    //         if (response.data.success) {
    //             toast.success(response.data.message || 'Lead status changed successfully')
    //             setLeads((prev) =>
    //                 prev.map((lead) =>
    //                     lead.id === id
    //                         ? { ...lead, status: lead.status === 'New' ? 'Contacted' : 'New' } // Example toggle
    //                         : lead
    //                 )
    //             )
    //         } else {
    //             toast.error(response.data.message || 'Failed to change status')
    //         }
    //     } catch (error) {
    //         toast.error(error.message || 'Something went wrong')
    //     }
    // }

    return (
        <div className="p-0">
            <CCard>
                <ListHeader
                    title=""
                    layout="two-rows"
                    onAddClick={() => navigate('/owner/lead/add')}
                    addButtonLabel="Add Lead"
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
                            <option value="">All Status</option>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Lost">Lost</option>
                            <option value="Won">Won</option>
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
                            <option value="Email">Email</option>
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
                    ]}
                />

                {loading ? (
                    <CustomSpinner />
                ) : (
                    <CCardBody>
                        <div className="table-responsive shadow-sm rounded" style={{ backgroundColor: '#fff' }}>
                            <table className="table table-bordered table-striped table-hover align-middle mb-0">
                                <thead className="table-primary">
                                    <tr>
                                        <th>ID</th>
                                        <th>Lead Name</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Company</th>
                                        <th>Status</th>
                                        <th>Assigned Owner</th>
                                        <th>Priority</th>
                                        <th>Next Follow-Up</th>
                                        <th style={{ textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.length > 0 ? (
                                        leads.map((lead) => (
                                            <tr key={lead.id}>
                                                <td>{lead.id}</td>
                                                <td>{lead.lead_name}</td>
                                                <td>{lead.phone_number}</td>
                                                <td>{lead.email}</td>
                                                <td>{lead.company_name}</td>
                                                <td>
                                                    <span
                                                        className={`badge text-white ${lead.status.toLowerCase() === 'new'
                                                            ? 'bg-primary'
                                                            : lead.status.toLowerCase() === 'contacted'
                                                                ? 'bg-info'
                                                                : lead.status.toLowerCase() === 'won'
                                                                    ? 'bg-success'
                                                                    : 'bg-danger'
                                                            }`}
                                                        style={{ cursor: 'pointer' }}
                                                    // onClick={() => handleStatusChange(lead.id)}
                                                    >
                                                        {capitalizeWord(lead.status)}
                                                    </span>
                                                </td>
                                                <td>{lead?.assigned_owner?.name || '-'}</td>
                                                <td>{lead.priority}</td>
                                                {/* <td>{lead.next_follow_up || '-'}</td> */}
                                                <td>{formatDateDDMMYYYY(lead.next_follow_up)}</td>
                                                <td>
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <span
                                                            className="badge bg-primary"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => navigate(`/owner/lead/edit/${lead.id}`)}
                                                        >
                                                            <CIcon icon={cilPencil} />
                                                        </span>
                                                        <span
                                                            className="badge bg-danger"
                                                            style={{ cursor: 'pointer' }}
                                                        // onClick={() => handleDelete(lead.id)}
                                                        >
                                                            <CIcon icon={cilTrash} />
                                                        </span>
                                                        <span
                                                            className="badge bg-info"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => navigate(`/owner/lead/view/${lead.id}`)}
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
            </CCard>
        </div>
    )
}

export default ListLead
