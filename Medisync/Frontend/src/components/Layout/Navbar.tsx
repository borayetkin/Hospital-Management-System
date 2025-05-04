import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/login");
  };

  const getNavLinks = () => {
    if (!user) return null;

    if (user.role === "patient") {
      return (
        <>
          <Button color="inherit" component={RouterLink} to="/doctors">
            Find Doctors
          </Button>
          <Button color="inherit" component={RouterLink} to="/appointments">
            My Appointments
          </Button>
        </>
      );
    }

    if (user.role === "doctor") {
      return (
        <>
          <Button color="inherit" component={RouterLink} to="/schedule">
            My Schedule
          </Button>
          <Button color="inherit" component={RouterLink} to="/patients">
            My Patients
          </Button>
          <Button color="inherit" component={RouterLink} to="/resources">
            Medical Resources
          </Button>
        </>
      );
    }

    if (user.role === "admin") {
      return (
        <>
          <Button color="inherit" component={RouterLink} to="/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/reports">
            Reports
          </Button>
          <Button color="inherit" component={RouterLink} to="/manage">
            Manage System
          </Button>
        </>
      );
    }
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <LocalHospitalIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          MediSync
        </Typography>

        <Box sx={{ display: { xs: "none", md: "flex" } }}>{getNavLinks()}</Box>

        {isAuthenticated ? (
          <Box sx={{ ml: 2 }}>
            <IconButton
              onClick={handleMenu}
              color="inherit"
              size="large"
              edge="end"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
                {user?.name.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                component={RouterLink}
                to="/profile"
                onClick={handleClose}
              >
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
              startIcon={<AccountCircleIcon />}
            >
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
