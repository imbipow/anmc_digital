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
    SelectInput,
    NumberField,
    ChipField
} from 'react-admin';

const FaqFilters = [
    <SearchInput source="q" alwaysOn placeholder="Search FAQs..." />,
    <SelectInput
        source="category"
        choices={[
            { id: 'General', name: 'General' },
            { id: 'Membership', name: 'Membership' },
            { id: 'Facilities', name: 'Facilities' },
            { id: 'Services', name: 'Services' },
            { id: 'Events', name: 'Events' },
        ]}
    />,
    <SelectInput
        source="status"
        choices={[
            { id: 'published', name: 'Published' },
            { id: 'draft', name: 'Draft' },
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

const FaqList = () => (
    <List
        filters={FaqFilters}
        actions={<ListActions />}
        sort={{ field: 'order', order: 'ASC' }}
        perPage={25}
    >
        <Datagrid rowClick="edit">
            <NumberField source="order" label="Order" />
            <TextField source="question" label="Question" />
            <TextField source="answer" label="Answer" style={{ maxWidth: 300 }} />
            <ChipField source="category" label="Category" />
            <ChipField source="status" label="Status" />
            <EditButton />
            <ShowButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export default FaqList;
