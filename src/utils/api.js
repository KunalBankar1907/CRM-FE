import axios from 'axios'

// const API_BASE_URL = 'http://localhost:8000/api';
const API_BASE_URL = 'https://campuskul.org/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    validateStatus: (status) => true,
})

// Add Authorization header if token exists
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const loginUser = (payload) => {
    return api.post('/auth/login', payload)
}

export const register = (payload) => {
    return api.post('/auth/register', payload)
}

export const logoutUser = () => {
    return api.post('/auth/logout')
}

export const getAllEmployees = ({ search = '', status = '', page = 1, perPage = 10 } = {}) => {
    return api.get('/admin/employee/get-all', {
        params: {
            search,
            page,
            status,
            per_page: perPage,
        },
    })
}
export const getActiveEmployees = () => {
    // return api.get('/admin/employee/get-active-employees');
    return api.get('/get-active-employees');
}

export const getOrganizationById = (id) => {
    return api.get(`/admin/organization/get-organization/${id}`);
}

export const updateOrganization = (id, formData) => {
    return api.post(`/admin/organization/update/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}

export const addEmployee = (payload) => {
    return api.post('/admin/employee/add', payload)
}

export const changeEmployeeStatus = (id) => {
    return api.post(`/admin/employee/change-status/${id}`);
}

export const getEmployeeById = (id) => {
    return api.get(`/admin/employee/${id}`);
}

export const updateEmployee = (id, payload) => {
    return api.post(`/admin/employee/update/${id}`, payload);
}

export const deleteEmployee = (id) => {
    return api.post(`/admin/employee/delete/${id}`);
}

export const getAllLeads = ({
    search = '',
    status = '',
    assigned_owner = '',
    lead_source = '',
    priority = '',
    follow_up_status = '',
    from_date = '',
    to_date = '',
    page = 1,
    perPage = 10,
} = {}) => {
    return api.get('/admin/lead/get-all-leads', {
        params: {
            search,
            status,
            assigned_owner,
            lead_source,
            priority,
            follow_up_status,
            page,
            per_page: perPage,
            from_date,
            to_date,
        },
    });
};

export const getAllAssignedLeads = ({
    search = '',
    status = '',
    lead_source = '',
    priority = '',
    follow_up_status = '',
    page = 1,
    perPage = 10,
} = {}) => {
    return api.get('/lead/employee/get-assigned-leads', {
        params: {
            search,
            status,
            lead_source,
            priority,
            follow_up_status,
            page,
            per_page: perPage,
        },
    });
};

export const getLeadById = (id) => {
    return api.get(`/lead/${id}`);
}

export const updateLead = (id, payload) => {
    return api.post(`/lead/update/${id}`, payload);
}

export const addLead = (payload) => {
    return api.post('/lead/add', payload)
}

export const getLeadActivities = (id) => {
    return api.get(`/lead/${id}/activities`);
}

export const deleteLead = (id) => {
    return api.post(`/admin/lead/delete/${id}`);
}

export const getMyProfile = () => {
    return api.get('/auth/my-profile')
}

export const updateMyProfile = (payload) => {
    return api.post('/auth/my-profile/update', payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
}

export const getAllStages = ({ search = '', status = '', page = 1, perPage = 10 } = {}) => {
    return api.get('/admin/stage/get-all', {
        params: {
            search,
            page,
            status,
            per_page: perPage,
        },
    })
}

export const addStage = (payload) => {
    return api.post('/admin/stage/add', payload)
}

export const updateStage = (id, payload) => {
    return api.post(`/admin/stage/update/${id}`, payload);
}

export const getStageById = (id) => {
    return api.get(`/admin/stage/${id}`);
}

export const deleteStage = (id) => {
    return api.post(`/admin/stage/delete/${id}`);
}

export const changeStageStatus = (id) => {
    return api.post(`/admin/stage/change-status/${id}`);
};

export const reorderStage = (payload) => {
    return api.post(`/admin/stage/reorder`, payload);
};

export const getAllActiveStages = () => {
    return api.get(`/get-active-stages`);
}

export const changeLeadStage = (id, payload) => {
    return api.post(`/lead/change-stage/${id}`, payload);
}

export const getAllFollowups = ({ search = '', status = '', page = 1, perPage = 10, followUpFilter = '' } = {}) => {
    return api.get('/follow-up/get-all', {
        params: {
            search,
            page,
            status,
            per_page: perPage,
            follow_up_status: followUpFilter
        },
    })
}

export const getAllLeadsForFollowup = () => {
    return api.get(`/follow-up/get-all-leads`);
}

export const addFollowUp = (payload) => {
    return api.post('/follow-up/add', payload)
}

export const addFollowUpAsMarkDone = (payload) => {
    return api.post('/follow-up/mark-as-done', payload)
}

export const getFollowupCounts = () => {
    return api.get(`/dashboard/followup-counts`);
}

export const getAdminDashboard = () => {
    return api.get(`/dashboard/admin`);
}

export const getEmployeeDashboard = () => {
    return api.get(`/dashboard/employee`);
}

export const getFollowupById = (id) => {
    return api.get(`/follow-up/${id}`);
}

export const exportLeads = (params) => {
    return api.get('/admin/lead/export', {
        params,
        responseType: 'blob',
    });
};

export const importLeads = (data) => {
    return api.post('/admin/lead/import', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};


// You can add more API calls here...

