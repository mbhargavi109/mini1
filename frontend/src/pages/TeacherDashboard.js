import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Chip, Divider } from '@mui/material';
import axios from 'axios';

export default function TeacherDashboard() {
  const [profile, setProfile] = useState(null);
  const teacherId = JSON.parse(localStorage.getItem('user'))?.id || 1;

  useEffect(() => {
    axios.get(`/teacher/${teacherId}/profile`).then(res => setProfile(res.data));
  }, [teacherId]);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Teacher Dashboard</Typography>
        {profile && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Teacher Profile</Typography>
              <Typography>Name: {profile.name}</Typography>
              <Typography>Email: {profile.email}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">Departments:</Typography>
              {profile.departments.map(dep => <Chip key={dep.id} label={dep.name} sx={{ mr: 1, mb: 1 }} />)}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>Semesters:</Typography>
              {profile.semesters.map(sem => <Chip key={sem.id} label={sem.name} sx={{ mr: 1, mb: 1 }} />)}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>Subjects:</Typography>
              {profile.subjects.map(sub => <Chip key={sub.id} label={sub.name} sx={{ mr: 1, mb: 1 }} />)}
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
} 