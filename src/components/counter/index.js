import React, { useState, useEffect } from 'react'
import contentService from '../../services/contentService'
import './style.css'

const CounterSection = (props) => {
    const [counters, setCounters] = useState([
        { id: 1, count: 500, suffix: "+", label: "Life Members" },
        { id: 2, count: 25, suffix: "", label: "Acres of Land" },
        { id: 3, count: 2, prefix: "$", suffix: "M+", label: "Funds Raised" },
        { id: 4, count: 1998, suffix: "", label: "Established" }
    ]);

    useEffect(() => {
        const loadCounters = async () => {
            try {
                const homepageData = await contentService.getHomepageContent();
                if (homepageData.counters && homepageData.counters.length > 0) {
                    setCounters(homepageData.counters);
                }
            } catch (error) {
                console.error('Error loading counters:', error);
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