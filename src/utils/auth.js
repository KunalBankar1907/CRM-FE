// import { ROLE } from './helper'

// export const isAuthenticated = Boolean(ROLE)
// export const getRole = () => ROLE

export const isAuthenticated = () => {
    return Boolean(sessionStorage.getItem('token'))
}

export const getRole = () => {
    const user = localStorage.getItem('user')
    if (!user) return null
    return JSON.parse(user).role
}

