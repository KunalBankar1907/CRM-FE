import {
    CDropdownMenu,
    CDropdownItem,
    CBadge,
    CDropdownHeader,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom';

const AppHeaderFollowupDropdown = ({ counts = {} }) => {
    const {
        overdue = 0,
        today = 0,
        upcoming = 0,
    } = counts

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.role || 'employee';

    const handleFollowupClick = () => {
        const navRoute = role === 'owner' ? '/owner/follow-up/list' : '/employee/follow-up/list'
        navigate(navRoute);
    }
    return (
        <CDropdownMenu className="pt-0">
            <CDropdownHeader className="bg-body-secondary fw-semibold">Follow-ups</CDropdownHeader>

            <CDropdownItem className="d-flex justify-content-between" style={{ cursor: "pointer" }} onClick={handleFollowupClick}>
                Overdue
                <CBadge color="danger">{counts.overdue}</CBadge>
            </CDropdownItem>

            <CDropdownItem className="d-flex justify-content-between" style={{ cursor: "pointer" }} onClick={handleFollowupClick}>
                Today
                <CBadge color="warning">{counts.today}</CBadge>
            </CDropdownItem>

            <CDropdownItem className="d-flex justify-content-between" style={{ cursor: "pointer" }} onClick={handleFollowupClick}>
                Upcoming
                <CBadge color="info">{counts.upcoming}</CBadge>
            </CDropdownItem>

            {/* <CDropdownItem href="/followups" className="text-center text-primary">
                View All Follow-ups
            </CDropdownItem> */}
        </CDropdownMenu>
    )
}

export default AppHeaderFollowupDropdown
