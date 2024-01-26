import { Button, Stack, TextField } from "@mui/material";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useUserStore } from "../../store";
import { useMutation } from "react-query";
import { onErrorHandler } from "../../utils/errorHandler";
import { addComment } from "../../utils/apiCalls";

function AddComment({ pullRequest, setPullRequest }) {
  const [comment, setComment] = React.useState("");
  const { getToken } = useUserStore();

  const mutationComment = useMutation({
    mutationKey: "addComment",
    mutationFn: () => addComment(pullRequest?._id, comment, getToken()),
    onSuccess: (data) => {
      setComment("");
      console.log({
        data,
        pullRequest
      })
      setPullRequest({
        ...pullRequest,
        reviews:[...pullRequest?.reviews, data?.data?.comment]
      })
      toast.success("Comment added successfully");
    },
    onError: (error) => {
      onErrorHandler(error?.response);
    },
  });

  return (
    <Stack direction="column" gap={2} justifyContent={"flex-end"}>
      <TextField
        label="Comment"
        variant="outlined"
        multiline={true}
        rows={4}
        fullWidth={true}
        disabled={mutationComment?.isLoading}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button
        disabled={mutationComment?.isLoading || comment.length == 0}
        variant="contained"
        color="primary"
        onClick={() => mutationComment.mutate()}
      >
        Submit
      </Button>
    </Stack>
  );
}

export default AddComment;
