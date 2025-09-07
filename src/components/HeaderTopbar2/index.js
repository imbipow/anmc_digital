import React from 'react'
import {Link}  from 'react-router-dom'
import './style.css'

const HeaderTopbar2 = () => {
    return(	
        <div className="header-topbar">
            <div className="container">
                <div className="row">
                    <div className="col col-md-6 col-sm-7 col-12">
                        <div className="contact-intro">
                            <ul>
                                <li><i className="fi ti-location-pin"></i>28 Street, New York City, USA</li>
                                <li><i className="fi flaticon-envelope"></i> Ummah@gmail.com</li>
                            </ul>
                        </div>
                    </div>
                    <div className="col col-md-6 col-sm-5 col-12">
                        <div className="contact-info">
                            <ul>
                                <li><Link to="/home2"><i className="ti-facebook"></i></Link></li>
                                <li><Link to="/home2"><i className="ti-twitter-alt"></i></Link></li>
                                <li><Link to="/home2"><i className="ti-instagram"></i></Link></li>
                                <li><Link to="/home2"><i className="ti-google"></i></Link></li>
                                <li><Link className="theme-btn-s2" to="/donate">Make Donation </Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeaderTopbar2;