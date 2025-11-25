import React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    TopToolbar,
    ListButton
} from 'react-admin';
import { Card, CardContent, Typography } from '@mui/material';

const CreateActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

const AchievementsCreate = () => (
    <Create actions={<CreateActions />}>
        <SimpleForm>
            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Create New Achievement
                    </Typography>

                    <TextInput
                        source="year"
                        fullWidth
                        required
                        label="Year"
                        helperText="Enter the year as a unique identifier (e.g., 2024)"
                    />

                    <TextInput
                        source="title"
                        fullWidth
                        required
                        label="Achievement Title"
                    />

                    <SelectInput
                        source="category"
                        fullWidth
                        choices={[
                            { id: 'milestone', name: 'Milestone' },
                            { id: 'funding', name: 'Funding' },
                            { id: 'infrastructure', name: 'Infrastructure' },
                            { id: 'community', name: 'Community' },
                            { id: 'partnership', name: 'Partnership' },
                        ]}
                        label="Category"
                    />

                    <TextInput
                        source="description"
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        helperText="Provide a brief description of the achievement"
                    />

                    <TextInput
                        source="icon"
                        fullWidth
                        label="Icon Class (Font Awesome)"
                        helperText="e.g., fa fa-trophy, fa fa-calendar, fa fa-award"
                        defaultValue="fa fa-star"
                    />

                    <TextInput
                        source="number"
                        fullWidth
                        label="Display Number/Value (Optional)"
                        helperText="e.g., $4.3M, 52 Acres, 750+ - Will use year if not provided"
                    />
                </CardContent>
            </Card>
        </SimpleForm>
    </Create>
);

export default AchievementsCreate;
