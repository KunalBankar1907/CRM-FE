import React, { useEffect, useState } from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { logoutUser } from '../../utils/api'
import { IMAGE_BASE_URL } from '../../utils/helper'

const AppHeaderDropdown = () => {

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const userRole = currentUser?.role;
  const userProfilePic = currentUser?.profile_pic;
  const organization_id = currentUser?.organization_id;

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('token');

      if (token) {
        const response = await logoutUser();

        if (response.data.success) {
          toast.success(response.data.message || 'Logged out successfully', {
            position: 'top-right',
            autoClose: 3000,
          })
        } else {
          toast.error(response.data.message || 'Logout failed', {
            position: 'top-right',
            autoClose: 3000,
          })
        }

      }
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      sessionStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login', { replace: true })
    }
  }
  const handleOpenProfile = () => {
    const redirectRoute = userRole === "owner" ? '/owner/profile' : '/employee/profile';
    navigate(redirectRoute);
  }

  const [profilePic, setProfilePic] = useState(null);

  // Load profilePic from localStorage initially
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.profile_pic) {
      setProfilePic(storedUser.profile_pic);
    }
  }, []);

  // Catch Event here
  useEffect(() => {
    const handleProfilePicUpdate = (e) => setProfilePic(e.detail);
    window.addEventListener('profile-updated', handleProfilePicUpdate);
    return () => window.removeEventListener('profile-updated', handleProfilePicUpdate);
  }, []);

  const profileSrc =
    profilePic
      ? profilePic.startsWith('blob:')
        ? profilePic
        : `${IMAGE_BASE_URL}/uploads/${profilePic}` : null;


  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        {profileSrc ? (
          <CAvatar src={profileSrc} size="md" />
        ) : (
          <CAvatar size="md" className="d-flex align-items-center justify-content-center bg-light">
            <CIcon icon={cilUser} />
          </CAvatar>
        )}
      </CDropdownToggle>
      <CDropdownMenu className="pt-0 pb-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold">Account</CDropdownHeader>
        {/* <CDropdownItem href="#">
          <CIcon icon={cilBell} className="me-2" />
          Updates
          <CBadge color="info" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilEnvelopeOpen} className="me-2" />
          Messages
          <CBadge color="success" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilTask} className="me-2" />
          Tasks
          <CBadge color="danger" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilCommentSquare} className="me-2" />
          Comments
          <CBadge color="warning" className="ms-2">
            42
          </CBadge>
        </CDropdownItem> */}
        {/* <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader> */}
        <CDropdownItem className='py-2' style={{ cursor: "pointer" }} onClick={handleOpenProfile}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        {/* <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilCreditCard} className="me-2" />
          Payments
          <CBadge color="secondary" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilFile} className="me-2" />
          Projects
          <CBadge color="primary" className="ms-2">
            42
          </CBadge>
        </CDropdownItem> */}
        <CDropdownDivider className='my-0' />
        <CDropdownItem className='py-2' onClick={handleLogout} style={{ cursor: "pointer" }}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
