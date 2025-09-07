import React from 'react';
import { Admin, Resource } from 'react-admin';
import dataProvider from './dataProvider';
import { HomepageContentList, HomepageContentEdit } from './HomepageContentAdmin';
import { BlogPostsList, BlogPostsEdit, BlogPostsCreate } from './BlogPostsAdmin';
import { NewsList, NewsEdit, NewsCreate } from './NewsAdmin';
import { EventsList, EventsEdit, EventsCreate } from './EventsAdmin';
import { ProjectsList, ProjectsEdit, ProjectsCreate } from './ProjectsAdmin';
import { AboutUsList, AboutUsEdit } from './AboutUsAdmin';
import { FacilitiesList, FacilitiesEdit, FacilitiesCreate } from './FacilitiesAdmin';
import { ContactList, ContactEdit } from './ContactAdmin';

const AdminApp = () => (
    <Admin dataProvider={dataProvider} title="ANMC Content Management">
        {/* Unified Homepage Content Management */}
        <Resource 
            name="homepage_content" 
            list={HomepageContentList} 
            edit={HomepageContentEdit}
            recordRepresentation={(record) => `${record.component || record.type} - ${record.data?.title || record.data?.label || record.id}`}
            options={{ label: 'Homepage Content' }}
        />
        
        
        {/* Content Types */}
        <Resource 
            name="news" 
            list={NewsList} 
            edit={NewsEdit}
            create={NewsCreate}
            recordRepresentation="title"
            options={{ label: 'News Articles' }}
        />
        <Resource 
            name="events" 
            list={EventsList} 
            edit={EventsEdit}
            create={EventsCreate}
            recordRepresentation="title"
            options={{ label: 'Events' }}
        />
        <Resource 
            name="projects" 
            list={ProjectsList} 
            edit={ProjectsEdit}
            create={ProjectsCreate}
            recordRepresentation="title"
            options={{ label: 'Projects' }}
        />
        
        {/* Page Content */}
        <Resource 
            name="about_us" 
            list={AboutUsList} 
            edit={AboutUsEdit}
            recordRepresentation="title"
            options={{ label: 'About Us' }}
        />
        <Resource 
            name="facilities" 
            list={FacilitiesList} 
            edit={FacilitiesEdit}
            create={FacilitiesCreate}
            recordRepresentation="name"
            options={{ label: 'Facilities' }}
        />
        <Resource 
            name="contact" 
            list={ContactList} 
            edit={ContactEdit}
            recordRepresentation="email"
            options={{ label: 'Contact Info' }}
        />
        
        {/* Blog Posts */}
        <Resource 
            name="blog_posts" 
            list={BlogPostsList} 
            edit={BlogPostsEdit}
            create={BlogPostsCreate}
            recordRepresentation="title"
            options={{ label: 'Blog Posts' }}
        />
    </Admin>
);

export default AdminApp;