import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import contentService from '../../services/contentService'
import API_CONFIG from '../../config/api'
import './style.css'

const Service2 = (props) => {
    const [masterPlan, setMasterPlan] = useState({});
    const [projects, setProjects] = useState([]);

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load master plan data
                const masterPlanResponse = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.masterPlan));
                const masterPlanData = await masterPlanResponse.json();
                setMasterPlan(masterPlanData);

                // Load projects data
                const projectsData = await contentService.getProjects();
                setProjects(projectsData);
            } catch (error) {
                console.error('Error loading project data:', error);
            }
        };
        loadData();
    }, []);

    // Default fallback data
    const masterPlanPhases = [
        {
            phase: "Phase 1",
            title: "Land Acquisition & Planning",
            description: "Secure 50+ acres of land and complete architectural planning for the multicultural centre complex",
            status: "In Progress",
            timeline: "2024-2025"
        },
        {
            phase: "Phase 2",
            title: "Infrastructure Development",
            description: "Begin construction of main community hall, cultural centre, and essential infrastructure",
            status: "Planned",
            timeline: "2025-2026"
        },
        {
            phase: "Phase 3",
            title: "Facility Expansion",
            description: "Add residential facilities, educational buildings, and recreational amenities",
            status: "Future",
            timeline: "2026-2027"
        },
        {
            phase: "Phase 4",
            title: "Community Programs Launch",
            description: "Launch full range of cultural, educational, and community support programs",
            status: "Future",
            timeline: "2027-2028"
        }
    ];

    const currentProjects = projects.length > 0 ? projects.filter(p => p.status === 'active').map(project => ({
        icon: project.category === 'sustainability' ? 'fa fa-leaf' :
              project.category === 'youth' ? 'fa fa-users' :
              project.category === 'culture' ? 'fa fa-building' :
              project.category === 'health' ? 'fa fa-heart' : 'fa fa-star',
        title: project.title,
        description: project.description,
        progress: project.progress || 0,
        details: [`Budget: $${project.budget?.toLocaleString()}`, `Manager: ${project.projectManager}`, `Status: ${project.status}`]
    })) : [
        {
            icon: "fa fa-building",
            title: "Site Development",
            description: "Strategic development of our 50+ acre site to create Australia's premier multicultural community centre with state-of-the-art facilities.",
            progress: 45,
            details: ["Architectural planning complete", "Environmental assessments ongoing", "Council approvals in progress"]
        },
        {
            icon: "fa fa-dollar-sign",
            title: "Funding Initiatives",
            description: "Comprehensive fundraising campaign combining community donations, government grants, and strategic partnerships to secure project funding.",
            progress: 62,
            details: ["$2.5M raised from community", "$1.8M government funding secured", "Corporate partnerships active"]
        },
        {
            icon: "fa fa-users",
            title: "Community Engagement",
            description: "Building strong community support through events, workshops, and volunteer programs while preserving cultural heritage and promoting integration.",
            progress: 78,
            details: ["500+ active members", "Monthly cultural events", "Educational program partnerships"]
        }
    ];

   const [projectMetrics, setProjectMetrics] = useState([]);
   
       useEffect(() => {
           const loadAchievements = async () => {
               try {
                   const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.achievements));
                   const achievements = await response.json();
   
                   if (achievements && achievements.length > 0) {
                       // Take the latest 4 achievements and format them as metrics
                       const formattedMetrics = achievements.slice(-4).map((achievement, index) => {
                           const icons = ["fa fa-calendar", "fa fa-building", "fa fa-trophy", "fa fa-award"];
                           return {
                               icon: icons[index] || "fa fa-star",
                               number: achievement.year,
                               label: achievement.title,
                               description: achievement.description
                           };
                       });
                       setProjectMetrics(formattedMetrics);
                   }
               } catch (error) {
                   console.error('Error loading project achievements:', error);
               }
           };
           loadAchievements();
       }, []);
    return(
        <div className={`service-area-2 projects-page ${props.serviceClass}`}>
            <div className="container">
                {/* Master Plan Section */}
                <div className="master-plan-section">
                    <div className="row">
                        <div className="col-12">
                            <div className="wpo-section-title text-center">
                                <span>Our Vision</span>
                                <h2>{masterPlan.title || 'ANMC Development Master Plan'}</h2>
                                <p>{masterPlan.description || 'A comprehensive four-phase development plan to create Australia\'s premier multicultural community centre, fostering cultural diversity, community integration, and providing essential services to the Australian-Nepalese and broader multicultural community.'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="master-plan-phases">
                        {(masterPlan.key_areas || masterPlanPhases).map((phase, index) => (
                            <div key={index} className="phase-item">
                                <div className="phase-number">
                                    <span>{String(index + 1).padStart(2, '0')}</span>
                                </div>
                                <div className="phase-content">
                                    <div className="phase-header">
                                        <h3>{phase.title}</h3>
                                        <div className="phase-meta">
                                            <span className={`status-badge ${(phase.status || 'planned').toLowerCase().replace(' ', '-')}`}>
                                                {phase.status || 'Planned'}
                                            </span>
                                            <span className="timeline">{phase.timeline || phase.budget}</span>
                                        </div>
                                    </div>
                                    <p>{phase.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Current Projects Section */}
                <div className="current-projects-section">
                    <div className="row">
                        <div className="col-12">
                            <div className="wpo-section-title text-center">
                                <span>Active Initiatives</span>
                                <h2>Current Projects</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        {currentProjects.map((project, index) => (
                            <div key={index} className="col-lg-4 col-md-6 col-sm-12">
                                <div className="project-card">
                                    <div className="project-icon">
                                        <i className={project.icon}></i>
                                    </div>
                                    <div className="project-content">
                                        <h3>{project.title}</h3>
                                        <p>{project.description}</p>
                                        <div className="project-progress">
                                            <div className="progress-header">
                                                <span>Progress</span>
                                                <span className="percentage">{project.progress}%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill"
                                                    style={{width: `${project.progress}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                        <ul className="project-details">
                                            {project.details.map((detail, idx) => (
                                                <li key={idx}>
                                                    <i className="fa fa-check"></i>
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Project Metrics Section */}
                <div className="project-metrics-section">
                    <div className="row">
                        <div className="col-12">
                            <div className="wpo-section-title text-center">
                                <span>Our Impact</span>
                                <h2>Project Achievements</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        {projectMetrics.map((metric, index) => (
                            <div key={index} className="col-lg-3 col-md-6 col-sm-12">
                                <div className="metric-card">
                                    <div className="metric-icon">
                                        <i className={metric.icon}></i>
                                    </div>
                                    <div className="metric-number">
                                        {metric.number}
                                    </div>
                                    <div className="metric-label">
                                        {metric.label}
                                    </div>
                                    <div className="metric-description">
                                        {metric.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Service2;