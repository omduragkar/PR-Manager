import { contentAxios } from "./AxiosSetup";

export const getPullRequestsAndNotifications = async (token) => {
  console.log(token);
  return await contentAxios.get("/pull-requests", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getPullRequestByID = async (pullRequestId, token) => {
  return await contentAxios.get(`/pull-requests?id=${pullRequestId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addComment = async (pullRequestId, comment, token) => {
  return await contentAxios.post(
    `/pull-requests/comments/${pullRequestId}`,
    {
      commentText: comment,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getApproverUsers = async (token) => {
  return await contentAxios.get(`/users/get-approval-users`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const ceratePrAPI = async (prData, token, isUpdate, updateId) => {
  if(isUpdate){
    return await contentAxios.put(`/pull-requests/${updateId}`, prData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return await contentAxios.post("/pull-requests/create", prData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
export const deletePullRequest = async (prDataId, token) => {
  return await contentAxios.delete(`/pull-requests/${prDataId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const approveRejectAPI = async (data) => {
  return await contentAxios.post(`/pull-requests/approve/${data?._id}`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data?.token}`,
    },
  });
};
