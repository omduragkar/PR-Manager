import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import { Stack } from "@mui/material";
import Login from "./pages/Login";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
import PullRequests from "./pages/PullRequests";
function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login isLogin={true} />,
    },
    {
      path:"/pullrequest/:pullRequestId",
      element: <PullRequests />
    },
    {
      path: "/signup",
      element: <Login isLogin={false} />,
    },
    {
      path: "*",
      element: <h1>Not Found</h1>,
    }
  ]);
  return (
    <Stack
      sx={{
        maxHeight: "100vh",
        maxHidth: "100vw",
        justifyContent: "center",
        alignItems: "center",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <QueryClientProvider client={queryClient}>
      <ToastContainer />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Stack>
  );
}

export default App;
