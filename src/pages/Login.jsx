import {
  Button,
  Checkbox,
  Chip,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import React from "react";
import { contentAxios } from "../utils/axiosSetup";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useLoginSignupStore, useUserStore } from "../store";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { onErrorHandler } from "../utils/errorHandler";
import { find, get, map } from "lodash";

const queryCall = async () => {
  return await contentAxios.get("/users/get-roles");
};

function Login({ isLogin = true }) {
  const initialValues = React.useMemo(
    () =>
      isLogin
        ? [
            {
              type: "email",
              label: "Email",
              name: "email",
              value: "",
              required: true,
            },
            {
              type: "password",
              label: "Password",
              name: "password",
              value: "",
              required: true,
            },
          ]
        : [
            {
              type: "text",
              label: "Name",
              name: "name",
              value: "",
              required: true,
            },
            {
              type: "email",
              label: "Email",
              name: "email",
              value: "",
              required: true,
            },
            {
              type: "password",
              label: "Password",
              name: "password",
              value: "",
              required: true,
            },
            {
              type: "password",
              label: "Confirm Password",
              name: "confirmPassword",
              value: "",
              required: true,
            },
            {
              type: "select",
              label: "Roles",
              name: "roles",
              value: "",
              required: true,
              options: [],
            },
          ],
    [isLogin]
  );
  const navigate = useNavigate();
  var queryData = useQuery({
    queryKey: "roles",
    queryFn: queryCall,
    enabled: !isLogin,
    onSuccess: (data) => {
      initialValues[4].options = data?.data?.map((item) => ({
        value: item.roleName,
        label: item.roleName,
        name: item.roleName,
        _id: item._id,
      }));
    },
    onError: (error) => {
      console.log(error);
      initialValues[3].options = [];
    },
  });
  const { setUser, getIsAuthenticated } = useUserStore();
  const mutationData = useMutation({
    mutationKey: isLogin ? "login" : "signup",
    mutationFn: async (data) =>
      contentAxios.post(`/users/${isLogin ? "login" : "signup"}`, data),
    onSuccess: (data) => {
      console.log(data);
      toast.success(data?.message || "Success");
      setUser(data?.data);
      navigate("/");
    },
    onError: (error) => onErrorHandler(error),
  });
  const { setData, getData } = useLoginSignupStore();
  const onSubmit = React.useCallback(() => {
    let validatedData = null;
    if (isLogin) {
      validatedData = Yup.object({
        email: Yup.string().email().required(),
        password: Yup.string().required(),
      }).validateSync({
        email: getData("email"),
        password: getData("password"),
      });
    } else {
      validatedData = Yup.object({
        email: Yup.string().email().required(),
        password: Yup.string().required(),
        confirmPassword: Yup.string().when("password", (password, schema) =>
          password ? schema.required().oneOf([Yup.ref("password")]) : schema
        ),
        roles: Yup.array().when("confirmPassword", (confirmPassword, schema) =>
          confirmPassword ? schema.required() : schema
        ),
      }).validateSync({
        email: getData("email"),
        password: getData("password"),
        confirmPassword: getData("confirmPassword"),
        roles: getData("roles"),
      });
    }
    if (!validatedData && validatedData?.error) {
      console.log(validatedData?.error);
      toast.error("Missing required Fields!");
      return;
    }

    const data = initialValues.reduce((acc, item) => {
      acc[item.name] = getData(item.name);
      if (item.name === "roles") {
        acc["roles"] = map(getData("roles"), (item) => item._id);
      }
      return acc;
    }, {});
    if (!isLogin) {
      delete data.confirmPassword;
    }
    console.log(data);
    mutationData.mutate(data);
  }, [mutationData, getData, isLogin, initialValues]);
  React.useEffect(() => {
    if (getIsAuthenticated()) {
      navigate("/");
    }
  }, [getIsAuthenticated, navigate]);
  return (
    <Stack
      sx={{
        height: "100vh",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        overflowY: "hidden",
        overflowX: "hidden",
      }}
    >
      <Stack
        sx={{
          height: "40rem",
          width: "50%",
          boxShadow: 10,
          borderRadius: 5,
          p: 5,
        }}
      >
        {queryData?.isLoading ? (
          <Typography variant="h3">Loading...</Typography>
        ) : (
          <>
            <Typography variant="h3" textAlign={"center"}>
              {isLogin ? "Login" : "Sign Up"}
            </Typography>
            <Stack gap={3} py={2}>
              {initialValues?.map((item, index) =>
                item.type === "select" ? (
                  <Stack
                    key={index}
                    direction={"column"}
                    justifyContent={"center"}
                    alignItems={"start"}
                  >
                    <Typography variant="h6">{item.label}</Typography>
                    <Select
                      key={index}
                      multiple
                      value={getData(item.name)}
                      renderValue={(selected) => (
                        <div>
                          {selected.map((value) => (
                            <Chip key={value} label={value?.label} />
                          ))}
                        </div>
                      )}
                      fullWidth
                      onChange={(e) => {
                        setData({
                          name: item.name,
                          value: e.target.value,
                        });
                      }}
                    >
                      {item?.options?.map((option, index) => (
                        <MenuItem key={index} value={option}>
                          <Stack direction={"row"}>
                            <Checkbox
                              checked={find(getData(item.name), (opt) => opt._id?.toString() === option._id?.toString()) ? true : false}
                            />
                            <Typography>{option.label}</Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </Stack>
                ) : (
                  <TextField
                    variant="filled"
                    key={index}
                    type={item.type}
                    label={item.label}
                    name={item.name}
                    required={item.required}
                    select={item.select}
                    options={item.options}
                    onChange={(e) =>
                      setData({
                        name: e.target.name,
                        value: e.target.value,
                      })
                    }
                    value={getData(item.name)}
                  />
                )
              )}

              <Button variant="contained" color="primary" onClick={onSubmit}>
                {isLogin ? "Login" : "Signup"}
              </Button>
              <Typography
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <Typography
                  variant="body2"
                  color="primary"
                  onClick={() => navigate(`/${isLogin ? "signup" : "login"}`)}
                  sx={{
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {isLogin ? "Signup" : "Login"}
                </Typography>
              </Typography>
            </Stack>
          </>
        )}
      </Stack>
    </Stack>
  );
}

export default Login;
