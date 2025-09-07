import React from 'react'
import {Link} from 'react-router-dom'
import './style.css'

const EventSection2 = (props) => {

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    const upcomingEvents = [
        {
            id: 1,
            date: "15",
            month: "APR",
            year: "2024",
            title: "Dashain Festival Celebration",
            description: "Join us for the grand celebration of Nepal's biggest festival with traditional music, dance, cultural performances, and authentic Nepalese cuisine.",
            time: "10:00 AM - 8:00 PM",
            venue: "ANMC Community Centre, Sydney",
            category: "Festival",
            status: "registration-open"
        },
        {
            id: 2,
            date: "28",
            month: "APR", 
            year: "2024",
            title: "Cultural Heritage Workshop",
            description: "Interactive workshop focusing on preserving Nepalese cultural traditions for future generations through art, music, and storytelling.",
            time: "2:00 PM - 6:00 PM",
            venue: "Cultural Centre Hall, Melbourne",
            category: "Workshop",
            status: "registration-open"
        },
        {
            id: 3,
            date: "12",
            month: "MAY",
            year: "2024", 
            title: "Youth Leadership Program",
            description: "Empowering young Australian-Nepalese community members through leadership training, mentorship, and community engagement activities.",
            time: "9:00 AM - 4:00 PM",
            venue: "ANMC Training Centre, Brisbane",
            category: "Education",
            status: "coming-soon"
        },
        {
            id: 4,
            date: "25",
            month: "MAY",
            year: "2024",
            title: "Community Fundraising Gala",
            description: "Annual fundraising event supporting ANMC development projects with dinner, entertainment, and silent auction.",
            time: "6:00 PM - 11:00 PM", 
            venue: "Grand Ballroom, Perth Convention Centre",
            category: "Fundraising",
            status: "tickets-available"
        }
    ]

    const recentEvents = [
        {
            id: 1,
            title: "Tihar Light Festival 2023",
            date: "November 2023",
            summary: "Over 500 community members celebrated the festival of lights with traditional ceremonies and cultural performances.",
            image: props.eventImg1,
            highlights: ["500+ attendees", "Traditional ceremonies", "Cultural performances"]
        },
        {
            id: 2,
            title: "Annual General Meeting 2023", 
            date: "October 2023",
            summary: "Community members gathered to review annual progress and plan future initiatives for ANMC development.",
            image: props.eventImg2,
            highlights: ["Strategic planning", "Community feedback", "Future roadmap"]
        },
        {
            id: 3,
            title: "Language & Culture Classes Launch",
            date: "September 2023", 
            summary: "New educational programs launched to teach Nepalese language and culture to second-generation youth.",
            image: props.eventImg3,
            highlights: ["50+ students enrolled", "Cultural education", "Language preservation"]
        }
    ]

    return(
        <div className={`wpo-event-area event-page-layout section-padding ${props.EventClass}`}>
            <div className="container">
                {/* Upcoming Events Section */}
                <div className="upcoming-events-section">
                    <div className="row">
                        <div className="col-12">
                            <div className="wpo-section-title">
                                <span>What's Coming</span>
                                <h2>Upcoming Events</h2>
                            </div>
                        </div>
                    </div>
                    <div className="events-timeline">
                        {upcomingEvents.map((event, index) => (
                            <div key={event.id} className="timeline-event-item">
                                <div className="event-date-block">
                                    <div className="date-number">{event.date}</div>
                                    <div className="date-month">{event.month}</div>
                                    <div className="date-year">{event.year}</div>
                                </div>
                                <div className="event-details">
                                    <div className="event-header">
                                        <h3>{event.title}</h3>
                                        <span className={`event-category ${event.category.toLowerCase()}`}>
                                            {event.category}
                                        </span>
                                    </div>
                                    <p className="event-description">{event.description}</p>
                                    <div className="event-meta">
                                        <div className="event-time">
                                            <i className="fa fa-clock-o"></i>
                                            <span>{event.time}</span>
                                        </div>
                                        <div className="event-venue">
                                            <i className="fa fa-map-marker"></i>
                                            <span>{event.venue}</span>
                                        </div>
                                    </div>
                                    <div className="event-actions">
                                        <Link 
                                            onClick={ClickHandler} 
                                            to="/event-single" 
                                            className="event-register-btn"
                                        >
                                            {event.status === 'registration-open' ? 'Register Now' : 
                                             event.status === 'tickets-available' ? 'Buy Tickets' : 
                                             'Learn More'}
                                            <i className="fa fa-arrow-right"></i>
                                        </Link>
                                        <span className={`event-status ${event.status}`}>
                                            {event.status === 'registration-open' ? 'Registration Open' :
                                             event.status === 'tickets-available' ? 'Tickets Available' :
                                             'Coming Soon'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Events Section */}
                <div className="recent-events-section">
                    <div className="row">
                        <div className="col-12">
                            <div className="wpo-section-title">
                                <span>Our Legacy</span>
                                <h2>Recent Events</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        {recentEvents.map((event, index) => (
                            <div key={event.id} className="col-lg-4 col-md-6 col-sm-12">
                                <div className="recent-event-card">
                                    <div className="event-image">
                                        <img src={event.image} alt={event.title} />
                                        <div className="event-date-overlay">
                                            {event.date}
                                        </div>
                                    </div>
                                    <div className="event-content">
                                        <h4>{event.title}</h4>
                                        <p>{event.summary}</p>
                                        <ul className="event-highlights">
                                            {event.highlights.map((highlight, idx) => (
                                                <li key={idx}>
                                                    <i className="fa fa-check"></i>
                                                    {highlight}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="event-archive-link">
                                            <Link onClick={ClickHandler} to="/event-single">
                                                View Gallery <i className="fa fa-images"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="archive-section">
                        <div className="text-center">
                            <Link onClick={ClickHandler} to="/event" className="archive-link">
                                View All Past Events <i className="fa fa-archive"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EventSection2;