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
      {/* <style>{`
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
    `}</style> */}
      <style>{`
        .sidebar {
          background: var(--lightColor);
          border-right: 1px solid var(--darkBorderColor);
          box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
        }

        .sidebar .nav-group {
          margin-bottom: 0.5rem;
        }

        .sidebar-nav .nav-link {
          position: relative;
          overflow: hidden;

          color: var(--darkColor);
          font-weight: 500;
          border-radius: 8px;
          margin: 0.2rem 0;
          padding: 0.6rem 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;

          background: #f8f7ff;
          // background: var(--lightColor);
          border: 1px solid rgba(0, 0, 0, 0.05);

          box-shadow: 
            0 1px 2px rgba(0, 0, 0, 0.06),
            0 4px 10px rgba(0, 0, 0, 0.08);

          transition: 
            background 0.25s ease,
            color 0.25s ease,
            transform 0.15s ease,
            box-shadow 0.2s ease;
        }
            
        .sidebar-nav .nav-link::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          width: 4px;
          height: 0;
          background: var(--darkColor);
          border-radius: 0 4px 4px 0;
          transform: translateY(-50%);
          transition: height 0.25s ease;
        }

        .sidebar-nav .nav-link::after {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 120%;
          height: 100%;
          pointer-events: none;

          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.35) 50%,
            transparent 100%
          );
        }

        .sidebar-nav .nav-link:hover {
          background: var(--darkColor);
          color: #fff;
          transform: translateX(4px);

          box-shadow: 
            0 4px 6px rgba(0, 0, 0, 0.1),
            0 10px 24px rgba(0, 0, 0, 0.16);
        }

        .sidebar-nav .nav-link:hover::before {
          height: 65%;
          background: #fff;
        }

        .sidebar-nav .nav-link:hover::after {
          animation: shimmer 0.9s ease-in-out;
        }

        .sidebar-nav .nav-link.active {
          background: var(--darkColor);
          color: #fff;
          font-weight: 600;

          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.12),
            0 12px 28px rgba(0, 0, 0, 0.18);
        }

        .sidebar-nav .nav-link.active::before {
          height: 75%;
          background: #fff;
        }

        .sidebar-nav .nav-link.active::after {
          animation: shimmer 0.9s ease-in-out;
        }

        .sidebar-nav .nav-link .nav-icon {
          color: inherit;
          transition: transform 0.2s ease;
        }

        .sidebar-nav .nav-link:hover .nav-icon {
          transform: scale(1.08);
        }

        .sidebar-nav .nav-link .nav-icon-bullet {
          background: currentColor;
        }

        @keyframes shimmer {
          0% {
            left: -120%;
          }
          100% {
            left: 120%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sidebar-nav .nav-link::after {
            animation: none !important;
          }

          .sidebar-nav .nav-link {
            transition: none;
          }
        }


    `}</style>
    </>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
