import React, { useState, useEffect } from 'react'
import {Link} from 'react-router-dom'
import contentService from '../../services/contentService'

import './style.css'

const EventSection = (props) => {
    const [eventList, setEventList] = useState([
        {
           eventImg:props.eventImg1,
           date:"25",
           month:"NOV",
           title:"Community Picnic 2025",
           time:"10:00 - 16:00",
           location:"Riverside Park",
           des:"Annual community picnic with games, food, and entertainment for all ages.",
           btn:"Learn More...",
           link:"/event-single",
        },
        {
           eventImg:props.eventImg2,
           date:"10",
           month:"FEB",
           title:"Cultural Dance Workshop",
           time:"14:00 - 17:00",
           location:"ANMC Community Center",
           des:"Learn traditional Nepalese dances with experienced instructors.",
           btn:"Learn More...",
           link:"/event-single",
        },
    ]);

    const ClickHandler = () =>{
        window.scrollTo(10, 0);
     }

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const events = await contentService.getEvents(true); // Get featured events
                if (events && events.length > 0) {
                    const formattedEvents = events.slice(0, 2).map((event, index) => {
                        const startDate = new Date(event.startDate);

                        // Format date to match EventSingle style: "Month Day, Year"
                        const formattedStartDate = startDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });

                        const formattedEndDate = event.endDate ? new Date(event.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : null;

                        // Combine start and end dates if different
                        const dateDisplay = formattedEndDate && formattedEndDate !== formattedStartDate
                            ? `${formattedStartDate} - ${formattedEndDate}`
                            : formattedStartDate;

                        // Handle both time formats: single 'time' field or separate 'startTime' and 'endTime'
                        let timeDisplay = event.time || '';
                        if (!timeDisplay && event.startTime && event.endTime) {
                            timeDisplay = `${event.startTime} - ${event.endTime}`;
                        }

                        return {
                            eventImg: event.featuredImage || event.image || (index === 0 ? props.eventImg1 : props.eventImg2),
                            date: startDate.getDate().toString(),
                            month: startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
                            title: event.title,
                            fullDate: dateDisplay,
                            time: timeDisplay,
                            location: event.location,
                            des: event.description || event.summary,
                            btn: "Learn More...",
                            link: `/event/${event.slug || event.id}`,
                        };
                    });
                    setEventList(formattedEvents);
                }
            } catch (error) {
                console.error('Error loading events:', error);
            }
        };
        loadEvents();
    }, [props.eventImg1, props.eventImg2]);

    return(
        <div className={`wpo-event-area section-padding  ${props.EventClass}`}>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="wpo-section-title">
                            <span>Our Events</span>
                            <h2>Our Upcomming event</h2>
                        </div>
                    </div>
                </div>
                <div className="row">
                    {eventList.map( (item, en) => (
                        <div className="col-lg-6 col-sm-12 col-12 custom-grid" key={en}>
                            <div className="wpo-event-item">
                                <div className="wpo-event-img">
                                    <img src={item.eventImg} alt="" />
                                    <div className="thumb-text">
                                        <span>{item.date}</span>
                                        <span>{item.month}</span>
                                    </div>
                                </div>
                                <div className="wpo-event-text">
                                    <h2>{item.title}</h2>
                                    <ul>
                                        <li><i className="fa fa-calendar" aria-hidden="true"></i>{item.fullDate}</li>
                                        {item.time && <li><i className="fa fa-clock-o" aria-hidden="true"></i>{item.time}</li>}
                                        {item.location && <li><i className="fa fa-map-marker"></i>{item.location}</li>}
                                    </ul>
                                    <p>{item.des}</p>
                                    <Link onClick={ClickHandler} to={item.link}>{item.btn}</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default EventSection;