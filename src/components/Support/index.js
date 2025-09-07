import React from 'react'
import {Link} from 'react-router-dom'
import './style.css'

const Support = (props) => {

    const ClickHandler = () =>{
        window.scrollTo(10, 0);
     }

    return(
        <div className="support-area section-padding">
            <div className="container">
                <div className="row">
                    <div className="col-lg-6">
                        <div className="support-text">
                            <span>Support Us</span>
                            <h2>We Need Your Help</h2>
                            <p>The Weekend School of the Islamic Center of Allah is committed to providing quality Islamic Education according to the Quran.</p>
                            <div className="btns">
                                <Link onClick={ClickHandler} to="/donate" className="theme-btn-s3">Donate Now</Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="progress-area">
                            <div className="row">
                                <div className="col-lg-4 col-sm-4 custom-grid">
                                    <div className="progress-wrap">
                                        <div className="progress s1">
                                            <span className="progress-left">
                                                <span className="progress-bar"></span>
                                            </span>
                                            <span className="progress-right">
                                                <span className="progress-bar"></span>
                                            </span>
                                            <div className="progress-value">90%</div>
                                        </div>
                                        <span>Mosque</span>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-sm-4 custom-grid">
                                    <div className="progress-wrap">
                                        <div className="progress s2">
                                            <span className="progress-left">
                                                <span className="progress-bar"></span>
                                            </span>
                                            <span className="progress-right">
                                                <span className="progress-bar"></span>
                                            </span>
                                            <div className="progress-value">80%</div>
                                        </div>
                                        <span>Expenses</span>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-sm-4 custom-grid">
                                    <div className="progress-wrap">
                                        <div className="progress s3">
                                            <span className="progress-left">
                                                <span className="progress-bar"></span>
                                            </span>
                                            <span className="progress-right">
                                                <span className="progress-bar"></span>
                                            </span>
                                            <div className="progress-value">65%</div>
                                        </div>
                                        <span>Feed Hungry</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Support;