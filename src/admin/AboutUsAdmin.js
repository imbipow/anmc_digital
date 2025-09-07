import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    Edit,
    SimpleForm,
    TextInput,
    ArrayInput,
    SimpleFormIterator,
    required,
} from 'react-admin';

export const AboutUsList = (props) => (
    <List {...props} title="About Us Page Content" hasCreate={false}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="mission.title" label="Mission Title" />
            <TextField source="vision.title" label="Vision Title" />
            <TextField source="history.title" label="History Title" />
        </Datagrid>
    </List>
);

export const AboutUsEdit = (props) => (
    <Edit {...props} title="Edit About Us Page">
        <SimpleForm>
            {/* Mission Section */}
            <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#666' }}>Mission Section</h3>
            <TextInput source="mission.title" label="Mission Title" fullWidth defaultValue="Our Mission" />
            <TextInput source="mission.content" label="Mission Content" multiline rows={4} fullWidth validate={required()} />
            <TextInput source="mission.icon" label="Mission Icon Class" defaultValue="fa fa-bullseye" />

            {/* Vision Section */}
            <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#666' }}>Vision Section</h3>
            <TextInput source="vision.title" label="Vision Title" fullWidth defaultValue="Our Vision" />
            <TextInput source="vision.content" label="Vision Content" multiline rows={4} fullWidth validate={required()} />
            <TextInput source="vision.icon" label="Vision Icon Class" defaultValue="fa fa-eye" />

            {/* History Section */}
            <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#666' }}>History Section</h3>
            <TextInput source="history.title" label="History Title" fullWidth defaultValue="Our History" />
            <TextInput source="history.content" label="History Content" multiline rows={4} fullWidth validate={required()} />
            <TextInput source="history.icon" label="History Icon Class" defaultValue="fa fa-history" />

            {/* Executive Committee Section */}
            <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#666' }}>Executive Committee</h3>
            <TextInput source="executiveCommittee.title" label="Section Title" fullWidth defaultValue="Executive Committee" />
            <TextInput source="executiveCommittee.subtitle" label="Section Subtitle" fullWidth defaultValue="Meet our dedicated leadership team" />
            
            <ArrayInput source="executiveCommittee.members" label="Committee Members">
                <SimpleFormIterator>
                    <TextInput source="title" label="Position Title" validate={required()} />
                    <TextInput source="position" label="Position Description" />
                    <TextInput source="description" label="Role Description" multiline rows={3} />
                    <TextInput source="image" label="Member Photo URL" />
                </SimpleFormIterator>
            </ArrayInput>

            {/* Governance Structure Section */}
            <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#666' }}>Governance Structure</h3>
            <TextInput source="governance.title" label="Section Title" fullWidth defaultValue="Governance Structure" />
            <TextInput source="governance.subtitle" label="Section Subtitle" fullWidth defaultValue="Our organizational leadership framework" />
            
            <ArrayInput source="governance.structure" label="Governance Components">
                <SimpleFormIterator>
                    <TextInput source="title" label="Component Title" validate={required()} />
                    <TextInput source="description" label="Description" multiline rows={3} validate={required()} />
                    <TextInput source="icon" label="Icon Class" defaultValue="fa fa-gavel" />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Edit>
);