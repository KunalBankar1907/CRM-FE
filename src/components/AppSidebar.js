import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CImage,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import { logo } from 'src/assets/brand/logo'
import dummy_logo from 'src/assets/brand/dummy_logo.png'
import { sygnet } from 'src/assets/brand/sygnet'

// sidebar nav config
import navigation from '../_nav'
import employeeNav from '../navigations/employeeNav'
import adminNav from '../navigations/adminNav'
import { IMAGE_BASE_URL } from '../utils/helper'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || 'employee';

  const navigation = role === 'owner' ? adminNav : employeeNav;

  const [logo, setLogo] = useState(dummy_logo);

  // Load logo from localStorage initially
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.logo) {
      setLogo(storedUser.logo);
    }
  }, []);

  // Catch Event here
  useEffect(() => {
    const handleLogoUpdate = (e) => setLogo(e.detail);
    window.addEventListener('logo-updated', handleLogoUpdate);
    return () => window.removeEventListener('logo-updated', handleLogoUpdate);
  }, []);

  const logoSrc =
    logo && logo !== dummy_logo
      ? logo.startsWith('blob:')
        ? logo
        : `${IMAGE_BASE_URL}/uploads/${logo}`
      : dummy_logo;

  return (
    <>
      <CSidebar
        className="border-end"
        colorScheme="dark"
        position="fixed"
        unfoldable={unfoldable}
        visible={sidebarShow}
        onVisibleChange={(visible) => {
          dispatch({ type: 'set', sidebarShow: visible })
        }}
      >
        <CSidebarHeader className="border-bottom" style={{ paddingTop: "0", paddingBottom: "0" }}>
          <CSidebarBrand to="/">
            {/* <CIcon customClassName="sidebar-brand-full" icon={dummy_logo} height={32} /> */}
            {/* <CImage src={dummy_logo} height={32} style={{ width: "13rem" }}></CImage> */}
            <CImage src={logoSrc} height={50} style={{ width: '13rem' }} />
            <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
          </CSidebarBrand>
          <CCloseButton
            className="d-lg-none"
            dark
            onClick={() => dispatch({ type: 'set', sidebarShow: false })}
          />
        </CSidebarHeader>
        <AppSidebarNav items={navigation} />
        {/* <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter> */}
      </CSidebar >
    </>
  )
}

export default React.memo(AppSidebar)
