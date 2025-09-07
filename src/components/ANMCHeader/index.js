import React from 'react';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";

import logo from '../../images/logo.png';
import './style.css';

const ANMCHeader = () => {
    return (
        <AppBar position="static" className="anmc-header" sx={{ backgroundColor: '#1e3c72', mb: 2 }}>
            <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center', minHeight: '80px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img src={logo} alt="ANMC Logo" className="header-logo" />
                    <Box className="header-text" sx={{ ml: 2 }}>
                        <Typography variant="h5" component="div" sx={{ color: 'white', fontWeight: 600, lineHeight: 1.2 }}>
                            Australian Nepalese Multicultural Centre
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 500, opacity: 0.9 }}>
                            (ANMC)
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                            Member Portal
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button 
                        component={Link} 
                        to="/member-portal"
                        variant="outlined"
                        sx={{ 
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.3)',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderColor: 'rgba(255,255,255,0.5)'
                            }
                        }}
                    >
                        🏠 Portal
                    </Button>
                    <Button 
                        component={Link} 
                        to="/login"
                        variant="outlined"
                        sx={{ 
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.3)',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderColor: 'rgba(255,255,255,0.5)'
                            }
                        }}
                    >
                        🚪 Logout
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default ANMCHeader;