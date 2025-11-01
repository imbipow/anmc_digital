import React from 'react';
import { Admin, Resource } from 'react-admin';
import {
    HomeOutlined,
    CountertopsOutlined,
    ArticleOutlined,
    EventOutlined,
    WorkOutlined,
    BusinessOutlined,
    InfoOutlined,
    ContactsOutlined,
    HelpOutlineOutlined,
    VolunteerActivismOutlined,
    PeopleOutlined
} from '@mui/icons-material';
import { Box } from '@mui/material';

import BlogList from './BlogList';
import BlogEdit from './BlogEdit';
import BlogCreate from './BlogCreate';
import CounterList from './CounterList';
import CounterEdit from './CounterEdit';
import CounterCreate from './CounterCreate';
import HomepageList from './HomepageList';
import HomepageEdit from './HomepageEdit';
import AboutUsEdit from './AboutUsEdit';
import NewsEdit from './NewsEdit';
import EventList from './EventList';
import EventEdit from './EventEdit';
import FaqList from './FaqList';
import FaqEdit from './FaqEdit';
import FaqCreate from './FaqCreate';
import DonationList from './DonationList';
import DonationShow from './DonationShow';
import DonationEdit from './DonationEdit';
import { MemberList } from './MemberList';
import { MemberShow } from './MemberShow';
import { MemberEdit } from './MemberEdit';
import StandaloneAdminLayout from './StandaloneAdminLayout';
import dataProvider from './dataProvider';
import './standaloneAdminStyle.css';

const AdminPanel = () => {
    return (
        <Box className="admin-panel-wrapper">
            <Admin dataProvider={dataProvider} layout={StandaloneAdminLayout}>
                <Resource
                    name="homepage"
                    list={HomepageList}
                    edit={HomepageEdit}
                    icon={HomeOutlined}
                    options={{ label: 'Homepage' }}
                />
                <Resource
                    name="counters"
                    list={CounterList}
                    edit={CounterEdit}
                    create={CounterCreate}
                    icon={CountertopsOutlined}
                    options={{ label: 'Statistics' }}
                />
                <Resource
                    name="news"
                    list={BlogList}
                    edit={NewsEdit}
                    create={BlogCreate}
                    icon={ArticleOutlined}
                    options={{ label: 'News & Updates' }}
                />
                <Resource
                    name="events"
                    list={EventList}
                    edit={EventEdit}
                    create={BlogCreate}
                    icon={EventOutlined}
                    options={{ label: 'Events' }}
                />
                <Resource
                    name="projects"
                    list={BlogList}
                    edit={BlogEdit}
                    create={BlogCreate}
                    icon={WorkOutlined}
                    options={{ label: 'Projects' }}
                />
                <Resource
                    name="facilities"
                    list={BlogList}
                    edit={BlogEdit}
                    create={BlogCreate}
                    icon={BusinessOutlined}
                    options={{ label: 'Facilities' }}
                />
                <Resource
                    name="about_us"
                    list={HomepageList}
                    edit={AboutUsEdit}
                    icon={InfoOutlined}
                    options={{ label: 'About Us' }}
                />
                <Resource
                    name="contact"
                    list={HomepageList}
                    edit={HomepageEdit}
                    icon={ContactsOutlined}
                    options={{ label: 'Contact Info' }}
                />
                <Resource
                    name="faqs"
                    list={FaqList}
                    edit={FaqEdit}
                    create={FaqCreate}
                    icon={HelpOutlineOutlined}
                    options={{ label: 'FAQs' }}
                />
                <Resource
                    name="donations"
                    list={DonationList}
                    show={DonationShow}
                    edit={DonationEdit}
                    icon={VolunteerActivismOutlined}
                    options={{ label: 'Donations' }}
                />
                <Resource
                    name="members"
                    list={MemberList}
                    show={MemberShow}
                    edit={MemberEdit}
                    icon={PeopleOutlined}
                    options={{ label: 'Members' }}
                />
            </Admin>
        </Box>
    );
};

export default AdminPanel;