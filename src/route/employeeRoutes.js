import React from 'react'

const EmployeeDashboard = React.lazy(
    () => import('../views/employee-views/EmployeeDashboard')
);
const EmployeeProfile = React.lazy(
    () => import('../views/employee-views/EmployeeProfile')
);
const LeadList = React.lazy(
    () => import('../views/employee-views/lead/ListLead')
);
const AddLead = React.lazy(
    () => import('../views/employee-views/lead/AddLead')
);
const UpdateLead = React.lazy(
    () => import('../views/employee-views/lead/EditLead')
);
const LeadDetails = React.lazy(
    () => import('../views/employee-views/lead/LeadDetails')
);
const FollowUpList = React.lazy(
    () => import('../views/employee-views/followup/FollowUpList')
);

const employeeRoutes = [
    {
        path: 'dashboard',
        name: 'Employee Dashboard',
        element: EmployeeDashboard,
    },
    {
        path: 'profile',
        element: EmployeeProfile,
    },
    {
        path: 'lead/add',
        element: AddLead,
    },
    {
        path: 'lead/list',
        element: LeadList,
    },
    {
        path: 'lead/edit/:id',
        element: UpdateLead,
    },
    {
        path: 'lead/view/:id',
        element: LeadDetails,
    },
    {
        path: 'follow-up/list',
        element: FollowUpList,
    },
]

export default employeeRoutes
