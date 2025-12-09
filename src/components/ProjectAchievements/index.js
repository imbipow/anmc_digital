import React, { useState, useEffect } from 'react';
import API_CONFIG from '../../config/api';
import fallbackContent from '../../data/fallbackContent';
import './style.css';

const ProjectAchievements = (props) => {
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
                console.log('Using fallback content for ProjectAchievements');
                // Use fallback counters data
                if (fallbackContent.counters && fallbackContent.counters.length > 0) {
                    const formattedMetrics = fallbackContent.counters.map((counter) => ({
                        icon: counter.prefix === '$' ? 'fa fa-dollar-sign' :
                              counter.label.toLowerCase().includes('land') ? 'fa fa-map-marker' :
                              counter.label.toLowerCase().includes('member') ? 'fa fa-users' :
                              'fa fa-calendar',
                        number: `${counter.prefix || ''}${counter.count}${counter.suffix || ''}`,
                        label: counter.label,
                        description: ''
                    }));
                    setProjectMetrics(formattedMetrics);
                }
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