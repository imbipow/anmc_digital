import React, { useState, useEffect } from 'react';
import { useRedirect } from 'react-admin';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Chip,
    Divider
} from '@mui/material';
import {
    Edit as EditIcon,
    Add as AddIcon,
    AccountTree as MasterPlanIcon,
    Work as ProjectIcon
} from '@mui/icons-material';
import API_CONFIG from '../../config/api';
import cognitoAuthService from '../../services/cognitoAuth';

const ProjectsWithMasterPlan = () => {
    const [masterPlan, setMasterPlan] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const redirect = useRedirect();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = await cognitoAuthService.getIdToken();
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch master plan
            const masterPlanRes = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.masterPlan), { headers });
            const masterPlanData = await masterPlanRes.json();
            setMasterPlan(masterPlanData);

            // Fetch projects
            const projectsRes = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.projects), { headers });
            const projectsData = await projectsRes.json();
            setProjects(Array.isArray(projectsData) ? projectsData : []);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Projects Management
            </Typography>

            {/* Master Plan Section */}
            <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MasterPlanIcon color="primary" />
                            <Typography variant="h6">
                                Master Plan - Development Phases
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => redirect('/master_plan/master-plan-2025-2030')}
                        >
                            Edit Master Plan
                        </Button>
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {masterPlan?.title} • {masterPlan?.period}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Key Areas / Phases:
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {masterPlan?.key_areas?.map((phase, index) => (
                            <Card key={index} variant="outlined" sx={{ backgroundColor: 'white' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {String(index + 1).padStart(2, '0')}. {phase.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {phase.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                {phase.status && (
                                                    <Chip
                                                        label={phase.status}
                                                        size="small"
                                                        color={phase.status.toLowerCase() === 'planned' ? 'default' : 'primary'}
                                                    />
                                                )}
                                                {phase.timeline && (
                                                    <Chip label={phase.timeline} size="small" variant="outlined" />
                                                )}
                                                {phase.budget && (
                                                    <Chip label={phase.budget} size="small" variant="outlined" />
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            {/* Individual Projects Section */}
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ProjectIcon color="primary" />
                            <Typography variant="h6">
                                Individual Projects
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => redirect('/projects/create')}
                        >
                            Create New Project
                        </Button>
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                        Manage specific project initiatives with progress tracking, budgets, and timelines.
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {projects.length > 0 ? (
                            projects.slice(0, 5).map((project) => (
                                <Card key={project.id} variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                    {project.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    {project.description}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                                    {project.status && (
                                                        <Chip
                                                            label={project.status}
                                                            size="small"
                                                            color={
                                                                project.status === 'active' ? 'success' :
                                                                project.status === 'completed' ? 'primary' :
                                                                'default'
                                                            }
                                                        />
                                                    )}
                                                    {project.progress !== undefined && (
                                                        <Chip label={`${project.progress}% Complete`} size="small" variant="outlined" />
                                                    )}
                                                    {project.budget && (
                                                        <Chip label={`$${Number(project.budget).toLocaleString()}`} size="small" variant="outlined" />
                                                    )}
                                                    {project.projectManager && (
                                                        <Chip label={project.projectManager} size="small" variant="outlined" />
                                                    )}
                                                </Box>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => redirect(`/projects/${project.id}`)}
                                                sx={{ ml: 2 }}
                                            >
                                                Edit
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No projects found. Create your first project!
                            </Typography>
                        )}

                        {projects.length > 5 && (
                            <Button
                                variant="text"
                                onClick={() => redirect('/projects')}
                            >
                                View All {projects.length} Projects
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ProjectsWithMasterPlan;
