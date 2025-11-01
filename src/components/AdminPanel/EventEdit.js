import React from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    BooleanInput,
    DateInput,
    TimeInput,
    NumberInput,
    ArrayInput,
    SimpleFormIterator,
    TopToolbar,
    ListButton,
    ShowButton,
    DeleteButton
} from 'react-admin';
import { Card, CardContent, Typography } from '@mui/material';

const EditActions = () => (
    <TopToolbar>
        <ShowButton />
        <ListButton />
        <DeleteButton />
    </TopToolbar>
);

const EventEdit = () => (
    <Edit actions={<EditActions />}>
        <SimpleForm>
            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Event Details
                    </Typography>
                    <TextInput source="title" fullWidth required />
                    <TextInput source="slug" fullWidth required />
                    <TextInput source="description" fullWidth multiline rows={3} />
                    <SelectInput
                        source="category"
                        choices={[
                            { id: 'community', name: 'Community' },
                            { id: 'culture', name: 'Culture' },
                            { id: 'education', name: 'Education' },
                            { id: 'fundraising', name: 'Fundraising' },
                            { id: 'workshop', name: 'Workshop' },
                        ]}
                        required
                    />
                    <BooleanInput source="featured" />
                    <SelectInput
                        source="status"
                        choices={[
                            { id: 'upcoming', name: 'Upcoming' },
                            { id: 'ongoing', name: 'Ongoing' },
                            { id: 'completed', name: 'Completed' },
                            { id: 'cancelled', name: 'Cancelled' },
                        ]}
                        required
                    />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Date & Time
                    </Typography>
                    <DateInput source="startDate" required />
                    <DateInput source="endDate" required />
                    <TimeInput source="startTime" />
                    <TimeInput source="endTime" />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Location & Registration
                    </Typography>
                    <TextInput source="location" fullWidth required />
                    <TextInput source="address" fullWidth />
                    <NumberInput source="maxAttendees" />
                    <BooleanInput source="registrationRequired" />
                    <TextInput source="contactEmail" fullWidth type="email" />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Content & Media
                    </Typography>
                    <TextInput source="featuredImage" fullWidth label="Featured Image URL" />
                    <TextInput source="content" fullWidth multiline rows={6} required />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Tags
                    </Typography>
                    <ArrayInput source="tags">
                        <SimpleFormIterator inline>
                            <TextInput source="" label="Tag" />
                        </SimpleFormIterator>
                    </ArrayInput>
                </CardContent>
            </Card>
        </SimpleForm>
    </Edit>
);

export default EventEdit;