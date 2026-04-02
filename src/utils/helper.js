import { cilArrowThickFromRight, cilArrowThickRight } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export const ROLE = "";
export const BASE_URL = 'http://localhost:8000/api'
export const IMAGE_BASE_URL = 'http://localhost:8000'
// export const BASE_URL = 'https://backend.onego.in/api'
// export const IMAGE_BASE_URL = 'https://backend.onego.in'

export const stagesValues = [
  //   { value: '', label: 'Select Stage' },
  { value: 'Lead Identified', label: 'Lead Identified' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Meeting Scheduled', label: 'Meeting Scheduled' },
  { value: 'Discussion Done', label: 'Discussion Done' },
  { value: 'Proposal Planned', label: 'Proposal Planned' },
  { value: 'Proposal Shared', label: 'Proposal Shared' },
  { value: 'Engagement Started', label: 'Engagement Started' },
  { value: 'Converted', label: 'Converted' },
];

export const stagesColorMap = {
  'Lead Identified': '#0b5ed7',
  Contacted: '#3dd5f3',
  'Meeting Scheduled': '#ffca2c',
  'Discussion Done': '#495057',
  'Proposal Planned': '#ff8c00',
  'Proposal Shared': '#ff6f61',
  'Engagement Started': '#212529',
  'Converted': '#157347',
};

export const statusValues = [
  { value: 'Cold', label: 'Cold' },
  { value: 'Warm', label: 'Warm' },
  { value: 'Active', label: 'Active' },
  { value: 'Converted', label: 'Converted' },
];
export const statusColorMap = {
  Cold: '#6c757d',
  Warm: '#e83e8c',
  Active: '#20c997',
  Converted: '#fd7e14',
};

export const feedbackValues = [
  { value: 'Positive', label: 'Positive' },
  { value: 'Neutral', label: 'Neutral' },
  { value: 'Negative', label: 'Negative' },
];
export const activityTypeValues = [
  { value: 'Call', label: 'Call' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Demo', label: 'Demo' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Follow-up', label: 'Follow-up' },
  { value: 'Presentation', label: 'Presentation' },
  { value: 'Other', label: 'Other' },
];

export const followupStatusColorMap = {
  Upcoming: '#0d6efd',
  Today: '#ffc107',
  Overdue: '#dc3545',
  Done: '#198754',
};

export const FOLLOW_UP_OUTCOMES = [
  'Connected',
  'Not reachable',
  'Meeting scheduled',
  'Closed won',
  'Closed lost',
  'Other',
]


export const fieldLabelMap = {
  priority: 'Priority',
  expected_deal_value: 'Expected Deal Value',
  next_follow_up: 'Next Follow-up',
  note: 'Note',
  assigned_owner_id: 'Assigned Owner',
  lead_name: 'Lead Name',
  account_name: 'Account Name',
  contact_name: 'Contact Name',
  phone_number: 'Phone Number',
  email: 'Email',
  company_name: 'Company Name',
  lead_source: 'Lead Source',
  status: 'Status',
  stage: 'Stage',
  organization_id: 'Organization',
};

export const renderChangedFields = (meta) => {
  if (!meta) return null;

  // Check if this meta looks like a follow-up object
  const isFollowUpMeta =
    'follow_up_at' in meta || 'note' in meta || 'outcome' in meta;

  if (isFollowUpMeta) {
    return (
      <div >
        {meta.follow_up_at && (
          <p className="mb-1">
            <strong>Follow-up At:</strong> {formatDateDDMMYYYY(meta.follow_up_at)}
          </p>
        )}
        {meta.note && (
          <p className="mb-1">
            {/* <strong>Note:</strong> {meta.note} */}
            <strong>Note:</strong> {typeof meta.note === 'object' ? meta.note.new || '' : meta.note}
          </p>
        )}
        {meta.outcome && (
          <p className="mb-1">
            <strong>Outcome:</strong> {meta.outcome}
          </p>
        )}
      </div>
    );
  }

  // Otherwise, assume old/new update log
  return Object.keys(meta).map((key) => {
    const label = fieldLabelMap[key] || key;
    const value = meta[key];

    if (value && typeof value === 'object' && value.old !== undefined && value.new !== undefined) {
      return (
        <p key={key} className="mb-1">
          <strong>{label}:</strong>{' '}

          <span className="text-success">
            {value.old
              ? key === 'next_follow_up'
                ? formatDateDDMMYYYY(value.old)
                : value.old
              : ''}
          </span>

          {value.old && <CIcon icon={cilArrowThickRight} />}{' '}

          <span className="text-danger">
            {value.new
              ? key === 'next_follow_up'
                ? formatDateDDMMYYYY(value.new)
                : value.new
              : ''}
          </span>
        </p>

      );
    }

    if (value && typeof value === 'object') {
      return (
        <p key={key} className="mb-1">
          <strong>{label}:</strong> {JSON.stringify(value)}
        </p>
      );
    }

    return (
      <p key={key} className="mb-1">
        <strong>{label}:</strong> {value}
      </p>
    );
  });
};

export const capitalizeWord = (word) => {
  if (!word) return '';

  return word
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export const formatDateDDMMYYYY_Old = (dateString) => {
  if (!dateString) return '-';
  // const [year, month, day] = dateString.split('T')[0].split('-');

  const datePart = dateString.includes('T')
    ? dateString.split('T')[0]
    : dateString.split(' ')[0];

  const [year, month, day] = datePart.split('-');

  return `${day}-${month}-${year}`;
};

// Updated With handle Time
export const formatDateDDMMYYYY = (dateString) => {
  if (!dateString) return '-';

  // Remove timezone part (Z or milliseconds)
  const cleaned = dateString
    .replace('Z', '')
    .split('.')[0];

  // Split date & time
  const [datePart, timePart] = cleaned.includes('T')
    ? cleaned.split('T')
    : cleaned.split(' ');

  const [year, month, day] = datePart.split('-');

  // If time exists and is not 00:00
  if (timePart && timePart !== '00:00:00') {
    const [hh, mm] = timePart.split(':');
    return `${day}-${month}-${year} ${hh}:${mm}`;
  }

  // Only date
  return `${day}-${month}-${year}`;
};

export const formattedDate = (dateString) => {
  return new Date(dateString)
    .toLocaleDateString('en-GB')
    .replace(/\//g, '-');
};

/**
 * Initialize a table as a DataTable.
 * @param {React.RefObject} tableRef - React ref pointing to the table
 * @param {object} options - DataTables options (optional)
 */
export const initDataTable = (tableRef, options = {}, filters = []) => {
  if (!tableRef || !tableRef.current) return;

  const {
    onRowReorder,
    ...datatableOptions
  } = options

  const defaultOptions = {
    destroy: true,
    paging: false,
    searching: false,
    // ordering: true,
    ordering: false,
    info: true,
    autoWidth: false,
    rowReorder: {
      selector: '.reorder-handle',
    }
  };

  const finalOptions = { ...defaultOptions, ...options };
  const table = $(tableRef.current).DataTable(finalOptions);

  if (onRowReorder) {
    table.on('row-reorder', function (e, diff, edit) {
      if (!diff.length) return;

      const reorderedStages = diff.map(item => {
        const rowData = table.row(item.node).data();
        return {
          id: parseInt(rowData[1], 10),
          order: item.newPosition + 1
        };
      });

      onRowReorder(reorderedStages);
    });
  }

  // Add custom filters
  if (filters.length > 0) {
    $.fn.dataTable.ext.search.push((settings, data, dataIndex) => {
      return filters.every((filter) => {
        const el = $(filter.selector);
        if (!el.length) return true; // ignore if filter not found

        const value = el.val().toLowerCase();
        const cellData = (data[filter.columnIndex] || '').toString().toLowerCase();

        if (filter.type === 'text') {
          return value === '' || cellData.includes(value);
        } else if (filter.type === 'select') {
          return value === '' || cellData === value;
        }
        return true;
      });
    });

    // Redraw table on filter change
    filters.forEach((filter) => {
      $(filter.selector).on('change keyup', () => table.draw());
    });
  }

  // Return destroy function for cleanup
  // return () => {
  //   if ($.fn.DataTable.isDataTable(tableRef.current)) {
  //     $(tableRef.current).DataTable().destroy(true);
  //   }
  // };

  return () => {
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      table.off('row-reorder')
      table.destroy(true)
    }
  };
};