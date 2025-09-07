import React from 'react'
import './style.css'

const Newsletter = (props) => {

    const SubmitHandler = (e) => {
      e.preventDefault()
    }
    return(
        <section className="wpo-news-letter-section">
            <div className="container">
                <div className="wpo-news-letter-wrap">
                    <div className="row">
                        <div className="col col-lg-10 offset-lg-1 col-md-8 offset-md-2">
                            <div className="wpo-newsletter">
                                <h3>Follow us For ferther information</h3>
                                <p>Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas.</p>
                                <div className="wpo-newsletter-form">
                                    <form onSubmit={SubmitHandler}>
                                        <div>
                                            <input type="text" placeholder="Enter Your Email" className="form-control"/>
                                            <button type="submit">Subscribe</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Newsletter;