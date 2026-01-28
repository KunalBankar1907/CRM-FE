import React from 'react'
import { CButton, CCard } from '@coreui/react'

const ListHeader = ({
    title = '',
    layout = 'single-row', // 'single-row' | 'two-rows'
    onAddClick,
    addButtonLabel = 'Add',
    searchValue,
    onSearchChange,
    filterComponents = [],
    extraButton
}) => {
    return (
        <>
            <div className="px-2 mb-2" style={{ borderBottom: '1px solid #ddd' }}>

                {/* ROW 1 */}
                <div className="list-header-top">
                    {title && (
                        <div className="list-title">
                            <h5 className="mb-0">{title}</h5>
                        </div>
                    )}


                    <div className="action-buttons">
                        {onAddClick && (
                            <CButton size="sm" className="buttonLabel" onClick={onAddClick}>
                                {addButtonLabel}
                            </CButton>
                        )}
                        {extraButton}
                    </div>

                    <div className="search-box ms-auto mt-2">
                        <input
                            type="search"
                            className="form-control"
                            placeholder="Search..."
                            value={searchValue}
                            onChange={onSearchChange}
                        />
                    </div>
                </div>



                {/* ROW 2 */}
                {layout === 'two-rows' && (
                    <div className="row g-2 mb-2 align-items-end">
                        {filterComponents.map((filter, index) => (
                            <div key={index} className='col-12 col-sm-6 col-md-4 col-lg-auto' style={{ minWidth: '150px' }}>
                                {filter}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                .list-header-top {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

/* Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Search width on desktop */
.search-box {
  width: 220px;
}

/* MOBILE FIX */
@media (max-width: 576px) {
  .list-header-top {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }

  .action-buttons {
    justify-content: space-between;
  }

  .action-buttons button {
    flex: 1;
  }
}


            `}</style>
        </>

    );
}

export default ListHeader
