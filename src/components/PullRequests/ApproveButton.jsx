import React from "react";
import { useUserStore } from "../../store";
import { Button, MenuItem, Select, Stack, Typography } from "@mui/material";
import { useMutation } from "react-query";
import { approveRejectAPI } from "../../utils/apiCalls";
import { onErrorHandler } from "../../utils/errorHandler";
import { toast } from "react-toastify";
import { find, pull } from "lodash";

function ApproveButton({ pullRequest }) {
  const { getUser, getToken } = useUserStore();
  const [toApprove, setToApprove] = React.useState(true);
  const isYourTurn = React.useMemo(() => {
    return (
      pullRequest?.approvers[
        pullRequest?.currentApproverIndex
      ]?.approverId?._id.toString() == getUser()?._id.toString()
    );
  }, [pullRequest, getUser()]);
  const mutateApprove = useMutation({
    mutationKey: "approve",
    mutationFn: (data) => approveRejectAPI(data),
    onSuccess: (data) => {
      toast.success(
        `Pull Request ${toApprove ? "Approved" : "Rejected"} Successfully`
      );
      window.location.reload();
    },
    onError: (error) => onErrorHandler(error, toast),
  });
  const isCurrentUserApprover = React.useMemo(
    () =>
      find(
        pullRequest?.approvers,
        (approver) =>
          approver?.approverId?._id?.toString() == getUser()?._id?.toString()
      ),
    [pullRequest]
  );
  const ApproveRejectButton = React.useMemo(() => {
    return (
      <Stack
        direction={"row"}
        justifyContent={"flex-end"}
        alignItems={"center"}
        width={"100%"}
        gap={2}
      >
        <Select
          disabled={mutateApprove?.isLoading}
          variant="outlined"
          value={toApprove}
          onChange={(e) => {
            console.log({
              e,
              value: e.target.value,
            });
            setToApprove(e.target.value);
          }}
        >
          <MenuItem value={true}>Approve</MenuItem>
          <MenuItem value={false}>Reject</MenuItem>
        </Select>
        <Button
          disabled={mutateApprove?.isLoading}
          variant="contained"
          color="secondary"
          onClick={() =>
            mutateApprove.mutate({
              _id: pullRequest?._id,
              toApprove,
              token: getToken(),
            })
          }
        >
          Submit
        </Button>
      </Stack>
    );
  }, [isYourTurn, toApprove]);
  return (!isCurrentUserApprover ? (
    <Typography>Approval Status: {pullRequest.status}</Typography>
  ) : (pullRequest?.status == "PENDING" ? (
    pullRequest?.isSequential ? (
      isYourTurn ? (
        ApproveRejectButton
      ) : (
        <Typography>Waiting for other approvers to approve</Typography>
      )
    ) : (
      ApproveRejectButton
    )
  ) : (
    !pullRequest.isSequential && isCurrentUserApprover && isCurrentUserApprover?.status == "PENDING" ?
    (
        ApproveRejectButton
    )
    :
    (
    <Typography>Approval Process Completed</Typography>
  ))))
}

export default ApproveButton;
