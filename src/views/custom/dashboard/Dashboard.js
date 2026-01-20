import { cilArrowBottom, cilArrowTop, cilCalendar, cilChartPie, cilMoney, cilOptions, cilPeople, cilUserFollow } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CListGroup, CListGroupItem, CProgress, CRow, CWidgetStatsA, CWidgetStatsB } from "@coreui/react"
import { CChartBar, CChartDoughnut, CChartLine, CChartPie } from "@coreui/react-chartjs"
import { getAdminDashboard } from "../../../utils/api"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import CustomSpinner from "../../../components/custom/CustomSpinner"
import { statusColorMap } from "../../../utils/helper"

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState([]);
    const [loading, setLoading] = useState(true)


    const fetchDashboardData = async () => {
        try {
            const response = await getAdminDashboard();
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
        total_leads = 0,
        leads_by_stage = [],
        stages = [],
        leads_this_week = 0,
        leads_this_month = 0,
        followups = { overdue: 0, today: 0, upcoming: 0 },
        closed = { won_count: 0, lost_count: 0, won_value: 0, lost_value: 0 },
        metrics = {},
    } = dashboardData;

    const sortedLeadsByStage = [...leads_by_stage].sort(
        (a, b) =>
            stages.indexOf(a.status) - stages.indexOf(b.status)
    );

    const hasClosedData = closed.won_count > 0 || closed.lost_count > 0;

    const normalizedLeadsByStage = stages.map((stage) => {
        const found = leads_by_stage.find((l) => l.status === stage.stage_name)
        return {
            status: stage.stage_name,
            total: found ? found.total : 0,
        }
    });

    return (
        <>
            {/* ROW */}
            <CRow className="mb-4" style={{ rowGap: '1rem' }}>

                <CCol xl={3} md={6}>
                    <CCard className="h-100 shadow-sm" style={{ borderRadius: "12px", backgroundColor: "#0d6efd" }}>
                        <CCardBody className="d-flex justify-content-between align-items-center text-white">
                            <div>
                                <div className="text-uppercase fw-semibold small">Total Leads</div>
                                <div className="fs-2 fw-bold">{total_leads}</div>
                            </div>
                            <CIcon icon={cilPeople} size="3xl" className="opacity-25" />
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol xl={3} md={6}>
                    <CCard className="h-100 shadow-sm" style={{ borderRadius: "12px", backgroundColor: "#198754" }}>
                        <CCardBody className="d-flex justify-content-between align-items-center text-white">
                            <div>
                                <div className="text-uppercase fw-semibold small">Leads This Week</div>
                                <div className="fs-2 fw-bold">{leads_this_week}</div>
                            </div>
                            <CIcon icon={cilCalendar} size="3xl" className="opacity-25" />
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol xl={3} md={6}>
                    <CCard className="h-100 shadow-sm" style={{ borderRadius: "12px", backgroundColor: "#0dcaf0" }}>
                        <CCardBody className="d-flex justify-content-between align-items-center text-white">
                            <div>
                                <div className="text-uppercase fw-semibold small">Leads This Month</div>
                                <div className="fs-2 fw-bold">{leads_this_month}</div>
                            </div>
                            <CIcon icon={cilUserFollow} size="3xl" className="opacity-25" />
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol xl={3} md={6}>
                    <CCard className="h-100 shadow-sm" style={{ borderRadius: "12px", backgroundColor: "#ffc107" }}>
                        <CCardBody className="d-flex justify-content-between align-items-center text-white">
                            <div>
                                <div className="text-uppercase fw-semibold small">Conversion Rate</div>
                                <div className="fs-2 fw-bold">{metrics.conversion_rate || 0}%</div>
                            </div>
                            <CIcon icon={cilChartPie} size="3xl" className="opacity-25" />
                        </CCardBody>
                    </CCard>
                </CCol>


                {/* <CCol xl={3} md={6}>
                    <CWidgetStatsA
                        style={{ paddingBottom: "1rem" }}
                        className="shadow-sm"
                        color="warning"
                        title="Conversion Rate"
                        value={`${metrics.conversion_rate || 0}%`}
                        icon={<CIcon icon={cilChartPie} />}
                    />
                </CCol> */}
            </CRow>

            {/* CHART ROW */}
            <CRow className="mb-4">
                {/* <CCol xl={6} className="mt-2">
                    <CCard className="shadow-sm">
                        <CCardHeader>Leads by Stage</CCardHeader>
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
                </CCol> */}
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
                        <CCardBody style={{ height: "15rem", padding: "1rem", }}>
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
                        {/* <CCardHeader>Closed Won vs Lost</CCardHeader> */}
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
                                Closed Won vs Lost
                            </span>
                        </div>
                        <CCardBody style={{ height: "15rem" }} className="text-center d-flex flex-column justify-content-center align-items-center">
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

                                    <div className="mt-3">
                                        <strong className="text-success fs-5">
                                            ₹{closed.won_value.toLocaleString()}
                                        </strong>
                                        <div className="text-muted">Revenue Won</div>
                                    </div>
                                </>
                            ) : (
                                <div
                                    className="d-flex flex-column justify-content-center align-items-center"
                                    style={{ height: "100%" }}
                                >
                                    <CIcon
                                        icon={cilChartPie}
                                        size="3xl"
                                        className="text-muted mb-2"
                                    />
                                    <div className="fw-semibold text-muted">
                                        No closed deals available
                                    </div>
                                </div>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* FOLLOW-UP & REVENUE */}
            <CRow className="mb-2">
                <CCol xl={6} className="mt-2">
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

                <CCol xl={6} className="mt-2">
                    <CCard className="shadow-sm border-1" style={{ borderRadius: "12px" }}>
                        {/* <CCardHeader>Monthly Revenue</CCardHeader> */}
                        <div
                            className="px-3 py-2 d-flex align-items-center"
                            style={{
                                background: "linear-gradient(90deg,#6f42c1,#a084f5)",
                                borderTopLeftRadius: "12px",
                                borderTopRightRadius: "12px",
                            }}
                        >
                            <CIcon icon={cilMoney} className="text-white me-2" />
                            <span className="text-white fw-semibold text-uppercase" style={{ fontSize: "0.85rem" }}>
                                Monthly Revenue
                            </span>
                        </div>
                        <CCardBody style={{ height: "9rem" }} className="text-center d-flex flex-column justify-content-center align-items-center">
                            <CIcon
                                icon={cilMoney}
                                size="3xl"
                                className="text-success mb-2"
                            />
                            <h3>
                                ₹{(metrics.monthly_revenue || 0).toLocaleString()}
                            </h3>
                            <div className="text-muted">Closed Won This Month</div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default Dashboard;