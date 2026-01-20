import React from 'react'
import CIcon from '@coreui/icons-react'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { cilSpeedometer, cilDrop, cilPencil, cilDescription, cilUserFollow, cilTask } from '@coreui/icons'

const employeeNav = [
    {
        component: CNavItem,
        name: 'Dashboard',
        to: '/employee/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    },
    // {
    //     component: CNavGroup,
    //     name: 'Lead',
    //     icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
    //     items: [
    //         {
    //             component: CNavItem,
    //             name: 'Add',
    //             to: '/employee/lead/add',
    //         },
    //         {
    //             component: CNavItem,
    //             name: 'List',
    //             to: '/employee/lead/list',
    //         },
    //     ]
    // },
    {
        component: CNavItem,
        name: 'Leads',
        to: '/employee/lead/list',
        icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
    },
    {
        component: CNavItem,
        name: 'Follow-up Management',
        to: '/employee/follow-up/list',
        icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
    },
]

export default employeeNav
