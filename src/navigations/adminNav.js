import React from 'react'
import CIcon from '@coreui/icons-react'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { cilSpeedometer, cilDrop, cilPencil, cilDescription, cilUser, cibLibreoffice, cilPuzzle, cilUserFollow, cilTransfer, cilTask } from '@coreui/icons'

const adminNav = [
    {
        component: CNavItem,
        name: 'Dashboard',
        to: '/owner/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    },
    {
        component: CNavItem,
        name: 'Organization',
        to: '/owner/organization',
        icon: <CIcon icon={cibLibreoffice} customClassName="nav-icon" />,
    },
    // {
    //     component: CNavGroup,
    //     name: 'Employees',
    //     icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    //     items: [
    //         {
    //             component: CNavItem,
    //             name: 'Add',
    //             to: '/owner/employee/add',
    //         },
    //         {
    //             component: CNavItem,
    //             name: 'List',
    //             to: '/owner/employee/list',
    //         },
    //     ]
    // },
    // {
    //     component: CNavGroup,
    //     name: 'Lead',
    //     icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
    //     items: [
    //         {
    //             component: CNavItem,
    //             name: 'Add',
    //             to: '/owner/lead/add',
    //         },
    //         {
    //             component: CNavItem,
    //             name: 'List',
    //             to: '/owner/lead/list',
    //         },
    //     ]
    // },
    {
        component: CNavItem,
        name: 'Employees',
        to: '/owner/employee/list',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    },
    {
        component: CNavItem,
        name: 'Leads',
        to: '/owner/lead/list',
        icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
    },
    {
        component: CNavItem,
        name: 'Pipeline Stage',
        to: '/owner/stage/list',
        icon: <CIcon icon={cilTransfer} customClassName="nav-icon" />,
    },
    {
        component: CNavItem,
        name: 'Follow-up Management',
        to: '/owner/follow-up/list',
        icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
    },
    // {
    //     component: CNavGroup,
    //     name: 'Pipeline Stage',
    //     icon: <CIcon icon={cilTransfer} customClassName="nav-icon" />,
    //     items: [
    //         // {
    //         //     component: CNavItem,
    //         //     name: 'Add',
    //         //     to: '/owner/stage/add',
    //         // },
    //         {
    //             component: CNavItem,
    //             name: 'List',
    //             to: '/owner/stage/list',
    //         },
    //     ]
    // },
]

export default adminNav
