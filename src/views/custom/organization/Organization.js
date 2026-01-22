import React, { useEffect, useState } from 'react'
import { getOrganizationById, updateOrganization } from '../../../utils/api';
import { CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CImage, CRow, CSpinner } from '@coreui/react';
import { IMAGE_BASE_URL } from '../../../utils/helper';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CustomSpinner from '../../../components/custom/CustomSpinner';

const Organization = () => {
    const [isEditMode, setIsEditMode] = useState(false)
    const [loading, setLoading] = useState(false)
    const [previewLogo, setPreviewLogo] = useState(null)
    const [organization, setOrganization] = useState({
        organization_name: '',
        organization_contact: '',
        logo: null,
        timezone: 'Asia/Kolkata',
    })
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const organization_id = currentUser?.organization_id;

    // Fetch organization data on load
    useEffect(() => {
        if (organization_id) {
            fetchOrganization()
        }
    }, [organization_id])

    const fetchOrganization = async () => {
        try {
            setLoading(true);
            const response = await getOrganizationById(organization_id)
            if (response.data.success) {
                setOrganization({
                    organization_name: response.data.data.organization_name ?? '',
                    organization_contact: response.data.data.organization_contact ?? '',
                    logo: null,
                    timezone: response.data.data.timezone || 'Asia/Kolkata',
                })
                setPreviewLogo(response.data.data.logo)
            }
        } catch (err) {
            toast.error('Failed to fetch organization data')
        } finally {
            setLoading(false);
        }
    }

    // const handleChange = (e) => {
    //     const { name, value } = e.target
    //     setOrganization((prev) => ({ ...prev, [name]: value }))
    // }

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'organization_name') {
            newValue = value.replace(/[^a-zA-Z\s]/g, '');
        }

        if (name === 'organization_contact') {
            // newValue = value.replace(/\D/g, '');
            newValue = value.replace(/\D/g, '').slice(0, 10);

        }

        setOrganization(prev => ({
            ...prev,
            [name]: newValue
        }));
    }

    // const handleFileChange = (e) => {
    //     const file = e.target.files[0]
    //     if (file) {
    //         setOrganization((prev) => ({ ...prev, logo: file }))
    //         setPreviewLogo(URL.createObjectURL(file))
    //     }
    // }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            if (img.width !== 200 || img.height !== 50) {
                toast.error("Logo must be exactly 200 × 50 pixels");
                e.target.value = "";
                URL.revokeObjectURL(objectUrl);
                return;
            }

            setOrganization((prev) => ({ ...prev, logo: file }));
            setPreviewLogo(objectUrl);
        };

        img.onerror = () => {
            toast.error("Invalid image file");
            e.target.value = "";
            URL.revokeObjectURL(objectUrl);
        };

        img.src = objectUrl;
    };


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.append('organization_name', organization.organization_name)
        formData.append('organization_contact', organization.organization_contact)
        formData.append('timezone', organization.timezone)
        if (organization.logo) formData.append('logo', organization.logo)

        try {
            const response = await updateOrganization(organization_id, formData)
            if (response.data.success) {
                toast.success(response.data.message);
                setIsEditMode(false);

                // Update localStorage user logo
                const currentUser = JSON.parse(localStorage.getItem('user'))
                if (currentUser) {
                    const updatedUser = {
                        ...currentUser,
                        logo: response.data.data.logo || currentUser.logo,
                    }
                    localStorage.setItem('user', JSON.stringify(updatedUser));

                    //Dispatch an Event
                    window.dispatchEvent(
                        new CustomEvent('logo-updated', { detail: updatedUser.logo })
                    );

                }
                setOrganization((prev) => ({
                    ...prev,
                    logo: null,
                }))
                setPreviewLogo(response.data.data.logo)

                navigate('/owner/organization');
            } else {
                toast.error(response.data.message || 'Update failed')
            }
        } catch (err) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <CCard className="mb-4 shadow-sm">
                {/* Header */}
                <CCardHeader className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Organization Settings</h5>

                    {!isEditMode ? (
                        <CButton className='buttonLabel' onClick={() => setIsEditMode(true)}>
                            Edit
                        </CButton>
                    ) : (
                        <div className="d-flex gap-2">
                            <CButton className='buttonLabel' onClick={handleSubmit} disabled={loading}>
                                {loading ? <CSpinner size="sm" /> : 'Save'}
                            </CButton>
                            <CButton
                                className='buttonLabel-inverse'
                                variant="outline"
                                onClick={() => {
                                    setIsEditMode(false)
                                    fetchOrganization()
                                }}
                            >
                                Cancel
                            </CButton>
                        </div>
                    )}
                </CCardHeader>

                {/* Body */}
                <CCardBody>
                    {loading ?
                        <CustomSpinner />

                        : (
                            <CForm encType='multipart/form-data'>
                                <CRow>
                                    <CCol md={6}>
                                        {/* Organization Name */}
                                        <div className="mb-3">
                                            <CFormLabel>Organization Name</CFormLabel>
                                            <CFormInput
                                                name="organization_name"
                                                value={organization.organization_name}
                                                onChange={handleChange}
                                                readOnly={!isEditMode}
                                            />
                                        </div>
                                    </CCol>
                                    <CCol md={6}>
                                        <div className="mb-3">
                                            <CFormLabel>Organization Contact</CFormLabel>
                                            <CFormInput
                                                name="organization_contact"
                                                value={organization.organization_contact}
                                                onChange={handleChange}
                                                readOnly={!isEditMode}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </CCol>
                                </CRow>

                                {/* Logo */}
                                <div className="mb-3">
                                    <CFormLabel>Logo</CFormLabel>

                                    {previewLogo && (
                                        <div className="mb-2">
                                            {/* <CImage
                                        src={`${IMAGE_BASE_URL}/uploads/${previewLogo}`}
                                        height={90}
                                        rounded
                                        style={{ objectFit: 'cover', border: '1px solid' }}
                                    /> */}
                                            <CImage
                                                src={previewLogo.startsWith('blob:') ? previewLogo : `${IMAGE_BASE_URL}/uploads/${previewLogo}`}
                                                height={90}
                                                rounded
                                                // style={{ objectFit: 'cover', border: '1px solid' }}
                                                style={{
                                                    maxWidth: '100%',
                                                    height: 'auto',
                                                    objectFit: 'cover',
                                                    border: '1px solid',
                                                }}
                                            />
                                        </div>
                                    )}

                                    {isEditMode && (
                                        <>
                                            <CFormInput type="file" onChange={handleFileChange} />
                                            <small className="text-muted">Please upload a logo with dimensions 200 × 50 pixels</small>
                                        </>
                                    )}
                                </div>

                                {/* Timezone */}
                                <div className="mb-3">
                                    <CFormLabel>Time Zone</CFormLabel>
                                    <CFormSelect
                                        name="timezone"
                                        value={organization.timezone}
                                        onChange={handleChange}
                                        disabled={!isEditMode}
                                    >
                                        <option value="Asia/Kolkata">Asia/Kolkata</option>
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">America/New_York</option>
                                        <option value="Europe/London">Europe/London</option>
                                    </CFormSelect>
                                </div>
                            </CForm>
                        )
                    }
                </CCardBody>
            </CCard>
        </>
    )
}

export default Organization;