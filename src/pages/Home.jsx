import { Button, Stack, Typography } from "@mui/material";
import React from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/index";
import GetPullrequest from "../components/Home/GetPullrequest";
function Home() {
  const { getIsAuthenticated, getUser, logout } = useUserStore();
  if (!getIsAuthenticated()) {
    return <Navigate to="/login" replace={true} />;
  }
  return (
    <Stack
    direction={"column"}
      sx={{
        width: "100%",
        height: "100%",
        p: 3,
        px: "5rem",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography>Hi, {getUser()?.email}</Typography>
        
        <Button variant="contained" color="primary" onClick={logout}>
            Log Out
        </Button>
      </Stack>
      <GetPullrequest />
    </Stack>
  );
}

export default Home;
