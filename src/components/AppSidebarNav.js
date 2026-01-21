import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'

export const AppSidebarNav = ({ items }) => {

  const location = useLocation();

  const navLink = (name, icon, badge, indent = false) => {
    return (
      <div className={`d-flex align-items-center ${indent ? "ms-3" : ""}`}>
        {icon && (
          <div
            className="me-2 d-flex justify-content-center align-items-center"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
            }}
          >
            {icon}
          </div>
        )}
        <span className="flex-grow-1 text-truncate fw-semibold">{name}</span>
        {badge && (
          <CBadge color={badge.color} className="ms-auto rounded-pill px-2 py-1">
            {badge.text}
          </CBadge>
        )}
      </div>
    );
  };


  const navItem = (item, index, indent = false) => {
    // const { component, name, badge, icon, ...rest } = item
    const { component, name, badge, icon, to, href, ...rest } = item
    const Component = component

    const isActive = to && location.pathname.startsWith(to)

    return (
      <Component as="div" key={index}>
        {to || href ? (
          <CNavLink
            as={to ? NavLink : "a"}
            to={to}
            href={href}
            className={`d-flex align-items-center nav-link-custom ${isActive ? "active  text-white" : ""
              }`}
            {...(href && { target: "_blank", rel: "noopener noreferrer" })}
            {...rest}
          >
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    );

  }

  const navGroup = (item, index) => {
    const { component, name, icon, items, to, ...rest } = item
    const Component = component

    return (
      <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
        {items?.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index, true),
        )}
      </Component>
    )
  }

  return (
    <>
    <CSidebarNav as={SimpleBar}>
      {items &&
        items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
    </CSidebarNav>
    <style>{`
      .sidebar {
  background: var(--lightColor);
  border-right: 1px solid var(--darkBorderColor);
}

.sidebar .nav-group {
  margin-bottom: 0.4rem;
}

.sidebar-nav .nav-group-toggle {
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  padding: 0.5rem 0.75rem;
}

.sidebar-nav .nav-link {
  color: var(--darkColor);
  font-weight: 500;
  border-radius: 8px;
  margin: 0.3rem 0;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  transition: all 0.2s ease-in-out;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 4px 4px 5px rgba(0, 0, 0, 0.15);
}
.sidebar-nav .nav-link:hover,
.sidebar-nav .nav-link .nav-icon:hover {
  // background: #0c408f;
  background: var(--darkColor);
  color: #fff;
}

.sidebar-nav .nav-link.active {
  background: var(--darkColor);
  color: #fff;
  font-weight: 600;
}

.sidebar-nav .nav-link .nav-icon {
    color: var(--darkColor);
}

.sidebar-nav .nav-link .nav-icon .nav-icon-bullet {
    background: var(--darkColor);
}
    `}</style>
    </>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
