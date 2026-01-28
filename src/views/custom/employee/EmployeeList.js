import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { changeEmployeeStatus, deleteEmployee, getAllEmployees } from '../../../utils/api';
import { capitalizeWord, initDataTable } from '../../../utils/helper';
import { CCard, CCardBody, CSpinner } from '@coreui/react';
import ListHeader from '../../../components/custom/ListHeader';
import { useNavigate } from 'react-router-dom';
import CustomSpinner from '../../../components/custom/CustomSpinner';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash } from '@coreui/icons';
import CustomDataTable from '../../../components/custom/CustomDatatable';
import { DEFAULT_LENGTH_CHANGE, DEFAULT_PAGE_LENGTH, DEFAULT_PAGING, DEFAULT_SEARCHING, PAGE_LENGTH_MENU } from '../../../utils/constant';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');

    const tableRef = useRef(null);
    const dataTableInstance = useRef(null);

    // Fetch employees from backend
    const fetchEmployees = async () => {
        setLoading(true)
        try {
            const token = sessionStorage.getItem('token')
            const response = await getAllEmployees({
                search: searchTerm,
                status,
                page,
            });

            if (response.data.success) {
                setEmployees(response.data.data)
            } else {
                toast.error(response.data.message || 'Failed to fetch employees')
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    // useEffect(() => {
    //     fetchEmployees()
    // }, [searchTerm, page])


    useEffect(() => {
        const timeout = setTimeout(fetchEmployees, 400);
        return () => clearTimeout(timeout);
    }, [searchTerm, status, page]);


    // Initialize DataTable after table renders
    // useEffect(() => {
    //     if (!loading && employees.length > 0) {
    //         // Initialize DataTable with filters
    //         const destroyTable = initDataTable(tableRef, {}, [
    //             { selector: '#statusFilter', columnIndex: 4, type: 'select' }, // Status column
    //             { selector: '#searchName', columnIndex: 1, type: 'text' },     // Name column
    //         ]);

    //         return () => destroyTable(); // Cleanup
    //     }
    // }, [employees, loading]);

    useEffect(() => {
        if (loading || employees.length === 0) return;

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
    }, [employees, loading]);


    const handleStatusFilterChange = (e) => {
        setStatus(e.target.value);
        setPage(1);
    };

    const handleStatusChange = async (id) => {
        try {
            const response = await changeEmployeeStatus(id);

            if (response.data.success) {
                toast.success(response.data.message || 'Employees Status changed successfully')

                await fetchEmployees();

            } else {
                toast.error(response.data.message || 'Failed to change status')
            }
        } catch (error) {
            console.log(error);
            // toast.error(error.message)
        }
    }

    const handleEdit = (id) => {
        navigate(`/owner/employee/edit/${id}`);
    }

    const handleDelete = async (id) => {
        try {
            const response = await deleteEmployee(id);
            if (response.data.success) {
                toast.success(response.data.message || 'Employees deleted successfully');
                await fetchEmployees();
            } else {
                toast.error(response.data.message || 'Failed to delete employee');
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
        }
    }


    return (
        <div className="p-0">
            <CCard>
                <ListHeader
                    title=""
                    onAddClick={() => navigate('/owner/employee/add')}
                    addButtonLabel="Add Employee"
                    searchValue={searchTerm}
                    onSearchChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                    }}
                    filterComponents={[
                        <select
                            key="status"
                            className="form-select"
                            value={status}
                            onChange={handleStatusFilterChange}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>,
                    ]}
                // filterComponents={[
                //     <select key="role" className="form-select">
                //         <option value="">All Roles</option>
                //         <option value="employee">Employee</option>
                //         <option value="owner">Owner</option>
                //     </select>,
                //     <select key="status" className="form-select">
                //         <option value="">All Status</option>
                //         <option value="active">Active</option>
                //         <option value="inactive">Inactive</option>
                //     </select>,
                //     <input
                //         key="date"
                //         type="date"
                //         className="form-control"
                //         placeholder="Date"
                //     />,
                // ]}
                />

                {loading ? (
                    // <p>Loading...</p>
                    <CustomSpinner />
                ) : (

                    <CCardBody className="pt-0">
                        <div className="table-responsive rounded" style={{ backgroundColor: '#fff' }}>
                            <table ref={tableRef} className="table table-bordered table-striped table-hover align-middle mb-0">
                                <thead className="table-primary">
                                    <tr>
                                        <th scope="col" style={{ fontWeight: '600' }}>#</th>
                                        <th scope="col" style={{ fontWeight: '600' }}>Name</th>
                                        <th scope="col" style={{ fontWeight: '600' }}>Email</th>
                                        <th scope="col" style={{ fontWeight: '600' }}>Phone Number</th>
                                        <th scope="col" style={{ fontWeight: '600' }}>Status</th>
                                        <th scope="col" style={{ fontWeight: '600', textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.length > 0 ? (
                                        employees.map((emp, i) => (
                                            <tr key={emp.id} style={{ cursor: 'default' }}>
                                                <td>{i + 1}</td>
                                                {/* <td>{emp.id}</td> */}
                                                <td>{emp.name}</td>
                                                <td>{emp.email}</td>
                                                <td>{emp.phone_number}</td>
                                                <td>
                                                    <span
                                                        className={`badge  ${emp.status.toLowerCase() === 'active' ? 'bg-success' : 'bg-danger'}`}
                                                        style={{ padding: '0.35em 0.75em', cursor: 'pointer' }}
                                                        onClick={() => handleStatusChange(emp.id)}
                                                    >
                                                        {capitalizeWord(emp.status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="table-actions d-flex gap-2 justify-content-center flex-row">
                                                        <span
                                                            className=" action-btn edit"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleEdit(emp.id)}
                                                        >
                                                            <CIcon icon={cilPencil} />
                                                        </span>
                                                        <span
                                                            className=" action-btn delete"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleDelete(emp.id)}
                                                        >
                                                            <CIcon icon={cilTrash} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        !loading && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-muted">
                                                    No employees found
                                                </td>
                                            </tr>
                                        )
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

export default EmployeeList
