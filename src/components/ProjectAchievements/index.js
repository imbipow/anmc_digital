import React, { useState, useEffect } from 'react';
import API_CONFIG from '../../config/api';
import './style.css';

const ProjectAchievements = (props) => {
    const [projectMetrics, setProjectMetrics] = useState([
        {
            icon: "fa fa-dollar-sign",
            number: "$4.3M",
            label: "Funds Raised",
            description: "Total funds secured through donations and grants"
        },
        {
            icon: "fa fa-map",
            number: "52",
            label: "Acres Acquired",
            description: "Land secured for the multicultural centre"
        },
        {
            icon: "fa fa-heart",
            number: "750+",
            label: "Supporting Members",
            description: "Community members actively supporting the project"
        },
        {
            icon: "fa fa-landmark",
            number: "$1.8M",
            label: "Government Funding",
            description: "Secured funding from government initiatives"
        }
    ]);

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

    return (
        <div className={`project-achievements-section section-padding ${props.className || ''}`}>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="wpo-section-title text-center">
                            <span>Our Impact</span>
                            <h2>Project Achievements</h2>
                            <p>Measurable progress in building Australia's premier multicultural community centre</p>
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
    );
};

export default ProjectAchievements;