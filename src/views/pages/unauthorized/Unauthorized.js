import React from 'react'
import { CContainer, CRow, CCol, CButton } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

const Unauthorized = () => {
    const navigate = useNavigate()

    return (
        <CContainer className="min-vh-100 d-flex">
            <CRow className="flex-fill justify-content-center align-items-center">
                <CCol md={6} className="text-center">
                    <h1 className="display-4 text-danger">403</h1>
                    <h4>Unauthorized Access</h4>
                    <p>You do not have permission to access this page.</p>
                    <CButton color="primary" onClick={() => navigate('/')}>
                        Go to Dashboard
                    </CButton>
                </CCol>
            </CRow>
        </CContainer>
    )
}

export default Unauthorized
