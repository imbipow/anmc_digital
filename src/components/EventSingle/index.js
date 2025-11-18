import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import SEO from '../SEO';
import SidebarWrap from '../SidebarWrap'
import API_CONFIG from '../../config/api';
import './style.css'

const EventSingle = (props) => {
    const { slug } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('1');

    const SubmitHandler = (e) => {
        e.preventDefault()
    }

    const toggle = tab => {
        if(activeTab !== tab) setActiveTab(tab);
    }

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!slug) {
                    // If no slug provided, load the first featured event (for backward compatibility)
                    const eventsResponse = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.eventsFeatured));
                    const events = await eventsResponse.json();

                    if (events && events.length > 0) {
                        setEvent(events[0]);
                    } else {
                        // If no featured events, get the first upcoming event
                        const allEventsResponse = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.events));
                        const allEvents = await allEventsResponse.json();
                        if (allEvents && allEvents.length > 0) {
                            setEvent(allEvents[0]);
                        } else {
                            setError('No events available');
                        }
                    }
                    setLoading(false);
                    return;
                }

                // Fetch event by slug
                const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.eventsBySlug(slug)));

                if (!response.ok) {
                    throw new Error('Event not found');
                }

                const eventData = await response.json();
                setEvent(eventData);
                setLoading(false);
            } catch (error) {
                console.error('Error loading event:', error);
                setError('Failed to load event. Please try again.');
                setLoading(false);
            }
        };

        loadEvent();
    }, [slug]);

    if (loading) {
        return (
            <div className="wpo-event-details-area section-padding">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading event...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="wpo-event-details-area section-padding">
                <div className="container">
                    <div className="error-state">
                        <h2>Event Not Found</h2>
                        <p>{error || 'The event you are looking for does not exist.'}</p>
                        <Link to="/event" className="theme-btn">
                            <i className="fa fa-arrow-left"></i> Back to Events
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const formattedStartDate = new Date(event.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formattedEndDate = event.endDate ? new Date(event.endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : null;

    return (
        <>
            {event && !loading && (
                <SEO
                    title={event.title}
                    description={event.description || event.summary}
                    keywords={event.tags ? event.tags.join(', ') : `${event.category}, ANMC Events, Community Events`}
                    type="event"
                    image={event.featuredImage || ''}
                    publishedTime={event.startDate || ''}
                    category={event.category || ''}
                    tags={event.tags || []}
                />
            )}
            <div className="wpo-event-details-area section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col col-lg-8">
                            <div className="wpo-event-item">
                                <div className="wpo-event-img">
                                    <img src={event.featuredImage || event.image} alt={event.title}/>
                                    {event.startDate && (
                                        <div className="thumb-text">
                                            <span>{new Date(event.startDate).getDate()}</span>
                                            <span>{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="wpo-event-details-text">
                                    <h2>{event.title}</h2>

                                    {/* Event Meta Information */}
                                    <div className="event-meta">
                                        <div className="meta-item">
                                            <i className="fa fa-calendar"></i>
                                            <span>
                                                {formattedStartDate}
                                                {formattedEndDate && formattedEndDate !== formattedStartDate && ` - ${formattedEndDate}`}
                                            </span>
                                        </div>
                                        {event.time && (
                                            <div className="meta-item">
                                                <i className="fa fa-clock-o"></i>
                                                <span>{event.time}</span>
                                            </div>
                                        )}
                                        {event.location && (
                                            <div className="meta-item">
                                                <i className="fa fa-map-marker"></i>
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                        {event.category && (
                                            <div className="meta-item">
                                                <i className="fa fa-tag"></i>
                                                <span>{event.category}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Event Description */}
                                    <div className="event-description">
                                        <p>{event.content || event.summary}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    {((event.registrationLink && event.registrationLink.trim() !== '') ||
                                      (event.galleryLink && event.galleryLink.trim() !== '')) && (
                                        <div className="event-action-buttons">
                                            {event.registrationLink && event.registrationLink.trim() !== '' && (
                                                <a
                                                    href={event.registrationLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="theme-btn"
                                                >
                                                    <i className="fa fa-user-plus"></i> Register for Event
                                                </a>
                                            )}
                                            {event.galleryLink && event.galleryLink.trim() !== '' && (
                                                <a
                                                    href={event.galleryLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="theme-btn"
                                                >
                                                    <i className="fa fa-camera"></i> View Gallery
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="wpo-event-details-wrap">
                                    <div className="wpo-event-details-tab">
                                        <Nav tabs>
                                            <NavItem>
                                                <NavLink
                                                    className={classnames({ active: activeTab === '1' })}
                                                    onClick={() => { toggle('1'); }}
                                                >
                                                    Event Details
                                                </NavLink>
                                            </NavItem>
                                            {event.mapUrl && (
                                                <NavItem>
                                                    <NavLink
                                                        className={classnames({ active: activeTab === '2' })}
                                                        onClick={() => { toggle('2'); }}
                                                    >
                                                    Map Location
                                                    </NavLink>
                                                </NavItem>
                                            )}
                                        </Nav>
                                    </div>
                                    <div className="wpo-event-details-content">
                                        <TabContent activeTab={activeTab}>
                                            <TabPane tabId="1" id="Details">
                                                {event.fullDescription ? (
                                                    <div dangerouslySetInnerHTML={{ __html: event.fullDescription }} />
                                                ) : (
                                                    <div>
                                                        <p>{event.description || event.summary}</p>
                                                        {event.tags && event.tags.length > 0 && (
                                                            <div className="event-tags">
                                                                <h4>Tags:</h4>
                                                                <ul>
                                                                    {event.tags.map((tag, index) => (
                                                                        <li key={index}>#{tag}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </TabPane>
                                            {event.mapUrl && (
                                                <TabPane tabId="2">
                                                    <div className="contact-map enent-map">
                                                        <iframe title='enent-map' src={event.mapUrl}></iframe>
                                                    </div>
                                                </TabPane>
                                            )}
                                        </TabContent>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <SidebarWrap/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EventSingle;
