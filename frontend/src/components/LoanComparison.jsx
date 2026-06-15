import React from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip } from '@mui/material';
import { X, Check } from 'lucide-react';

const LoanComparison = ({ selectedLoans, onRemove, onClose }) => {
    if (!selectedLoans || selectedLoans.length === 0) return null;

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, position: 'relative', maxWidth: '100%', overflowX: 'auto' }}>
            <IconButton
                onClick={onClose}
                sx={{ position: 'absolute', right: 16, top: 16 }}
            >
                <X size={24} />
            </IconButton>

            <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mb: 4 }}>
                Loan Comparison
            </Typography>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Feature</TableCell>
                            {selectedLoans.map(loan => (
                                <TableCell key={loan._id} align="center" sx={{ minWidth: 200 }}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Typography variant="h6" color="primary">{loan.name.en}</Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => onRemove(loan._id)}
                                            sx={{ position: 'absolute', top: -10, right: -10 }}
                                        >
                                            <X size={16} />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell component="th" scope="row">Interest Rate</TableCell>
                            {selectedLoans.map(loan => (
                                <TableCell key={loan._id} align="center">
                                    <Typography fontWeight="bold" color="success.main">
                                        {loan.interestRate}%
                                    </Typography>
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Max Amount</TableCell>
                            {selectedLoans.map(loan => (
                                <TableCell key={loan._id} align="center">
                                    ₹{loan.maxAmount.toLocaleString()}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Tenure</TableCell>
                            {selectedLoans.map(loan => (
                                <TableCell key={loan._id} align="center">
                                    {loan.tenure} Months
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Processing Fee</TableCell>
                            {selectedLoans.map(loan => (
                                <TableCell key={loan._id} align="center">
                                    {loan.processingFee}%
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Type</TableCell>
                            {selectedLoans.map(loan => (
                                <TableCell key={loan._id} align="center">
                                    <Chip label={loan.type} size="small" variant="outlined" />
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default LoanComparison;
