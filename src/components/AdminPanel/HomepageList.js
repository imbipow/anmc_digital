import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EditButton,
    TopToolbar,
    ExportButton,
    FunctionField
} from 'react-admin';

const ListActions = () => (
    <TopToolbar>
        <ExportButton />
    </TopToolbar>
);

const HomepageList = () => (
    <List actions={<ListActions />} pagination={false}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="component" />
            <FunctionField
                source="data.title"
                render={record => record.data?.title || '-'}
                label="Title"
            />
            <FunctionField
                source="data.welcomeText"
                render={record => record.data?.welcomeText || '-'}
                label="Welcome Text"
            />
            <EditButton />
        </Datagrid>
    </List>
);

export default HomepageList;