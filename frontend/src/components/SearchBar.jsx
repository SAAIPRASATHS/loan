import React, { useState } from 'react';
import { Box, TextField, InputAdornment, Paper, List, ListItem, ListItemText, Typography } from '@mui/material';
import { Search } from 'lucide-react';

const SearchBar = ({ loans, onLoanSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredLoans = searchTerm
        ? loans.filter(loan =>
            loan.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.loanType.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setShowSuggestions(e.target.value.length > 0);
    };

    const handleSelectLoan = (loan) => {
        setSearchTerm('');
        setShowSuggestions(false);
        if (onLoanSelect) onLoanSelect(loan);
    };

    return (
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
            <TextField
                fullWidth
                placeholder="Search for loans (e.g., home loan, education loan)"
                value={searchTerm}
                onChange={handleSearch}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => searchTerm && setShowSuggestions(true)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search size={20} />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#e0e0e0',
                            borderWidth: 2,
                        },
                        '&:hover fieldset': {
                            borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                        },
                    },
                }}
            />

            {showSuggestions && filteredLoans.length > 0 && (
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        mt: 1,
                        maxHeight: 300,
                        overflow: 'auto',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                >
                    <List>
                        {filteredLoans.map((loan) => (
                            <ListItem
                                key={loan._id}
                                button
                                onClick={() => handleSelectLoan(loan)}
                                sx={{
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                        color: 'white',
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={loan.name.en}
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            {loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)} •
                                            {typeof loan.interestRate === 'object'
                                                ? ` ${loan.interestRate.min}% - ${loan.interestRate.max}%`
                                                : ` ${loan.interestRate}%`
                                            }
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );
};

export default SearchBar;
