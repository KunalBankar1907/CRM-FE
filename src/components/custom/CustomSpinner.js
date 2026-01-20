import { CSpinner } from '@coreui/react'
import React from 'react'

const CustomSpinner = () => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
            }}
        >
            <CSpinner color="primary" />
        </div>
    )
}

export default CustomSpinner