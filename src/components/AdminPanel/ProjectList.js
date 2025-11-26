import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    BooleanField,
    EditButton,
    DeleteButton,
    ShowButton,
    TopToolbar,
    CreateButton,
    ExportButton,
    FilterButton,
    SearchInput,
    SelectInput,
    BooleanInput
} from 'react-admin';
import { Chip } from '@mui/material';

const ProjectFilters = [
    <SearchInput source="q" alwaysOn />,
    <SelectInput
        source="category"
        choices={[
            { id: 'infrastructure', name: 'Infrastructure' },
            { id: 'community', name: 'Community' },
            { id: 'education', name: 'Education' },
            { id: 'culture', name: 'Culture' },
            { id: 'sustainability', name: 'Sustainability' },
            { id: 'youth', name: 'Youth' },
            { id: 'fundraising', name: 'Fundraising' },
        ]}
    />,
    <SelectInput
        source="status"
        choices={[
            { id: 'planning', name: 'Planning' },
            { id: 'active', name: 'Active' },
            { id: 'completed', name: 'Completed' },
            { id: 'on-hold', name: 'On Hold' },
            { id: 'cancelled', name: 'Cancelled' },
        ]}
    />,
    <BooleanInput source="featured" />
];

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

const StatusField = ({ record }) => {
    const statusColors = {
        'planning': '#9e9e9e',
        'active': '#4caf50',
        'completed': '#2196f3',
        'on-hold': '#ff9800',
        'cancelled': '#f44336'
    };

    return (
        <Chip
            label={record?.status || 'N/A'}
            style={{
                backgroundColor: statusColors[record?.status] || '#9e9e9e',
                color: 'white',
                textTransform: 'capitalize'
            }}
            size="small"
        />
    );
};

const ProgressField = ({ record }) => {
    const progress = record?.progress || 0;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
                width: '100px',
                height: '8px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: progress === 100 ? '#4caf50' : '#2196f3',
                    transition: 'width 0.3s ease'
                }} />
            </div>
            <span style={{ fontSize: '12px', color: '#666' }}>{progress}%</span>
        </div>
    );
};

const BudgetField = ({ record }) => {
    if (!record?.budget) return '-';
    return `$${Number(record.budget).toLocaleString()}`;
};

const ProjectList = () => (
    <List
        filters={ProjectFilters}
        actions={<ListActions />}
        sort={{ field: 'startDate', order: 'DESC' }}
        perPage={25}
    >
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="category" />
            <StatusField source="status" label="Status" />
            <ProgressField source="progress" label="Progress" />
            <BudgetField source="budget" label="Budget" />
            <TextField source="projectManager" label="Manager" />
            <DateField source="startDate" />
            <DateField source="endDate" />
            <BooleanField source="featured" />
            <EditButton />
            <ShowButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export default ProjectList;
