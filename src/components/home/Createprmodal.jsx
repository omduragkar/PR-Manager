import React, { useMemo, useState } from "react";
import {
  Modal,
  Button,
  Stack,
  Typography,
  TextField,
  List,
  Switch,
  Paper,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Checkbox,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  usePullRequestStore,
  useUserStore,
  usecreatePRdata,
} from "../../store";
import { useMutation, useQuery } from "react-query";
import {
  ceratePrAPI,
  getApproverUsers,
  getPullRequestByID,
} from "../../utils/apiCalls";
import { toast } from "react-toastify";
import { onErrorHandler } from "../../utils/errorHandler";
import { filter, find, uniqBy, updateWith } from "lodash";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
};
const CreatePRModal = ({ openModal, setOpenModal, update }) => {
  const { getToken, getUser } = useUserStore();
  const { setMyPullRequests, getMyPullRequests } = usePullRequestStore();
  const { getPRData, setPRData, clear } = usecreatePRdata();
  const getUsers = useQuery({
    queryKey: "getUsers",
    queryFn: () => getApproverUsers(getToken()),
    onError: (error) => {
      console.log("error", error);
      toast.error(error?.response?.data?.message);
    },
  });
  const callData = useQuery({
    enabled: update?.update,
    queryKey: ["pullRequest", update?.id],
    queryFn: () => getPullRequestByID(update?.id, getToken()),
    onSuccess: (data) => {
      console.log(data);
      console.log({
        data,
      });
      setPRData({
        title: data?.data?.title,
        description: data?.data?.description,
        approvers: data?.data?.approvers.map((approver) => ({
          email: approver?.approverId?.email || approver?.email,
          approverId: approver?.approverId?._id || approver?.approverId,
          _id: approver?.approverId?._id || approver?.approverId,
        })),
        isSequential: data?.data?.isSequential,
      });
    },
    onError: (error) => onErrorHandler(error),
  });
  const handleClose = () => {
    setOpenModal(false);
  };
  const mutationCreatePR = useMutation({
    mutationKey: "mutationCreateUpdatePR",
    mutationFn: (prValue) => ceratePrAPI(prValue, getToken(), update?.update, update?.id),
    onSuccess: (data) => {
      console.log("data", data);
      updateWith(data?.data, {
        approvers: data?.data?.approvers.map((approver) => ({
          email: approver?.approverId?.email || approver?.email,
          approverId: approver?.approverId?._id || approver?.approverId,
          _id: approver?.approverId?._id || approver?.approverId,
        })),
      });
      let newMypullRequests = uniqBy([...getMyPullRequests(), data?.data], "_id");
      setMyPullRequests(newMypullRequests);
      toast.success(`PR ${update?.update?"Updated":"Created"} Successfully`);
      clear();
      handleClose();
    },
    onError: (error) => onErrorHandler(error),
  });
  const initialFormData = useMemo(() => {
    let initialData = [
      {
        name: "title",
        label: "Title",
        value: "",
        type: "text",
        mutiline: false,
      },
      {
        name: "description",
        label: "Description",
        value: "",
        type: "text",
        mutiline: true,
        rows: 4,
      },
      {
        name: "approvers",
        label: "Approvers",
        value: [],
        options: [],
        type: "multiSelect",
      },
      {
        name: "isSequential",
        label: "Sequential",
        value: false,
        type: "switch",
      },
    ];
    if (getUsers.data) {
      initialData[2].options = uniqBy(
        [...initialData[2].options, ...getUsers?.data?.data],
        "approverId"
      );
    }
    if (getPRData("approvers")) {
      initialData[2].options = uniqBy(
        [...initialData[2].options , 
        ...filter(getPRData("approvers"), (approver) => approver?.approverId?.toString() !== getUser()?._id?.toString())],
        "approverId"
      );
    }
    console.log({
      initialData
    })
    return initialData;
  }, [getUsers.data, getPRData("approvers")]);

  const handleCreatePR = () => {
    // Logic to create PR with prValue
    console.log("Creating PR:", getPRData());
    mutationCreatePR.mutate(getPRData());
    // handleClose();
  };
  console.log({
    initialFormData,
    getPRData: getPRData(),
    callData: callData?.data?.data?.approvers,
    getUsers: getUsers?.data?.data,
    getUser: getUser(),
    getMyPullRequests: getMyPullRequests(),
    mutationCreatePR: mutationCreatePR?.data,
    update: update,
  });
  return (
    <div>
      <Modal open={openModal} onClose={handleClose}>
        <Paper sx={style}>
          <Typography variant="h4">Create PR</Typography>
          {getUsers.isLoading ? (
            <Stack>
              <CircularProgress />
            </Stack>
          ) : (
            <Stack>
              <Stack>
              </Stack>
              <Stack>
                {initialFormData?.map((data) => {
                  return (
                    <Stack>
                      <Typography>{data?.label}</Typography>
                      {data?.type === "text" && (
                        <TextField
                          type={data?.type}
                          multiline={data?.mutiline}
                          rows={data?.mutiline ? data?.rows : 1}
                          value={getPRData(data?.name)}
                          onChange={(e) => {
                            setPRData({
                              ...getPRData(),
                              [data?.name]: e.target.value,
                            });
                          }}
                        />
                      )}
                      {data?.type === "multiSelect" && (
                        <FormControl>
                          <Select
                            multiple
                            value={uniqBy(getPRData(data?.name), "approverId")}
                            renderValue={(selected) => (
                              <div>
                                {selected.map((value) => (
                                  <Chip key={value} label={value.email} />
                                ))}
                              </div>
                            )}
                          >
                            {data?.options?.map((option) => (
                              <MenuItem key={option.approverId} value={option} onClick={e=>{
                                e.stopPropagation()
                                if(e.target.checked){
                                  setPRData({
                                    ...getPRData(),
                                    [data?.name]: uniqBy([...getPRData(data?.name), option], "approverId"),
                                  });
                                }else{
                                  setPRData({
                                    ...getPRData(),
                                    [data?.name]: filter(getPRData(data?.name), (opt) => opt.approverId?.toString() !== option.approverId?.toString())
                                  });
                                }
                               }}>
                                <Checkbox
                                  checked={find(getPRData(data?.name), (opt) => opt.approverId?.toString() === option.approverId?.toString()) ? true : false}
                                />
                                <ListItemText primary={option.email} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      {data?.type === "switch" && (
                        <Stack>
                          <Switch
                            checked={getPRData(data?.name)}
                            onChange={(e) => {
                              setPRData({
                                ...getPRData(),
                                [data?.name]: e.target.checked,
                              });
                            }}
                          />
                          <Typography>
                            {getPRData(data?.name) ? "Yes" : "No"}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  );
                })}
                <Button onClick={handleCreatePR}>{update?.update?"Update" : "Create"} PR</Button>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Modal>
    </div>
  );
};

export default CreatePRModal;
