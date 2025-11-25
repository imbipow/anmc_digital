import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EditButton,
    DeleteButton,
    ShowButton,
    TopToolbar,
    CreateButton,
    ExportButton,
    FilterButton,
    SearchInput,
    SelectInput
} from 'react-admin';

const AchievementFilters = [
    <SearchInput source="q" alwaysOn />,
    <SelectInput
        source="category"
        choices={[
            { id: 'milestone', name: 'Milestone' },
            { id: 'funding', name: 'Funding' },
            { id: 'infrastructure', name: 'Infrastructure' },
            { id: 'community', name: 'Community' },
            { id: 'partnership', name: 'Partnership' },
        ]}
    />
];

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

const AchievementsList = () => (
    <List
        filters={AchievementFilters}
        actions={<ListActions />}
        sort={{ field: 'year', order: 'DESC' }}
        perPage={25}
    >
        <Datagrid rowClick="edit">
            <TextField source="year" label="Year" />
            <TextField source="title" label="Title" />
            <TextField source="category" label="Category" />
            <TextField source="description" label="Description" />
            <TextField source="icon" label="Icon Class" />
            <EditButton />
            <ShowButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export default AchievementsList;
