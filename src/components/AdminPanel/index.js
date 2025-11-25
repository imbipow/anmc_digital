import React, { useState, useEffect } from 'react';
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
    PeopleOutlined,
    RoomServiceOutlined,
    PermMediaOutlined,
    DescriptionOutlined,
    InboxOutlined,
    SendOutlined,
    SlideshowOutlined,
    EmojiEventsOutlined
} from '@mui/icons-material';
import { Box } from '@mui/material';
import cognitoAuthService from '../../services/cognitoAuth';

import BlogList from './BlogList';
import BlogEdit from './BlogEdit';
import BlogCreate from './BlogCreate';
import CounterList from './CounterList';
import CounterEdit from './CounterEdit';
import CounterCreate from './CounterCreate';
import HomepageList from './HomepageList';
import HomepageEdit from './HomepageEdit';
import ContactEdit from './ContactEdit';
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
import UserManagementList from './UserManagementResource';
import ServiceList from './ServiceList';
import ServiceEdit from './ServiceEdit';
import ServiceCreate from './ServiceCreate';
import BookingList from './BookingList';
import BookingShow from './BookingShow';
import BookingEdit from './BookingEdit';
import MediaList from './MediaList';
import DocumentList from './DocumentList';
import MessageInbox from './MessageInbox';
import BroadcastMessages from './BroadcastMessages';
import HeroSlidesList from './HeroSlidesList';
import HeroSlideEdit from './HeroSlideEdit';
import HeroSlideCreate from './HeroSlideCreate';
import AchievementsList from './AchievementsList';
import AchievementsEdit from './AchievementsEdit';
import AchievementsCreate from './AchievementsCreate';
import { ManageAccountsOutlined, BookOnlineOutlined } from '@mui/icons-material';
import StandaloneAdminLayout from './StandaloneAdminLayout';
import dataProvider from './dataProvider';
import Dashboard from './Dashboard';
import './standaloneAdminStyle.css';

const AdminPanel = () => {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const getUserRole = async () => {
            try {
                const user = await cognitoAuthService.getCurrentUser();
                const groups = user.groups || [];

                if (groups.includes('AnmcAdmins')) {
                    setUserRole('admin');
                } else if (groups.includes('AnmcManagers')) {
                    setUserRole('manager');
                }
            } catch (error) {
                console.error('Error getting user role:', error);
                setUserRole('manager'); // Default to manager (more restrictive)
            }
        };

        getUserRole();
    }, []);

    // Show loading while determining role
    if (!userRole) {
        return <Box className="admin-panel-wrapper"><div>Loading...</div></Box>;
    }

    const isAdmin = userRole === 'admin';

    console.log('AdminPanel - User Role:', userRole, 'Is Admin:', isAdmin);

    return (
        <Box className="admin-panel-wrapper">
            <Admin dataProvider={dataProvider} layout={StandaloneAdminLayout} dashboard={Dashboard}>
                {/* Admin-only resources */}
                {isAdmin && (
                    <>
                        <Resource
                            name="hero-slides"
                            list={HeroSlidesList}
                            edit={HeroSlideEdit}
                            create={HeroSlideCreate}
                            icon={SlideshowOutlined}
                            options={{ label: 'Hero Slider' }}
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
                            name="about_us"
                            list={HomepageList}
                            edit={AboutUsEdit}
                            icon={InfoOutlined}
                            options={{ label: 'About Us' }}
                        />
                        <Resource
                            name="contact"
                            list={HomepageList}
                            edit={ContactEdit}
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
                            name="achievements"
                            list={AchievementsList}
                            edit={AchievementsEdit}
                            create={AchievementsCreate}
                            icon={EmojiEventsOutlined}
                            options={{ label: 'Project Achievements' }}
                        />
                        <Resource
                            name="user-management"
                            list={UserManagementList}
                            icon={ManageAccountsOutlined}
                            options={{ label: 'User Management' }}
                        />
                        <Resource
                            name="services"
                            list={ServiceList}
                            edit={ServiceEdit}
                            create={ServiceCreate}
                            icon={RoomServiceOutlined}
                            options={{ label: 'Services / Anusthan' }}
                        />
                        <Resource
                            name="media"
                            list={MediaList}
                            icon={PermMediaOutlined}
                            options={{ label: 'Media Library' }}
                        />
                        <Resource
                            name="documents"
                            list={DocumentList}
                            icon={DescriptionOutlined}
                            options={{ label: 'Documents' }}
                        />
                        <Resource
                            name="inbox"
                            list={MessageInbox}
                            icon={InboxOutlined}
                            options={{ label: 'Contact Messages' }}
                        />
                        <Resource
                            name="broadcast"
                            list={BroadcastMessages}
                            icon={SendOutlined}
                            options={{ label: 'Send Messages' }}
                        />
                    </>
                )}

                {/* Shared resources (Admin + Manager) */}
                <Resource
                    name="donations"
                    list={DonationList}
                    show={DonationShow}
                    edit={isAdmin ? DonationEdit : null}
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

                {/* Bookings - Admin and Manager can view/edit */}
                <Resource
                    name="bookings"
                    list={BookingList}
                    show={BookingShow}
                    edit={BookingEdit}
                    icon={BookOnlineOutlined}
                    options={{ label: 'Bookings' }}
                />
            </Admin>
        </Box>
    );
};

export default AdminPanel;