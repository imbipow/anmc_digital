import React, { useState, useEffect } from 'react'
import {Link} from 'react-router-dom'
import contentService from '../../services/contentService'
import './style.css'

const EventSection2 = (props) => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    const [hasMorePastEvents, setHasMorePastEvents] = useState(false);

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const events = await contentService.getEvents();
                if (events && events.length > 0) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // Filter upcoming events (future dates)
                    const upcomingEventsData = events.filter(event => {
                        if (!event.startDate) return false;
                        const eventDate = new Date(event.startDate);
                        eventDate.setHours(0, 0, 0, 0);
                        return eventDate >= today;
                    });

                    // Filter past events (past dates)
                    const pastEventsData = events.filter(event => {
                        if (!event.startDate) return false;
                        const eventDate = new Date(event.startDate);
                        eventDate.setHours(0, 0, 0, 0);
                        return eventDate < today;
                    });

                    // Format events for upcoming section
                    const formattedUpcoming = upcomingEventsData
                        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                        .map(event => {
                            const startDate = new Date(event.startDate);
                            return {
                                id: event.id,
                                slug: event.slug,
                                date: startDate.getDate().toString(),
                                month: startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
                                year: startDate.getFullYear().toString(),
                                title: event.title,
                                description: event.description,
                                time: `${event.startTime} - ${event.endTime}`,
                                venue: event.location,
                                category: event.category || 'Event',
                                status: event.status === 'upcoming' ? 'registration-open' : 'coming-soon'
                            };
                        });
                    setUpcomingEvents(formattedUpcoming);

                    // Format events for recent section (show up to 3 past events)
                    const formattedRecent = pastEventsData
                        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                        .slice(0, 3)
                        .map((event, index) => {
                            const images = [props.eventImg1, props.eventImg2, props.eventImg3];
                            return {
                                id: event.id,
                                slug: event.slug,
                                title: event.title,
                                date: new Date(event.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
                                summary: event.description,
                                image: event.featuredImage || images[index % images.length],
                                highlights: [`${event.maxAttendees || '100+'} attendees`, event.category || 'Community event', 'Cultural activities']
                            };
                        });
                    setRecentEvents(formattedRecent);

                    // Check if there are more than 3 past events
                    setHasMorePastEvents(pastEventsData.length > 3);
                }
            } catch (error) {
                console.error('Error loading events:', error);
                // Set fallback data if API fails
                setUpcomingEventsDefault();
                setRecentEventsDefault();
            }
        };
        loadEvents();
    }, [props.eventImg1, props.eventImg2, props.eventImg3]);

    const setUpcomingEventsDefault = () => {
        setUpcomingEvents([
            {
                id: 1,
                date: "15",
                month: "MAR",
                year: "2025",
                title: "Community Picnic 2025",
                description: "Annual community picnic at Riverside Park with games, food, and entertainment for all ages.",
                time: "10:00 - 16:00",
                venue: "Riverside Park, Melbourne",
                category: "Community",
                status: "registration-open"
            }
        ]);
    };

    const setRecentEventsDefault = () => {
        setRecentEvents([
            {
                id: 1,
                title: "Dashain Celebration 2024",
                date: "October 2024",
                summary: "Over 200 community members celebrated Nepal's biggest festival with traditional activities.",
                image: props.eventImg1,
                highlights: ["200+ attendees", "Traditional ceremonies", "Cultural performances"]
            }
        ]);
    };


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
                                            to={`/event/${event.slug || event.id}`}
                                            className="event-register-btn"
                                        >
                                            View Event
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
                                            <Link onClick={ClickHandler} to={`/event/${event.slug || event.id}`}>
                                                View Event <i className="fa fa-arrow-right"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {hasMorePastEvents && (
                        <div className="archive-section">
                            <div className="text-center">
                                <Link onClick={ClickHandler} to="/event" className="archive-link">
                                    View All Past Events <i className="fa fa-archive"></i>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EventSection2;