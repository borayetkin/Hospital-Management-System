import React from "react";
import { Box, Container, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: "primary.main",
        color: "white",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          © {new Date().getFullYear()} MediSync - Hospital Appointment
          Management System
        </Typography>
        <Typography variant="body2" align="center">
          <Link color="inherit" href="#" underline="hover" sx={{ mx: 1 }}>
            About
          </Link>
          <Link color="inherit" href="#" underline="hover" sx={{ mx: 1 }}>
            Privacy
          </Link>
          <Link color="inherit" href="#" underline="hover" sx={{ mx: 1 }}>
            Terms
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
