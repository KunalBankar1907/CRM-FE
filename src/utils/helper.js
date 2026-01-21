import { cilArrowThickFromRight, cilArrowThickRight } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export const ROLE = "";
// export const BASE_URL = 'http://localhost:8000/api'
// export const IMAGE_BASE_URL = 'http://localhost:8000'
export const BASE_URL = 'https://campuskul.org/api'
export const IMAGE_BASE_URL = 'https://campuskul.org'

export const statusValues = [
  //   { value: '', label: 'Select Status' },
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Lost', label: 'Lost' },
  { value: 'Won', label: 'Won' }
];

export const statusColorMap = {
  New: '#0d6efd',
  Contacted: '#0dcaf0',
  Qualified: '#ffc107',
  'Proposal Sent': '#6c757d',
  Negotiation: '#343a40',
  'Closed Won': '#198754',
  'Closed Lost': '#dc3545',
};

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
  phone_number: 'Phone Number',
  email: 'Email',
  company_name: 'Company Name',
  lead_source: 'Lead Source',
  status: 'Status',
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
          <span className="text-success">{value.old}</span> <CIcon icon={cilArrowThickRight} />{' '}
          <span className="text-danger">{value.new}</span>
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