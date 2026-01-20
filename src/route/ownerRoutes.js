import React from 'react'

const OwnerDashboard = React.lazy(
  () => import('../views/custom/dashboard/Dashboard')
);
const OwnerProfile = React.lazy(
  () => import('../views/custom/OwnerProfile')
);
const EmployeeList = React.lazy(
  () => import('../views/custom/employee/EmployeeList')
);
const AddEmployee = React.lazy(
  () => import('../views/custom/employee/AddEmployee')
);
const Organization = React.lazy(
  () => import('../views/custom/organization/Organization')
);
const UpdateEmployee = React.lazy(
  () => import('../views/custom/employee/EditEmployee')
);
const LeadList = React.lazy(
  () => import('../views/custom/lead/ListLead')
);
const AddLead = React.lazy(
  () => import('../views/custom/lead/AddLead')
);
const UpdateLead = React.lazy(
  () => import('../views/custom/lead/EditLead')
);
const LeadDetails = React.lazy(
  () => import('../views/custom/lead/LeadDetails')
);
const AddStage = React.lazy(
  () => import('../views/custom/stage/AddStage')
);
const StageList = React.lazy(
  () => import('../views/custom/stage/StageList')
);
const UpdateStage = React.lazy(
  () => import('../views/custom/stage/EditStage')
);
const FollowUpList = React.lazy(
  () => import('../views/custom/followup/FollowUpList')
);
const ownerRoutes = [
  {
    path: 'dashboard',
    name: 'Owner Dashboard',
    element: OwnerDashboard,
  },
  {
    path: 'profile',
    element: OwnerProfile,
  },
  {
    path: 'organization',
    element: Organization,
  },
  {
    path: 'employee/list',
    element: EmployeeList,
  },
  {
    path: 'employee/add',
    element: AddEmployee,
  },
  {
    path: 'employee/edit/:id',
    element: UpdateEmployee,
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
    path: 'stage/list',
    element: StageList,
  },
  {
    path: 'stage/add',
    element: AddStage,
  },
  {
    path: 'stage/edit/:id',
    element: UpdateStage,
  },
  {
    path: 'follow-up/list',
    element: FollowUpList,
  },
]

export default ownerRoutes;
