import React, { useState, useEffect } from 'react'
import contentService from '../../services/contentService'
import './style.css'

const About = () => {
    const [aboutData, setAboutData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const data = await contentService.getAboutUs();
                setAboutData(data);
            } catch (error) {
                console.error('Error fetching about data:', error);
                // Set fallback data if API fails
                setAboutData({
                    mission: { 
                        title: 'Our Mission', 
                        content: 'To foster cultural diversity and strengthen community bonds through programs that celebrate Nepalese heritage while promoting integration and multicultural understanding in Australia.',
                        icon: 'fa fa-bullseye'
                    },
                    vision: { 
                        title: 'Our Vision', 
                        content: 'To be Australia\'s leading multicultural centre that bridges communities, preserves cultural identity, and creates opportunities for growth, learning, and mutual respect among diverse populations.',
                        icon: 'fa fa-eye'
                    },
                    history: { 
                        title: 'Our History', 
                        content: 'Established to serve the growing Nepalese community in Australia, ANMC has evolved into a vibrant multicultural hub, organizing events, providing support services, and fostering community connections since our inception.',
                        icon: 'fa fa-history'
                    },
                    executiveCommittee: {
                        title: 'Executive Committee',
                        subtitle: 'Meet our dedicated leadership team',
                        members: [
                            { title: 'President', position: 'Executive Leadership', description: 'Leading the organization\'s strategic direction and community outreach initiatives while fostering partnerships and growth opportunities.' },
                            { title: 'Vice President', position: 'Operations Management', description: 'Supporting organizational operations and coordinating community programs to ensure effective service delivery and member engagement.' },
                            { title: 'Secretary', position: 'Administrative Affairs', description: 'Managing organizational documentation, communications, and ensuring compliance with governance requirements and community standards.' },
                            { title: 'Treasurer', position: 'Financial Management', description: 'Overseeing financial planning, budget management, and ensuring transparent financial practices for sustainable organizational growth.' }
                        ]
                    },
                    governance: {
                        title: 'Governance Structure',
                        subtitle: 'Our organizational leadership framework',
                        structure: [
                            { title: 'Presidential Council', description: 'The Presidential Council provides strategic guidance and oversight, ensuring organizational alignment with community needs and long-term sustainability goals.', icon: 'fa fa-gavel' },
                            { title: 'Patrons', description: 'Distinguished community leaders who lend their expertise and support, helping to advance our mission and strengthen community partnerships.', icon: 'fa fa-shield' },
                            { title: 'Advisors', description: 'Experienced professionals providing specialized knowledge and guidance across various domains to enhance our programs and community impact.', icon: 'fa fa-users' }
                        ]
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAboutData();
    }, []);

    if (loading) {
        return (
            <div className="wpo-about-area section-padding">
                <div className="container">
                    <div className="text-center">
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!aboutData) {
        return (
            <div className="wpo-about-area section-padding">
                <div className="container">
                    <div className="text-center">
                        <p>Unable to load about content.</p>
                    </div>
                </div>
            </div>
        );
    }
    return(
        <div className="wpo-about-area section-padding">
            <div className="container">
                {/* Mission/Vision/History Section */}
                <div className="mission-vision-section">
                    <div className="row">
                        <div className="col-lg-4 col-md-6 col-sm-12">
                            <div className="mission-card">
                                <div className="card-icon">
                                    <i className={aboutData.mission?.icon || "fa fa-bullseye"}></i>
                                </div>
                                <h3>{aboutData.mission?.title || 'Our Mission'}</h3>
                                <p>{aboutData.mission?.content || 'To foster cultural diversity and strengthen community bonds through programs that celebrate Nepalese heritage while promoting integration and multicultural understanding in Australia.'}</p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12">
                            <div className="vision-card">
                                <div className="card-icon">
                                    <i className={aboutData.vision?.icon || "fa fa-eye"}></i>
                                </div>
                                <h3>{aboutData.vision?.title || 'Our Vision'}</h3>
                                <p>{aboutData.vision?.content || 'To be Australia\'s leading multicultural centre that bridges communities, preserves cultural identity, and creates opportunities for growth, learning, and mutual respect among diverse populations.'}</p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12">
                            <div className="history-card">
                                <div className="card-icon">
                                    <i className={aboutData.history?.icon || "fa fa-history"}></i>
                                </div>
                                <h3>{aboutData.history?.title || 'Our History'}</h3>
                                <p>{aboutData.history?.content || 'Established to serve the growing Nepalese community in Australia, ANMC has evolved into a vibrant multicultural hub, organizing events, providing support services, and fostering community connections since our inception.'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Executive Committee Section */}
                <div className="executive-committee-section section-padding">
                    <div className="wpo-section-title text-center">
                        <h2>{aboutData.executiveCommittee?.title || 'Executive Committee'}</h2>
                        <p>{aboutData.executiveCommittee?.subtitle || 'Meet our dedicated leadership team'}</p>
                    </div>
                    <div className="row">
                        {aboutData.executiveCommittee?.members?.length > 0 ? (
                            aboutData.executiveCommittee.members.map((member, index) => (
                                <div key={index} className="col-lg-6 col-md-6 col-sm-12 card-item">
                                    <div className="team-member-card">
                                        <div className="member-photo">
                                            {member.image ? (
                                                <img src={member.image} alt={member.title} />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    <i className="fa fa-user"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="member-info">
                                            <h4>{member.name || member.title}</h4>
                                            <span className="position">{member.title || member.position}</span>
                                            <p>{member.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Default members if none provided
                            <>
                                <div className="col-lg-6 col-md-6 col-sm-12">
                                    <div className="team-member-card">
                                        <div className="member-photo">
                                            <div className="avatar-placeholder">
                                                <i className="fa fa-user"></i>
                                            </div>
                                        </div>
                                        <div className="member-info">
                                            <h4>President</h4>
                                            <span className="position">Executive Leadership</span>
                                            <p>Leading the organization's strategic direction and community outreach initiatives while fostering partnerships and growth opportunities.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-12">
                                    <div className="team-member-card">
                                        <div className="member-photo">
                                            <div className="avatar-placeholder">
                                                <i className="fa fa-user"></i>
                                            </div>
                                        </div>
                                        <div className="member-info">
                                            <h4>Secretary</h4>
                                            <span className="position">Administrative Affairs</span>
                                            <p>Managing organizational documentation, communications, and ensuring compliance with governance requirements.</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Governance Structure Section */}
                <div className="governance-structure-section">
                    <div className="wpo-section-title text-center">
                        <h2>{aboutData.governance?.title || 'Governance Structure'}</h2>
                        <p>{aboutData.governance?.subtitle || 'Our organizational leadership framework'}</p>
                    </div>
                    <div className="row">
                        {aboutData.governance?.structure?.length > 0 ? (
                            aboutData.governance.structure.map((item, index) => (
                                <div key={index} className="col-lg-4 col-md-6 col-sm-12">
                                    <div className="governance-card">
                                        <div className="governance-icon">
                                            <i className={item.icon || "fa fa-gavel"}></i>
                                        </div>
                                        <h3>{item.title}</h3>
                                        <p>{item.description}</p>
                                        {item.members && item.members.length > 0 && (
                                            <div className="governance-members">
                                                <h5>Members:</h5>
                                                <ul>
                                                    {item.members.map((member, idx) => (
                                                        <li key={idx}>{member}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {item.responsibilities && item.responsibilities.length > 0 && (
                                            <div className="governance-responsibilities">
                                                <h5>Key Responsibilities:</h5>
                                                <ul>
                                                    {item.responsibilities.map((resp, idx) => (
                                                        <li key={idx}>{resp}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Default governance items if none provided
                            <>
                                <div className="col-lg-4 col-md-6 col-sm-12">
                                    <div className="governance-card">
                                        <div className="governance-icon">
                                            <i className="fa fa-gavel"></i>
                                        </div>
                                        <h3>Presidential Council</h3>
                                        <p>The Presidential Council provides strategic guidance and oversight, ensuring organizational alignment with community needs and long-term sustainability goals.</p>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-sm-12">
                                    <div className="governance-card">
                                        <div className="governance-icon">
                                            <i className="fa fa-shield"></i>
                                        </div>
                                        <h3>Patrons</h3>
                                        <p>Distinguished community leaders who lend their expertise and support, helping to advance our mission and strengthen community partnerships.</p>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-sm-12">
                                    <div className="governance-card">
                                        <div className="governance-icon">
                                            <i className="fa fa-users"></i>
                                        </div>
                                        <h3>Advisors</h3>
                                        <p>Experienced professionals providing specialized knowledge and guidance across various domains to enhance our programs and community impact.</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Sub-committees Section */}
                {aboutData.committees && aboutData.committees.length > 0 && (
                    <div className="committees-section section-padding">
                        <div className="wpo-section-title text-center">
                            <h2>Sub-committees</h2>
                            <p>Specialized committees working on various aspects of our organization</p>
                        </div>
                        <div className="row">
                            {aboutData.committees.map((committee, index) => (
                                <div key={committee.id || index} className="col-lg-6 col-md-6 col-sm-12">
                                    <div className="committee-card">
                                        <div className="committee-header">
                                            <h4>{committee.name}</h4>
                                            {committee.chairperson && (
                                                <span className="chairperson">
                                                    <i className="fa fa-user-tie"></i> Chairperson: {committee.chairperson}
                                                </span>
                                            )}
                                        </div>
                                        <div className="committee-details">
                                            {committee.purpose && (
                                                <p className="purpose"><strong>Purpose:</strong> {committee.purpose}</p>
                                            )}
                                            {committee.meetingFrequency && (
                                                <p className="meeting-frequency">
                                                    <i className="fa fa-calendar"></i> <strong>Meetings:</strong> {committee.meetingFrequency}
                                                </p>
                                            )}
                                            {committee.members && (
                                                <p className="member-count">
                                                    <i className="fa fa-users"></i> <strong>Members:</strong> {committee.members}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default About;