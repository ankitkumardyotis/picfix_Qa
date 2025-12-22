import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import diffrenceTime from '@/utils/formateDate/diffrenceTime';

const columns = [
  { id: 'id', label: 'Id', minWidth: 10 },
  { id: 'model', label: 'Model', minWidth: 100 },
  {
    id: 'status',
    label: 'Status',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'createdAt',
    label: 'Time',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'cost',
    label: 'Credit Used',
    minWidth: 100,
    align: 'center',
    format: (value) => {
      if (value === 0) return 'Free';
      if (value === null || value === undefined) return 'Free';
      if (typeof value === 'number') return value.toString();
      return value.toString();
    },
  },
];

export default function MuiTable({ userHistory }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Process userHistory data
  const processUserHistory = (historyData) => {
    if (!historyData || !Array.isArray(historyData)) return [];

    // Sort userHistory by createdAt in descending order
    const sortedUserHistory = [...historyData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return sortedUserHistory.map((item, idx) => {
      const diffrenceInTime = diffrenceTime(item.createdAt);
      let model;
      if (item.model === "tencentarc/gfpgan") {
        model = "Restore Photos";
      } else if (item.model === "allenhooo/lama") {
        model = "Remove Objects";
      } else if (item.model === "home-designer") {
        model = "Home Designer";
      } else if (item.model === "cjwbw/rembg") {
        model = "Background Removal";
      } else if (item.model === "hair-style") {
        model = "Hair Style";
      } else if (item.model === "generate-image") {
        model = "Generate Image";
      } else if (item.model === "combine-image") {
        model = "Combine Image";
      } else if (item.model === "text-removal") {
        model = "Remove Text";
      } else if (item.model === "headshot") {
        model = "Headshot";
      } else if (item.model === "restore-image") {
        model = "Restore Image";
      } else if (item.model === "gfp-restore") {
        model = "Restore Image (Free)";
      } else if (item.model === "edit-image") {
        model = "Edit Image";
      } else if (item.model === "edit-image-nano") {
        model = "Nano Banana Edit";
      } else if (item.model === "upscale-image-crystal") {
        model = "Crystal Upscaler";
      } else if (item.model === "upscale-image-topaz") {
        model = "Topaz Labs Upscaler";
      } else if (item.model === "upscale-image-google") {
        model = "Google Upscaler";
      } else if (item.model === "upscale-image-seedvr2") {
        model = "SeedVR2 Upscaler";
      }
      else {
        model = item.model;
      }
      return { ...item, createdAt: diffrenceInTime, model: model, id: idx + 1, cost: item.cost || 0 };
    });
  };

  const [rows, setRows] = React.useState(() => processUserHistory(userHistory));

  // Update rows when userHistory changes
  React.useEffect(() => {
    setRows(processUserHistory(userHistory));
    // Reset to first page when data changes
    setPage(0);
  }, [userHistory]);

  const handleChangePage = (event, newPage) => {
    const maxPage = Math.max(0, Math.ceil(totalRows / rowsPerPage) - 1);
    setPage(Math.min(newPage, maxPage));
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Calculate pagination values safely
  const totalRows = rows.length;
  const startIndex = page * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);

  return (
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
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : column.format
                              ? column.format(value)
                              : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 15, 25]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) => {
          // Handle edge cases to prevent NaN display
          const safeFrom = isNaN(from) ? 0 : from;
          const safeTo = isNaN(to) ? 0 : to;
          const safeCount = isNaN(count) ? 0 : count;
          return `${safeFrom}-${safeTo} of ${safeCount}`;
        }}
      />
    </Paper>
  );
}
