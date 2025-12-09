import React, { useState, useEffect } from 'react'
import contentService from '../../services/contentService'
import fallbackContent from '../../data/fallbackContent'
import './style.css'

const CounterSection = (props) => {
    const [counters, setCounters] = useState([]);

    useEffect(() => {
        const loadCounters = async () => {
            try {
                const homepageData = await contentService.getHomepageContent();
                if (homepageData.counters && homepageData.counters.length > 0) {
                    setCounters(homepageData.counters);
                }
            } catch (error) {
                console.error('Error loading counters:', error);
                // Use fallback content from generated file
                console.log('Using fallback content for Counters');
                if (fallbackContent.counters && fallbackContent.counters.length > 0) {
                    setCounters(fallbackContent.counters);
                }
            }
        };
        loadCounters();
    }, []);

    return(
        <div className={`wpo-counter-area ${props.countclass}`}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="wpo-counter-grids">
                            {counters.map((counter) => (
                                <div className="grid" key={counter.id}>
                                    <div>
                                        <h2>
                                            {counter.prefix && counter.prefix}
                                            <span className="odometer" data-count={counter.count}>{counter.count}</span>
                                            {counter.suffix && counter.suffix}
                                        </h2>
                                    </div>
                                    <p>{counter.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CounterSection;