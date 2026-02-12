import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Slider, Stack, Grid, Divider } from '@mui/material';
import { Calculator, PieChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EMICalculator = () => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState(500000);
    const [rate, setRate] = useState(10.5);
    const [tenure, setTenure] = useState(24);
    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        calculateEMI();
    }, [amount, rate, tenure]);

    const calculateEMI = () => {
        const r = rate / 12 / 100;
        const n = tenure;
        const p = amount;

        const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayable = emiValue * n;
        const interest = totalPayable - p;

        setEmi(Math.round(emiValue));
        setTotalAmount(Math.round(totalPayable));
        setTotalInterest(Math.round(interest));
    };

    // Simple Pie Chart visualization using CSS conic-gradient
    const interestPercentage = (totalInterest / totalAmount) * 100;

    return (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Calculator color="#1a237e" />
                <Typography variant="h6" fontWeight="700">{t('emi_calc.title')}</Typography>
            </Stack>

            <Box sx={{ mb: 4 }}>
                <Typography gutterBottom>{t('emi_calc.loan_amount')}: ₹{amount.toLocaleString()}</Typography>
                <Slider
                    value={amount}
                    min={10000}
                    max={5000000}
                    step={10000}
                    onChange={(_, val) => setAmount(val)}
                    valueLabelDisplay="auto"
                />
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography gutterBottom>{t('emi_calc.interest_rate')}: {rate}%</Typography>
                <Slider
                    value={rate}
                    min={5}
                    max={25}
                    step={0.1}
                    onChange={(_, val) => setRate(val)}
                    valueLabelDisplay="auto"
                />
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography gutterBottom>{t('emi_calc.tenure')}: {tenure} {t('emi_calc.months')}</Typography>
                <Slider
                    value={tenure}
                    min={6}
                    max={120}
                    step={6}
                    onChange={(_, val) => setTenure(val)}
                    valueLabelDisplay="auto"
                />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: `conic-gradient(#ff9800 ${interestPercentage}%, #4caf50 0)`
                        }} />
                        <Box sx={{
                            position: 'absolute',
                            top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            bgcolor: 'white',
                            width: 80, height: 80,
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <PieChart size={24} color="#666" />
                        </Box>
                    </Box>
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ w: 10, h: 10, bgcolor: '#4caf50', borderRadius: '50%', mr: 0.5 }} />
                            <Typography variant="caption">{t('emi_calc.principal')}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ w: 10, h: 10, bgcolor: '#ff9800', borderRadius: '50%', mr: 0.5 }} />
                            <Typography variant="caption">{t('emi_calc.interest')}</Typography>
                        </Box>
                    </Stack>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">{t('emi_calc.monthly_emi')}</Typography>
                        <Typography variant="h5" fontWeight="800" color="primary">₹{emi.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">{t('emi_calc.total_interest')}</Typography>
                        <Typography variant="h6" fontWeight="600" color="warning.main">₹{totalInterest.toLocaleString()}</Typography>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default EMICalculator;
