import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
    Box,
    Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Slide,
    Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow,
    Tooltip
} from '@mui/material';
import PaymentSuccessComponent from './PaymentSuccessComponent';

const columns = [
    { id: 'id', label: 'S No.', minWidth: 10 },
    { id: 'transactionId', label: 'Transaction Id', minWidth: 10 },
    { id: 'amount', label: 'Amount', minWidth: 100, align: 'center', format: (value) => value.toLocaleString('en-US') },
    { id: 'creditPoints', label: 'Credits', minWidth: 100, align: 'center', format: (value) => value.toLocaleString('en-US') },
    { id: 'createdAt', label: 'Date', minWidth: 100, align: 'center', format: (value) => value.toLocaleString('en-US') },
    { id: 'planName', label: 'Plan Name', minWidth: 100, align: 'center', format: (value) => value.toLocaleString('en-US') },
    { id: 'paymentStatus', label: 'Status', minWidth: 100, align: 'center', format: (value) => value.toLocaleString('en-US') },
];

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function TransactionsHistory() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [open, setOpen] = useState(false);
    const [paymentHistoryList, setPaymentHistoryList] = useState([]);
    const [selectedRowData, setSelectedRowData] = useState({});
    const { data: session } = useSession();
    const router = useRouter();

    async function paymentHistory() {
        const response = await fetch(`/api/dataFetchingDB/fetchPaymentHistory?userId=${session.user.id}`);
        const { data } = await response.json();
        setPaymentHistoryList(data);
    }

    useEffect(() => {
        if (session?.user.id) {
            paymentHistory();
        }
    }, [session]);

    const sortedUserHistory = [...paymentHistoryList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const newDataAfterDateFormat = sortedUserHistory.map((item, idx) => {
        const date = new Date(item.createdAt).toString().substring(0, 15);
        const status = item.paymentStatus === 'captured' ? "Success" : item.paymentStatus;
        return { ...item, createdAt: date, id: idx + 1, paymentStatus: status };
    });

    const rows = newDataAfterDateFormat;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleClickOpen = (row) => {
        setSelectedRowData(row);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    return (
        <div style={{ flex: 5, backgroundColor: 'white' }}>
            <div style={{ textAlign: 'start', margin: "3em", marginBottom: '2em' }}>
                <p style={{ fontSize: '1.7em', fontWeight: '600', textAlign: 'center' }}>Payment History</p>
            </div>
            {rows.length > 0 ? (
                <div className='creditUsageContainer' style={{ borderRadius: '5px', marginInline: 'auto', width: '95%' }}>
                    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none' }}>
                        <TableContainer sx={{ maxHeight: 440 }}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>

                                    <TableRow>
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}
                                                style={{ minWidth: column.minWidth }}
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row) => (
                                            <TableRow
                                                hover
                                                sx={{
                                                    '&:hover': {
                                                        cursor: 'pointer'
                                                    }
                                                }}
                                                role="checkbox"
                                                tabIndex={-1}
                                                key={row.id}
                                                onClick={() => handleClickOpen(row)}
                                            >

                                                {columns.map((column) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <TableCell key={column.id} align={column.align}>
                                                            <Tooltip title="Click to View">
                                                                {column.format && typeof value === 'number'
                                                                    ? column.id === 'amount' ? `$ ${column.format(value)}` : column.format(value)
                                                                    : value}
                                                            </Tooltip>
                                                        </TableCell>
                                                    );
                                                })}

                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 15, 25]}
                            component="div"
                            count={rows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                </div>
            ) : (
                <div style={{ textAlign: 'center', margin: "3em", marginBottom: '2em' }}>
                    <p style={{ fontSize: '1.7em', fontWeight: '600', color: "gray", textAlign: 'center' }}>No transactions found</p>
                </div>
            )}
            <Dialog
                fullScreen
                maxHeight='70vh'
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <Box display='flex' justifyContent='center'>
                    <DialogTitle sx={{ fontWeight: '600', fontSize: '1.8em' }}>Payment History</DialogTitle>
                </Box>
                <DialogContent>
                    <PaymentSuccessComponent
                        status={selectedRowData.paymentStatus}
                        amount={selectedRowData.amount}
                        transactionId={selectedRowData.transactionId}
                        creditPoints={selectedRowData.creditPoints}
                        currency={selectedRowData.currency}
                        date={selectedRowData.createdAt}
                        planName={selectedRowData.planName}

                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{
                            backgroundColor: 'black',
                            color: 'white',
                            '&:hover': {
                                opacity: 0.8,
                                backgroundColor: 'black',
                            },
                        }}
                        onClick={handleClose}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default TransactionsHistory;
