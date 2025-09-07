import React from 'react'
import icon1 from '../../images/course/icon1.png'
import icon2 from '../../images/course/icon2.png'
import icon3 from '../../images/course/icon3.png'
import icon4 from '../../images/course/icon4.png'
import icon5 from '../../images/course/icon5.png'
import icon6 from '../../images/course/icon6.png'

import './style.css'

const Course = (props) => {

    const courses = [
        {
          cIcon:icon1,
          heading:"Quran Memorization",
          pra:"This course intends to help the students memorize Holy Quran. Students who wish to memorize a part or all the Quran.",
        },
        {
          cIcon:icon2,
          heading:"Junior Preschool",
          pra:"This course intends to help the students memorize Holy Quran. Students who wish to memorize a part or all the Quran.",
        },
        {
          cIcon:icon3,
          heading:"Junior High School",
          pra:"This course intends to help the students memorize Holy Quran. Students who wish to memorize a part or all the Quran.",
        },
        {
          cIcon:icon4,
          heading:"Islamic Education",
          pra:"This course intends to help the students memorize Holy Quran. Students who wish to memorize a part or all the Quran.",
        },
        {
          cIcon:icon5,
          heading:"Arabic Language",
          pra:"This course intends to help the students memorize Holy Quran. Students who wish to memorize a part or all the Quran.",
        },
        {
          cIcon:icon6,
          heading:"Learning Technologies",
          pra:"This course intends to help the students memorize Holy Quran. Students who wish to memorize a part or all the Quran.",
        },
    ]
    return(
        <div className="courses-area">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="wpo-section-title">
                            <span>Top Courses</span>
                            <h2>Our Populer Courses</h2>
                        </div>
                    </div>
                </div>
                <div className="row">
                    {courses.map((cource, i) => (
                        <div className="col-lg-4 col-md-6 custom-grid col-12" key={i}>
                            <div className="courses-item">
                                <div className="course-icon">
                                    <span><img src={cource.cIcon} alt="" /></span>
                                </div>
                                <div className="course-text">
                                    <h2>{cource.heading}</h2>
                                    <p>{cource.pra}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Course;