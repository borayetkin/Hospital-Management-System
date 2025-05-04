import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 8,
          mb: 6,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="md">
          <Typography component="h1" variant="h2" align="center" gutterBottom>
            MediSync
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            Simplifying Hospital Appointments and Resource Management
          </Typography>
          <Box
            sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}
          >
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              color="secondary"
              size="large"
            >
              Sign In
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              sx={{ color: "white", borderColor: "white" }}
              size="large"
            >
              Register
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 8 }}>
          <Typography component="h2" variant="h4" align="center" gutterBottom>
            Key Features
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            paragraph
          >
            Discover how MediSync can transform your healthcare experience
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Grid container spacing={4}>
              {features.map((feature) => (
                <Grid item key={feature.title} xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        boxShadow: 6,
                        transform: "translateY(-5px)",
                        transition: "all 0.3s",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        justifyContent: "center",
                        color: "primary.main",
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="h3"
                        align="center"
                      >
                        {feature.title}
                      </Typography>
                      <Typography align="center">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Call to Action */}
        <Box
          sx={{
            bgcolor: "secondary.light",
            p: 6,
            borderRadius: 2,
            mb: 6,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Ready to get started with MediSync?
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ maxWidth: "600px", mx: "auto" }}
          >
            Join our platform today and experience seamless healthcare
            management.
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            color="primary"
            size="large"
          >
            Create an Account
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

const features = [
  {
    title: "Find the Right Doctor",
    description:
      "Search and filter doctors based on specialization, ratings, and availability to find the perfect match for your healthcare needs.",
    icon: <LocalHospitalIcon fontSize="large" />,
  },
  {
    title: "Easy Appointment Booking",
    description:
      "Book appointments with just a few clicks. View available time slots and confirm your booking instantly.",
    icon: <CalendarMonthIcon fontSize="large" />,
  },
  {
    title: "Medical Resource Management",
    description:
      "Doctors can request and manage medical resources efficiently to ensure the best care for patients.",
    icon: <MedicalServicesIcon fontSize="large" />,
  },
];

export default Home;
