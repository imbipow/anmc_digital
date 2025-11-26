import React from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    ArrayInput,
    SimpleFormIterator,
    TopToolbar,
    ListButton
} from 'react-admin';
import { Card, CardContent, Typography } from '@mui/material';

const EditActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

const MasterPlanEdit = () => (
    <Edit actions={<EditActions />}>
        <SimpleForm>
            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Master Plan Overview
                    </Typography>
                    <TextInput source="title" fullWidth required label="Master Plan Title" />
                    <TextInput source="description" fullWidth multiline rows={4} label="Description" />
                    <TextInput source="period" fullWidth label="Period" helperText="e.g., 2025-2030" />
                    <TextInput source="total_budget" fullWidth label="Total Budget" helperText="e.g., $2.5M" />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Key Areas / Phases
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        These are displayed on the Projects page with numbered phases
                    </Typography>

                    <ArrayInput source="key_areas" label="Development Phases">
                        <SimpleFormIterator>
                            <TextInput source="title" fullWidth required label="Phase Title" />
                            <TextInput source="description" fullWidth multiline rows={3} label="Description" />
                            <TextInput source="status" fullWidth label="Status" helperText="e.g., Planned, In Progress, Completed" />
                            <TextInput source="timeline" fullWidth label="Timeline" helperText="e.g., 2025-2027" />
                            <TextInput source="budget" fullWidth label="Budget" helperText="e.g., $600K" />
                        </SimpleFormIterator>
                    </ArrayInput>
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Funding Breakdown
                    </Typography>

                    <ArrayInput source="funding_breakdown" label="Funding Sources">
                        <SimpleFormIterator>
                            <TextInput source="source" fullWidth label="Funding Source" />
                            <TextInput source="amount" fullWidth label="Amount" helperText="e.g., $1.2M" />
                            <TextInput source="status" fullWidth label="Status" helperText="e.g., Secured, Pending, Applied" />
                        </SimpleFormIterator>
                    </ArrayInput>
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Milestones
                    </Typography>

                    <ArrayInput source="milestones" label="Major Milestones">
                        <SimpleFormIterator>
                            <TextInput source="title" fullWidth label="Milestone Title" />
                            <TextInput source="target_date" fullWidth label="Target Date" helperText="e.g., Q2 2025" />
                            <TextInput source="description" fullWidth multiline rows={2} label="Description" />
                        </SimpleFormIterator>
                    </ArrayInput>
                </CardContent>
            </Card>
        </SimpleForm>
    </Edit>
);

export default MasterPlanEdit;
