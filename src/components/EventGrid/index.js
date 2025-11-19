import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import contentService from '../../services/contentService';
import { formatTimeRange } from '../../utils/timeUtils';
import './style.css';

const EventGrid = ({ showTitle = true, limit = 6 }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    };

    useEffect(() => {
        const loadEvents = async () => {
            try {
                setLoading(true);
                console.log('EventGrid: Starting to load events...');

                // Get all events (not just featured)
                const eventsData = await contentService.getEvents(false);
                console.log('EventGrid: Raw events data:', eventsData);
                console.log('EventGrid: Total events loaded:', eventsData?.length || 0);

                if (!eventsData) {
                    console.error('EventGrid: eventsData is null or undefined');
                    setEvents([]);
                    return;
                }

                if (eventsData.length === 0) {
                    console.warn('EventGrid: No events returned from API');
                    setEvents([]);
                    return;
                }

                // Get current date (start of today) for comparison
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Filter published, upcoming, or featured events AND only future events
                const publishedEvents = eventsData.filter(event => {
                    // Check status
                    const hasNoStatus = !event.status;
                    const isPublished = event.status === 'published';
                    const isUpcoming = event.status === 'upcoming';
                    const isFeatured = event.featured === true || event.featured === 'true';
                    const passesStatusFilter = hasNoStatus || isPublished || isUpcoming || isFeatured;

                    // Check if event is in the future
                    if (!event.startDate) {
                        console.log(`EventGrid: Event "${event.title}" - missing startDate, excluded`);
                        return false;
                    }

                    const eventStartDate = new Date(event.startDate);
                    eventStartDate.setHours(0, 0, 0, 0);
                    const isFutureEvent = eventStartDate >= today;

                    console.log(`EventGrid: Event "${event.title}" - status: ${event.status}, featured: ${event.featured}, startDate: ${event.startDate}, isFuture: ${isFutureEvent}, passes filter: ${passesStatusFilter && isFutureEvent}`);

                    return passesStatusFilter && isFutureEvent;
                });
                console.log('EventGrid: Future events after filter:', publishedEvents.length);

                if (publishedEvents.length === 0) {
                    console.warn('EventGrid: No events passed the filter');
                    setEvents([]);
                    return;
                }

                const formattedEvents = publishedEvents
                    .map(event => {
                        if (!event.startDate) {
                            console.warn('EventGrid: Event missing startDate:', event);
                            return null;
                        }

                        const startDate = new Date(event.startDate);

                        // Format dates: "December 18, 2025"
                        const formattedStartDate = startDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });

                        let dateDisplay = formattedStartDate;

                        // If there's an end date and it's different from start date
                        if (event.endDate) {
                            const endDate = new Date(event.endDate);
                            const formattedEndDate = endDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });

                            if (formattedEndDate !== formattedStartDate) {
                                dateDisplay = `${formattedStartDate} - ${formattedEndDate}`;
                            }
                        }

                        // Format time with AM/PM
                        let timeDisplay = '';
                        if (event.time) {
                            // If time field contains a range separator
                            if (event.time.includes(' - ') || event.time.includes(' to ')) {
                                const parts = event.time.split(/ - | to /);
                                if (parts.length === 2) {
                                    timeDisplay = formatTimeRange(parts[0].trim(), parts[1].trim());
                                } else {
                                    timeDisplay = event.time;
                                }
                            } else {
                                timeDisplay = event.time;
                            }
                        } else if (event.startTime || event.endTime) {
                            timeDisplay = formatTimeRange(event.startTime, event.endTime);
                        }

                        return {
                            id: event.id,
                            title: event.title,
                            description: event.description || event.summary,
                            image: event.featuredImage || event.image,
                            category: event.category || 'Event',
                            date: dateDisplay,
                            startDate: startDate,
                            time: timeDisplay,
                            location: event.location,
                            slug: event.slug
                        };
                    })
                    .filter(event => event !== null) // Remove any null entries
                    .sort((a, b) => a.startDate - b.startDate) // Sort by start date ascending (upcoming first)
                    .slice(0, limit);

                console.log('EventGrid: Final formatted events to display:', formattedEvents.length);
                console.log('EventGrid: Event titles:', formattedEvents.map(e => e.title));
                setEvents(formattedEvents);
            } catch (error) {
                console.error('EventGrid: Error loading events:', error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, [limit]);

    if (loading) {
        return (
            <div className="event-grid-section section-padding">
                <div className="container">
                    <div className="text-center">
                        <div className="spinner" style={{ margin: '50px auto' }}>
                            <i className="fa fa-spinner fa-spin fa-3x"></i>
                            <p style={{ marginTop: '20px' }}>Loading events...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        console.log('EventGrid: No events to display, hiding section');
        return null;
    }

    return (
        <div className="event-grid-section section-padding">
            <div className="container">
                {showTitle && (
                    <div className="row">
                        <div className="col-12">
                            <div className="wpo-section-title">
                                <span>Upcoming Events</span>
                                <h2>Join Our Community Events</h2>
                            </div>
                        </div>
                    </div>
                )}

                <div className="row">
                    {events.map((event) => (
                        <div key={event.id} className="col-lg-4 col-md-6 col-sm-12 custom-grid">
                            <div className="event-grid-item">
                                <div className="event-grid-img">
                                    <img src={event.image} alt={event.title} />
                                    <div className="date-badge">
                                        <span>{event.startDate.getDate()}</span>
                                        <small>{event.startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</small>
                                    </div>
                                    {event.category && (
                                        <div className="category-tag">{event.category}</div>
                                    )}
                                </div>
                                <div className="event-grid-content">
                                    <h3>
                                        <Link onClick={ClickHandler} to={`/event/${event.slug || event.id}`}>
                                            {event.title}
                                        </Link>
                                    </h3>
                                    <ul className="event-meta">
                                        <li>
                                            <i className="fa fa-calendar"></i>
                                            <span>{event.date}</span>
                                        </li>
                                        {event.time && (
                                            <li>
                                                <i className="fa fa-clock-o"></i>
                                                <span>{event.time}</span>
                                            </li>
                                        )}
                                        {event.location && (
                                            <li>
                                                <i className="fa fa-map-marker"></i>
                                                <span>{event.location}</span>
                                            </li>
                                        )}
                                    </ul>
                                    {event.description && (
                                        <p>{event.description.substring(0, 120)}{event.description.length > 120 ? '...' : ''}</p>
                                    )}
                                    <Link onClick={ClickHandler} to={`/event/${event.slug || event.id}`} className="read-more-link">
                                        View Details <i className="fa fa-arrow-right"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {showTitle && (
                    <div className="row">
                        <div className="col-12 text-center" style={{ marginTop: '30px' }}>
                            <Link onClick={ClickHandler} to="/event" className="theme-btn">
                                View All Events
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventGrid;
