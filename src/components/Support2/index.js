import React from 'react'
import {Link} from 'react-router-dom'

const Support2 = (props) => {

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
                        <div className="wpo-counter-grids">
                            <div className="grid">
                                <div className="counter-number">
                                    <h2><span className="odometer" data-count="500">500</span>+</h2>
                                </div>
                                <p>Classes Complete</p>
                            </div>
                            <div className="grid">
                                <div className="counter-number">
                                    <h2><span className="odometer" data-count="900">900</span>+</h2>
                                </div>
                                <p>Students Enrolled</p>
                            </div>
                            <div className="grid">
                                <div className="counter-number">
                                    <h2><span className="odometer" data-count="30">30</span>+</h2>
                                </div>
                                <p>Certified Teachers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Support2;