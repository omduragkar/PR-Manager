import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { usePullRequestStore, useUserStore } from "../../store";
import { Button, Grid, Stack } from "@mui/material";
import NormalPRCard from "./NormalPRCard";
import { useNavigate } from "react-router-dom";
import CreatePRModal from "./CreatePRModal";
import { deletePullRequest } from "../../utils/apiCalls";
import { useMutation } from "react-query";
import { onErrorHandler } from "../../utils/errorHandler";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function VerticalTabs() {
  const [value, setValue] = React.useState(0);

  const { getUser, getToken } = useUserStore();
  const [openModal, setOpenModal] = React.useState(false);
  const [update, setupdate] = React.useState({
    update: false,
    id:null,
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => deletePullRequest(id, getToken()),
    onSuccess: (data) => {
      toast.success("Pull Request Deleted Successfully");
    },
    onError: (error) => onErrorHandler(error),
  });
  const {
    selfUpdateprs,
    getMyPullRequests,
    getApprovalPullRequests,
    getNotifications,
  } = usePullRequestStore();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "background.paper",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Tabs
        orientation="horizontal"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: "divider" }}
      >
        <Tab label="My Pull Requests" {...a11yProps(0)} />
        <Tab label="To Approve" {...a11yProps(1)} />
        <Tab label="Notifications" {...a11yProps(2)} />
      </Tabs>
      <Stack sx={{
        width: "100",
        height: "80vh",
        overflowY: "auto"
      }}>
        <TabPanel value={value} index={0}>
          <Stack direction="column" spacing={2}>
            <Stack direction="row" spacing={2} justifyContent={"space-between"}>
              <Stack direction="row" spacing={2}>
                <Typography>My Pull Requests</Typography>
                <Typography>{getMyPullRequests()?.length}</Typography>
              </Stack>
              {getUser()?.roles?.find(
                (role) =>
                  role.roleName === "ADMIN" || role.roleName === "PRREQUESTER"
              ) && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenModal(true)}
                >
                  Create Pull Request
                </Button>
              )}
            </Stack>
            <Grid container spacing={2}>
              {getMyPullRequests() && getMyPullRequests().length != 0 ? (
                getMyPullRequests()?.map((pr) => (
                  <Grid item xs={12} md={6}>
                    <NormalPRCard
                      title={pr?.title}
                      description={pr?.description}
                      author={"Me"}
                      approvalStatus={pr?.status}
                      createdAt={pr?.createdAt}
                      navigate={navigate}
                      id={pr?._id}
                      update={update}
                      setupdate={setupdate}
                      openModal={openModal}
                      setOpenModal={setOpenModal}
                      deleteMutation={deleteMutation}
                    />
                  </Grid>
                ))
              ) : (
                <Typography>Relax! No Pull Requests</Typography>
              )}
            </Grid>
          </Stack>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Stack direction="column" spacing={2}>
            <Grid container spacing={2}>
              {getApprovalPullRequests() &&
              getApprovalPullRequests().length != 0 ? (
                getApprovalPullRequests()?.map((pr) => (
                  <Grid item xs={12} md={6}>
                    <NormalPRCard
                      title={pr?.title}
                      description={pr?.description}
                      author={pr?.requesterId?.email}
                      approvalStatus={pr?.status}
                      createdAt={pr?.createdAt}
                      navigate={navigate}
                      id={pr?._id}
                      update={update}
                      setupdate={setupdate}
                      openModal={openModal}
                      setOpenModal={setOpenModal}
                      deleteMutation={deleteMutation}
                    />
                  </Grid>
                ))
              ) : (
                <Typography>Relax! No Pull Requests To Review</Typography>
              )}
            </Grid>
          </Stack>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Stack direction="column" spacing={2} sx={{
            height: "70vh",
            overflow: "auto"
          }}>
            {getNotifications() && getNotifications().length != 0 ? (
              getNotifications()?.map((pr) => (
                <Typography>{pr?.message}</Typography>
              ))
            ) : (
              <Typography>Relax! All clean No messages to Read</Typography>
            )}
          </Stack>
        </TabPanel>
      </Stack>
      <CreatePRModal
        openModal={openModal} setOpenModal={setOpenModal} 
        handleClose={()=>setOpenModal(false)}
        update={update}
        setupdate={setupdate}


      />
    </Box>
  );
}
