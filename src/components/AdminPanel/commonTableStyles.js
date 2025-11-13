// Common styles for admin panel tables with blue headers
export const tableHeaderStyles = {
    '& .RaDatagrid-tableWrapper': {
        overflowX: 'auto',
    },
    '& .RaDatagrid-table': {
        '& thead': {
            '& th': {
                backgroundColor: '#1976d2',
                color: '#ffffff',
                fontWeight: 'bold',
                borderBottom: '2px solid #1565c0',
                padding: '12px 8px',
                whiteSpace: 'nowrap'
            }
        },
        '& tbody': {
            '& tr': {
                '&:hover': {
                    backgroundColor: '#f5f9ff'
                }
            }
        }
    }
};
