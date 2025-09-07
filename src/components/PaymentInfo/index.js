import React, { Component } from 'react'
import './style.css'

class PaymentInfo extends Component {


    state = {
        name: '',
        email: '',
        phone: '',
        adress: '',
        card: '',
        expire: '',
        cvc: '',
        amount: '',
        error: {}
    }


    changeHandler = (e) => {
        const error = this.state.error;
        error[e.target.name] = ''

        this.setState({
            [e.target.name]: e.target.value,
            error
        })
    }

    subimtHandler = (e) => {
        e.preventDefault();

        const { name,
            email,
            phone,
            adress,
            card,
            expire, 
            cvc, 
            amount, 
            error } = this.state;

        if (name === '') {
            error.name = "Please enter your name";
        }
        if (email === '') {
            error.email = "Please enter your email";
        }
        if (phone === '') {
            error.phone = "Please enter your phone";
        }
        if (adress === '') {
            error.adress = "Please enter your adress";
        }
        if (card === '') {
            error.card = "Select your event Card Number";
        }
        if (expire === '') {
            error.expire = "Please enter your Expire date";
        }
        if (cvc === '') {
            error.cvc = "Please enter your cvc";
        }
        if (amount === '') {
            error.amount = "Please enter your amount";
        }


        if (error) {
            this.setState({
                error
            })
        }
        if (error.name === '' && error.email === '' && error.email === '' && error.adress === '' && error.phone === '' && error.card === '' && error.expire === '' && error.cvc === '' && error.amount === '') {
            this.setState({
                name: '',
                email: '',
                phone: '',
                card: '',
                expire: '',
                adress: '',
                cvc: '',
                amount: '',
                error: {}
            })
        }
    }

    render() {
        const { name,
            email,
            phone,
            adress,
            card,
            expire,
            cvc,
            amount,
            error } = this.state;

        return (
            <div className="payment-section section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="payment-text">
                                <span>Donate Now</span>
                                <h2>Donate Some Money & Save The Muslim Ummah.</h2>
                                <p>How can we reject the faith in Allah? seeing that ye were without life, and He gave you life; then will He cause you to die, and will again bring you to life; and again to Him will ye return.</p>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="wpo-donations-form">
                                <h2>Payment Information</h2>
                                <form onSubmit={this.subimtHandler}>
                                    <div className="row">
                                        <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                            <input value={name} onChange={this.changeHandler} type="text" name="name" placeholder="Name"/>
                                            <p>{error.name ? error.name : ''}</p>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group clearfix">
                                            <input onChange={this.changeHandler} value={email} type="email" name="email" placeholder="Email"/>
                                            <p>{error.email ? error.email : ''}</p>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                            <input onChange={this.changeHandler} value={phone} type="text" name="phone" placeholder="Phone"/>
                                            <p>{error.phone ? error.phone : ''}</p>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group clearfix">
                                            <input onChange={this.changeHandler} value={adress} type="text" name="adress" placeholder="Adress"/>
                                            <p>{error.adress ? error.adress : ''}</p>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                            <input onChange={this.changeHandler} value={card} type="text" name="card" placeholder="card"/>
                                            <p>{error.card ? error.card : ''}</p>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                            <input onChange={this.changeHandler} value={expire} type="text" name="expire" placeholder="Expire"/>
                                            <p>{error.expire ? error.expire : ''}</p>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                            <input onChange={this.changeHandler} value={cvc} type="text" name="cvc" placeholder="CVC"/>
                                            <p>{error.cvc ? error.cvc : ''}</p>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                            <input onChange={this.changeHandler} value={amount} type="text" name="amount" placeholder="Amount"/>
                                            <p>{error.amount ? error.amount : ''}</p>
                                        </div>
                                        <div className="col-lg-12 col-12 form-group">
                                            <button className="theme-btn" type="submit">Donate Now</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        )
    }

}
export default PaymentInfo;