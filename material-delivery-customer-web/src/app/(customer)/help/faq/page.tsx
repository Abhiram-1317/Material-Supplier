"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const FAQ_ITEMS = [
  {
    question: "How do I return?",
    answer:
      "Initiate a return from your Orders page, choose the item, and follow the pickup instructions. A courier will be scheduled after confirmation.",
  },
  {
    question: "Payment methods?",
    answer:
      "We currently support credit/debit cards, UPI, and net banking. Cash on delivery is available for select pin codes.",
  },
  {
    question: "Delivery time?",
    answer:
      "Most orders are delivered within 2-5 business days depending on your location and product availability.",
  },
  {
    question: "Can I change my address after ordering?",
    answer:
      "Address changes are supported until the order is dispatched. Contact support with your order ID as soon as possible.",
  },
];

export default function HelpFaqPage() {
  return (
    <Box sx={{maxWidth: 720, mx: "auto"}}>
      <Paper sx={{p: 3, mb: 2}}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Typography color="text.secondary">
          Quick answers to the most common questions.
        </Typography>
      </Paper>

      <Paper>
        <Stack divider={<Divider flexItem />}>
          {FAQ_ITEMS.map((item, idx) => (
            <Accordion key={item.question} disableGutters defaultExpanded={idx === 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{item.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{item.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
