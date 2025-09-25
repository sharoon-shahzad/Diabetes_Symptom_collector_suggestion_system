import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import CMSDashboard from './CMSDashboard';
import CategoryList from '../components/CategoryList';
import ContentList from '../components/ContentList';

const CMSManagement = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      component: <CMSDashboard />
    },
    {
      label: 'Categories',
      icon: <CategoryIcon />,
      component: <CategoryList />
    },
    {
      label: 'Content',
      icon: <ArticleIcon />,
      component: <ContentList />
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ p: 2 }}>
        {tabs[activeTab].component}
      </Box>
    </Box>
  );
};

export default CMSManagement;
