import React, {Fragment} from 'react';
import Header from '../../components/header'
import Volunteer from '../../components/Volunteer'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'


const VolunteerPage =() => {
    return(
        <Fragment>
            <Header/>
            <Volunteer/>
            <Footer/>
            <Scrollbar/>
        </Fragment>
    )
};
export default VolunteerPage;
