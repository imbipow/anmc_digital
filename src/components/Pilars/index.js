import React from 'react'
import {Link} from 'react-router-dom'
import './style.css'
import plr1 from '../../images/pilars/img-1.png'
import plr2 from '../../images/pilars/img-2.png'
import plr3 from '../../images/pilars/img-4.png'
import plr4 from '../../images/pilars/img-5.png'
import plr5 from '../../images/pilars/img-6.png'


const Pilars = (props) => {

    const ClickHandler = () =>{
        window.scrollTo(10, 0);
     }

    const Pillars = [

        {
            pillarsImg:plr1,
            pillarsHeading:"Shahadah",
            link:'/service-single'
        },
        {
            pillarsImg:plr2,
            pillarsHeading:"Salah",
            link:'/service-single'
        },
        {
            pillarsImg:plr3,
            pillarsHeading:"Sawm",
            link:'/service-single'
        },
        {
            pillarsImg:plr4,
            pillarsHeading:"Zakah",
            link:'/service-single'
        },
        {
            pillarsImg:plr5,
            pillarsHeading:"Hajj",
            link:'/service-single'
        },

    ]

    return(
        <div className="pilars-area">
            <div className="fluid-container">
                <div className="row-grid">
                    {Pillars.map((pillar, pl) =>(
                        <div className="grid" key={pl}>
                            <div className="pilars-item">
                                <div className="pilarts-img">
                                    <img src={pillar.pillarsImg} alt="" />
                                </div>
                                <div className="pilars-text">
                                    <h2><Link onClick={ClickHandler} to={pillar.link}>{pillar.pillarsHeading}</Link></h2>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Pilars;