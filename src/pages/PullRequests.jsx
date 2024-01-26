import React from "react";
import { useParams } from "react-router-dom";
import { useUserStore } from "../store";
import { useQuery } from "react-query";
import { getPullRequestByID } from "../utils/apiCalls";
import {
  Button,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddComment from "../components/PullRequests/AddComment";
import { onErrorHandler } from "../utils/errorHandler";
import ApproveButton from "../components/PullRequests/ApproveButton";

function PullRequests() {
  const { pullRequestId } = useParams();
  const { getToken, getUser } = useUserStore();

  const [pullRequest, setPullRequest] = React.useState(null);
  const callData = useQuery({
    queryKey: ["pullRequest", pullRequestId],
    queryFn: () => getPullRequestByID(pullRequestId, getToken()),
    onSuccess: (data) => {
      console.log(data);
      setPullRequest(data?.data);
    },
    onError: (error) => onErrorHandler(error),
  });
  const isApprover= (approvers) => {
    if (approvers?.length == 0) return false;
    return !!approvers?.find((approver) => {
        console.log({
            approver,
            ap:approver?.approverId?._id.toString() === getUser()?._id.toString(),
            user:getUser()?._id.toString()
        })
        if (approver?.approverId?._id.toString() === getUser()?._id.toString()) return true;
    });
    }
  return (
    <>
      {callData.isFetching ? (
        <h1>Loading...</h1>
      ) : (
        <Stack
          sx={{
            padding: 2,
            height: "100vh",
            width: "100%",
            overflowY: "auto",
          }}
        >
          <Stack>
            <Stack
              direction="row"
              spacing={2}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Typography variant="h3">{pullRequest?.title}</Typography>
              <Typography variant="h5">{pullRequest?._id}</Typography>
            </Stack>
            <Typography variant="h4">{pullRequest?.description}</Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack direction="column" spacing={2}>
                <Typography variant="h5">Details</Typography>
                <Stack direction="row" spacing={2}>
                  <Stack>
                    <Typography>Authored By</Typography>
                    <Typography>{pullRequest?.requesterId?.email}</Typography>
                  </Stack>
                  <Stack>
                    <Typography>Status</Typography>
                    <Typography
                      color={
                        pullRequest?.status === "REJECTED"
                          ? "red"
                          : "primary.main"
                      }
                    >
                      {pullRequest?.status}
                    </Typography>
                  </Stack>
                  <Stack>
                    <Typography>Dependent</Typography>
                    <Typography>
                      {pullRequest?.isSequential ? "Yes" : "No"}
                    </Typography>
                  </Stack>
                </Stack>
                <Typography variant="h5">Approvers</Typography>
                {pullRequest?.approvers?.map((approver, index) => (
                  <Grid container>
                    <Grid item xs={4}>
                      <Typography>{approver?.approverId?.email}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography>
                        {pullRequest?.isSequential ? index + 1 : "o"}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography>{approver?.status}</Typography>
                    </Grid>
                  </Grid>
                ))}
                <Stack
                  direction={"row"}
                  sx={{
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {pullRequest?.isSequential &&
                    pullRequest?.status != "REJECTED" && (
                      <Stack direction="row" spacing={2}>
                        <Typography>Current Approver</Typography>
                        <Typography>
                          {pullRequest?.approvers[
                            pullRequest?.currentApproverIndex
                          ]?.approverId?.email === getUser().email
                            ? "Me"
                            : pullRequest?.approvers[
                                pullRequest?.currentApproverIndex
                              ]?.approverId?.email}
                        </Typography>
                      </Stack>
                    )}
                  <Stack direction={"row"} gap={3}>
                    <ApproveButton pullRequest={pullRequest}/>
                  </Stack>
                </Stack>
               
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="column" spacing={2}>
                <Typography variant="h5">Reviewers and Comments</Typography>
                <Stack
                  gap={2}
                  direction={"column"}
                  maxHeight={"30rem"}
                  sx={{
                    overflowY: "auto",
                  }}
                >
                  {pullRequest?.reviews?.map((reviewer) => (
                    <Stack
                      direction="column"
                      spacing={2}
                      sx={{
                        border: "1px solid black",
                        borderRadius: 2,
                        padding: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent={"flex-start"}
                        spacing={2}
                      >
                        <Typography>{reviewer?.comment}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent={"space-between"}>
                        <Typography>{reviewer?.reviewerId?.email}</Typography>
                        <Typography>{reviewer?.createdAt}</Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>

                <AddComment
                  pullRequest={pullRequest}
                  setPullRequest={setPullRequest}
                />
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      )}
    </>
  );
}

export default PullRequests;
