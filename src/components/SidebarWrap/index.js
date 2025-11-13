import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom'
import API_CONFIG from '../../config/api';

const SidebarWrap = () => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    useEffect(() => {
        const loadUpcomingEvents = async () => {
            try {
                setLoading(true);
                const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.events));
                const events = await response.json();

                // Filter for upcoming events and limit to 3
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

                const upcoming = events
                    .filter(event => {
                        if (!event.startDate) return false;
                        const eventDate = new Date(event.startDate);
                        eventDate.setHours(0, 0, 0, 0);
                        return eventDate >= today;
                    })
                    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                    .slice(0, 3);

                console.log('Sidebar - All events:', events.length);
                console.log('Sidebar - Upcoming events:', upcoming.length);
                setUpcomingEvents(upcoming);
                setLoading(false);
            } catch (error) {
                console.error('Error loading upcoming events:', error);
                setLoading(false);
            }
        };

        loadUpcomingEvents();
    }, []);

    return(
        <div className="col col-lg-4 col-12">
            <div className="wpo-blog-sidebar">
                <div className="widget recent-post-widget">
                    <h3>Upcoming Events</h3>
                    {loading ? (
                        <div className="posts">
                            <p>Loading events...</p>
                        </div>
                    ) : upcomingEvents.length > 0 ? (
                        <div className="posts">
                            {upcomingEvents.map((event) => {
                                const eventDate = new Date(event.startDate);
                                const formattedDate = eventDate.toLocaleDateString('en-US', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                });

                                return (
                                    <div key={event.id} className="post">
                                        <div className="img-holder">
                                            <img
                                                src={event.featuredImage || event.image}
                                                alt={event.title}
                                                onError={(e) => {
                                                    e.target.src = '/images/event/default-event.jpg';
                                                }}
                                            />
                                        </div>
                                        <div className="details">
                                            <h4>
                                                <Link
                                                    to={`/event/${event.slug || event.id}`}
                                                    onClick={ClickHandler}
                                                >
                                                    {event.title}
                                                </Link>
                                            </h4>
                                            <span className="date">{formattedDate}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="posts">
                            <p>No upcoming events at this time.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SidebarWrap;
