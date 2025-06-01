import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface CardComponentBalanceProps {
    children: React.ReactNode;
}

export default function CardComponentBalance({children}: CardComponentBalanceProps) {
    return (
        <Card sx={{ minWidth: 375 }}>
            <CardContent>
                <Typography variant='body1' component="div">{children}</Typography>
            </CardContent>
        </Card>
    )
}