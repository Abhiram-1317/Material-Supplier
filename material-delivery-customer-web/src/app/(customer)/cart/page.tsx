"use client";

import {useRouter} from "next/navigation";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {useCart} from "@/context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const {items, subtotal, updateQuantity, removeItem} = useCart();

  const handleQtyChange = (productId: string, value: number) => {
    updateQuantity(productId, value);
  };

  if (items.length === 0) {
    return (
      <Paper sx={{p: 3}}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Cart
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Your cart is empty.
        </Typography>
        <Button variant="contained" onClick={() => router.push("/browse")}>
          Browse materials
        </Button>
      </Paper>
    );
  }

  return (
    <Box display="grid" gap={2}>
      <Paper sx={{p: 2}}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Cart
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell align="right">Unit price</TableCell>
                <TableCell align="center">Qty</TableCell>
                <TableCell align="right">Line total</TableCell>
                <TableCell align="center">Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const unit = Number(item.product.basePrice);
                const line = unit * item.quantity;
                return (
                  <TableRow key={item.product.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{item.product.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.product.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.product.supplier.companyName}</TableCell>
                    <TableCell align="right">₹{unit.toFixed(2)}</TableCell>
                    <TableCell align="center" width={140}>
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => handleQtyChange(item.product.id, Number(e.target.value))}
                        inputProps={{min: 0}}
                      />
                    </TableCell>
                    <TableCell align="right">₹{line.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton aria-label="Remove" onClick={() => removeItem(item.product.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{p: 2, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <Typography variant="subtitle1" fontWeight={700}>
          Subtotal: ₹{subtotal.toFixed(2)}
        </Typography>
        <Button variant="contained" onClick={() => router.push("/checkout")}>Proceed to checkout</Button>
      </Paper>
    </Box>
  );
}
