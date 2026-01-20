import { cilArrowBottom, cilArrowTop, cilCalendar, cilChartPie, cilOptions, cilPeople, cilWarning } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CListGroup, CListGroupItem, CProgress, CRow, CWidgetStatsA, CWidgetStatsB } from "@coreui/react"
import { CChartBar, CChartDoughnut, CChartLine, CChartPie } from "@coreui/react-chartjs"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { getEmployeeDashboard } from "../../utils/api"
import CustomSpinner from "../../components/custom/CustomSpinner"
import { statusColorMap } from "../../utils/helper"

const EmployeeDashboard = () => {
    const [dashboardData, setDashboardData] = useState([]);
    const [loading, setLoading] = useState(true)


    const fetchDashboardData = async () => {
        try {
            const response = await getEmployeeDashboard();
            if (response.data.success) {
                setDashboardData(response.data.data)
            } else {
                toast.error(response.data.message || 'Failed to fetch admin dashboard data')
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) return <CustomSpinner />

    if (!dashboardData) return null

    const {
        my_total_leads = 0,
        followups = { overdue: 0, today: 0, upcoming: 0 },
        closed = { won: 0, lost: 0 },
        stages = [],
        leads_by_stage = [],
    } = dashboardData;

    const hasClosedData = closed.won_count > 0 || closed.lost_count > 0;
    const normalizedLeadsByStage = stages.map((stage) => {
        const found = leads_by_stage.find((l) => l.status === stage.stage_name)
        return {
            status: stage.stage_name,
            total: found ? found.total : 0,
        }
    });

    const closedWonCount = closed.won_count || 0;
    const conversionRate = my_total_leads > 0
        ? Math.round((closedWonCount / my_total_leads) * 100)
        : 0;

    return (
        <>
            {/* CARDS */}
            <CRow className="mb-4" style={{ rowGap: '1rem' }}>
                <CCol sm={6} xl={4}>
                    <CCard className="h-100 shadow-sm" style={{ borderRadius: "12px", backgroundColor: "#0d6efd" }}>
                        <CCardBody className="d-flex justify-content-between align-items-center text-white">
                            <div>
                                <div className="text-uppercase fw-semibold small">My Total Leads</div>
                                <div className="fs-2 fw-bold">{my_total_leads}</div>
                            </div>
                            <CIcon icon={cilPeople} size="3xl" className="opacity-25" />
                        </CCardBody>
                    </CCard>
                </CCol>


                <CCol sm={6} xl={4}>
                    <CCard className="h-100 shadow-sm" style={{ borderRadius: "12px", backgroundColor: "#ffc107" }}>
                        <CCardBody className="d-flex justify-content-between align-items-center text-white">
                            <div>
                                <div className="text-uppercase fw-semibold small">Overdue Follow-ups</div>
                                <div className="fs-2 fw-bold">{followups.overdue}</div>
                            </div>
                            <CIcon icon={cilWarning} size="3xl" className="opacity-25" />
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol sm={6} xl={4}>
                    <CCard className="h-100 shadow-sm" style={{ borderRadius: "12px", backgroundColor: "#0dcaf0" }}>
                        <CCardBody className="d-flex justify-content-between align-items-center text-white">
                            <div>
                                <div className="text-uppercase fw-semibold small">Today's Follow-ups</div>
                                <div className="fs-2 fw-bold">{followups.today}</div>
                            </div>
                            <CIcon icon={cilCalendar} size="3xl" className="opacity-25" />
                        </CCardBody>
                    </CCard>
                </CCol>

            </CRow>

            {/* CLOSED LEADS */}
            <CRow className="mb-4">
                <CCol xl={6} className="mt-2">
                    <CCard className="shadow-sm border-1" style={{ borderRadius: "12px" }}>
                        {/* <CCardHeader>Leads by Stage</CCardHeader> */}
                        <div
                            className="px-3 py-2 d-flex align-items-center"
                            style={{
                                background: "linear-gradient(90deg,#0d6efd,#6f42c1)",
                                borderTopLeftRadius: "12px",
                                borderTopRightRadius: "12px",
                            }}
                        >
                            <CIcon icon={cilOptions} className="text-white me-2" />
                            <span className="text-white fw-semibold text-uppercase" style={{ fontSize: "0.85rem" }}>
                                Leads by Stage
                            </span>
                        </div>
                        <CCardBody style={{ height: "15rem" }}>
                            <CChartBar
                                data={{
                                    labels: normalizedLeadsByStage.map((i) => i.status),
                                    datasets: [
                                        {
                                            data: normalizedLeadsByStage.map((i) => i.total),
                                            backgroundColor: normalizedLeadsByStage.map(
                                                (i) => statusColorMap[i.status] || "#6c757d"
                                            ),
                                        },
                                    ],
                                }}
                                options={{
                                    plugins: { legend: { display: false } },
                                    responsive: true,
                                    maintainAspectRatio: false,
                                }}
                                style={{ height: "100%" }}
                            />
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol xl={6} className="mt-2">
                    <CCard className="shadow-sm border-1" style={{ borderRadius: "12px" }}>
                        {/* <CCardHeader>Closed Leads</CCardHeader> */}
                        <div
                            className="px-3 py-2 d-flex align-items-center"
                            style={{
                                background: "linear-gradient(90deg,#198754,#20c997)",
                                borderTopLeftRadius: "12px",
                                borderTopRightRadius: "12px",
                            }}
                        >
                            <CIcon icon={cilChartPie} className="text-white me-2" />
                            <span className="text-white fw-semibold text-uppercase" style={{ fontSize: "0.85rem" }}>
                                Closed Leads
                            </span>
                        </div>
                        <CCardBody
                            className="text-center d-flex flex-column justify-content-center align-items-center"
                            style={{ height: "15rem" }}
                        >
                            {hasClosedData ? (
                                <>
                                    <CChartDoughnut
                                        style={{ height: "70%" }}
                                        data={{
                                            labels: ["Won", "Lost"],
                                            datasets: [
                                                {
                                                    data: [closed.won_count, closed.lost_count],
                                                    backgroundColor: ["#198754", "#dc3545"],
                                                },
                                            ],
                                        }}
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: "bottom" } },
                                        }}
                                    />
                                    <div className="mt-2">
                                        <div className="d-flex justify-content-between px-5">
                                            <span className="text-success fw-semibold">Won:</span>
                                            <span>
                                                {closed.won_count} (₹
                                                {closed.won_value.toLocaleString()})
                                            </span>
                                        </div>
                                        {/* <div className="d-flex justify-content-between px-5 mt-2">
                                            <span className="text-danger fw-semibold">Lost:</span>
                                            <span>
                                                {closed.lost_count} (₹
                                                {closed.lost_value.toLocaleString()})
                                            </span>
                                        </div> */}
                                    </div>
                                </>
                            ) : (
                                <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "100%" }}>
                                    <CIcon
                                        icon={cilChartPie}
                                        size="3xl"
                                        className="text-muted mb-2"
                                    />
                                    <div className="fw-semibold text-muted text-center">
                                        No closed deals yet
                                    </div>
                                </div>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <CRow className="mb-4">
                <CCol xl={6}>
                    <CCard className="shadow-sm border-1" style={{ borderRadius: "12px" }}>
                        {/* <CCardHeader>Follow-ups Overview</CCardHeader> */}
                        <div
                            className="px-3 py-2 d-flex align-items-center"
                            style={{
                                background: "linear-gradient(90deg,#dc3545,#f03e3e)",
                                borderTopLeftRadius: "12px",
                                borderTopRightRadius: "12px",
                            }}
                        >
                            <CIcon icon={cilOptions} className="text-white me-2" />
                            <span className="text-white fw-semibold text-uppercase" style={{ fontSize: "0.85rem" }}>
                                Follow-ups Overview
                            </span>
                        </div>
                        <CCardBody style={{ height: "9rem", padding: "1rem" }}>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-danger">Overdue</span>
                                {/* <strong>{followups.overdue}</strong> */}
                                <CBadge className="badge bg-danger"><strong>{followups.overdue}</strong></CBadge>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-warning">Today</span>
                                {/* <strong>{followups.today}</strong> */}
                                <CBadge className="badge bg-warning"><strong>{followups.today}</strong></CBadge>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-success">Upcoming</span>
                                {/* <strong>{followups.upcoming}</strong> */}
                                <CBadge className="badge bg-success"><strong>{followups.upcoming}</strong></CBadge>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>

    )
}

export default EmployeeDashboard