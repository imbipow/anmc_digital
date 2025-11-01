import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
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

const BlogFilters = [
    <SearchInput source="q" alwaysOn />,
    <SelectInput
        source="category"
        choices={[
            { id: 'Events', name: 'Events' },
            { id: 'Education', name: 'Education' },
            { id: 'Community', name: 'Community' },
            { id: 'Youth', name: 'Youth' },
            { id: 'Culture', name: 'Culture' },
            { id: 'Fundraising', name: 'Fundraising' },
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

const TagsField = ({ record }) => (
    <div>
        {record?.tags?.map((tag, index) => (
            <Chip
                key={index}
                label={tag}
                size="small"
                style={{ marginRight: 4, marginBottom: 4 }}
            />
        ))}
    </div>
);

const BlogList = () => (
    <List
        filters={BlogFilters}
        actions={<ListActions />}
        sort={{ field: 'date', order: 'DESC' }}
        perPage={25}
    >
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="author" />
            <TextField source="category" />
            <DateField source="date" />
            <BooleanField source="featured" />
            <TagsField source="tags" label="Tags" />
            <TextField source="readTime" />
            <EditButton />
            <ShowButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export default BlogList;