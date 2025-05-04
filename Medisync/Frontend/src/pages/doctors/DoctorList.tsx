import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Avatar,
  Chip,
  Rating,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Grid as MuiGrid,
  Button,
  CircularProgress,
} from "@mui/material";
import { doctors } from "../../services/api";

interface Doctor {
  employeeID: number;
  name: string;
  specialization: string;
  doctorLocation: string;
  deptName: string;
  rating?: number;
}

const DoctorList = () => {
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [department, setDepartment] = useState("");

  // Derived values for filter dropdowns
  const specializations = Array.from(
    new Set(doctorList.map((doctor) => doctor.specialization))
  );

  const departments = Array.from(
    new Set(doctorList.map((doctor) => doctor.deptName))
  );

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await doctors.getAllDoctors();
        setDoctorList(response.data);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSpecializationChange = (event: SelectChangeEvent) => {
    setSpecialization(event.target.value);
  };

  const handleDepartmentChange = (event: SelectChangeEvent) => {
    setDepartment(event.target.value);
  };

  // Filter doctors based on search and filter criteria
  const filteredDoctors = doctorList.filter((doctor) => {
    const matchesSearch = doctor.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSpecialization = specialization
      ? doctor.specialization === specialization
      : true;
    const matchesDepartment = department
      ? doctor.deptName === department
      : true;

    return matchesSearch && matchesSpecialization && matchesDepartment;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSpecialization("");
    setDepartment("");
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Find a Doctor
      </Typography>

      {/* Filter section */}
      <Box sx={{ mb: 4, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filter Options
        </Typography>

        <MuiGrid container spacing={2}>
          <MuiGrid item xs={12} sm={6} md={4}>
            <TextField
              label="Search by name"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Enter doctor name"
            />
          </MuiGrid>

          <MuiGrid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="specialization-label">Specialization</InputLabel>
              <Select
                labelId="specialization-label"
                value={specialization}
                label="Specialization"
                onChange={handleSpecializationChange}
              >
                <MenuItem value="">All</MenuItem>
                {specializations.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MuiGrid>

          <MuiGrid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="department-label">Department</InputLabel>
              <Select
                labelId="department-label"
                value={department}
                label="Department"
                onChange={handleDepartmentChange}
              >
                <MenuItem value="">All</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MuiGrid>

          <MuiGrid
            item
            xs={12}
            sm={6}
            md={2}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Button variant="outlined" onClick={resetFilters} fullWidth>
              Reset Filters
            </Button>
          </MuiGrid>
        </MuiGrid>
      </Box>

      {/* Results section */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : filteredDoctors.length === 0 ? (
        <Typography align="center" sx={{ my: 4 }}>
          No doctors found matching your criteria.
        </Typography>
      ) : (
        <MuiGrid container spacing={3}>
          {filteredDoctors.map((doctor) => (
            <MuiGrid item key={doctor.employeeID} xs={12} md={6}>
              <Card>
                <CardContent sx={{ display: "flex", gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: "primary.main",
                      fontSize: "2rem",
                    }}
                  >
                    {doctor.name.charAt(0)}
                  </Avatar>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2">
                      Dr. {doctor.name}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Chip
                        label={doctor.specialization}
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {doctor.deptName} Department
                      </Typography>
                    </Box>

                    {doctor.rating && (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Rating value={doctor.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({doctor.rating.toFixed(1)})
                        </Typography>
                      </Box>
                    )}

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Location: {doctor.doctorLocation}
                    </Typography>

                    <Button
                      variant="contained"
                      size="small"
                      sx={{ mt: 2 }}
                      href={`/doctors/${doctor.employeeID}`}
                    >
                      View Profile & Book
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </MuiGrid>
          ))}
        </MuiGrid>
      )}
    </Container>
  );
};

export default DoctorList;
