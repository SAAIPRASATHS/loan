import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Sun, Moon } from 'lucide-react';
import { useAppTheme } from '../contexts/ThemeContext';

const DarkModeSwitcher = () => {
    const { mode, toggleTheme } = useAppTheme();

    return (
        <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
            <IconButton
                onClick={toggleTheme}
                sx={{
                    color: 'primary.main',
                    bgcolor: mode === 'light' ? 'rgba(26, 35, 126, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                    '&:hover': {
                        bgcolor: mode === 'light' ? 'rgba(26, 35, 126, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    },
                    borderRadius: 2,
                    p: 1
                }}
            >
                {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </IconButton>
        </Tooltip>
    );
};

export default DarkModeSwitcher;
