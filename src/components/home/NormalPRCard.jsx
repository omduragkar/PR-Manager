import { Button, Card, CardActions, CardContent, Stack, Typography } from "@mui/material";
import React from "react";

function NormalPRCard({
  title,
  description,
  author,
  createdAt,
  approvalStatus,
  navigate,
  id,
  update,
  setupdate,
  openModal,
  setOpenModal,
  deleteMutation
}) {
  return (
    <Card onClick={()=>navigate(`/pullrequest/${id}`)}>

      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Stack direction="column" spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
            <Stack direction={"row"} spacing={2}>
              <Typography variant="body2" color="text.secondary">
                {createdAt}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {approvalStatus}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {author}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
      <CardActions sx={{
        justifyContent: "flex-end"
      }}>
        <Button size="small" variant="outlined" onClick={(e)=>{
          e.stopPropagation()
          setupdate({
            ...update,
            id: id,
            update: true
          })
          setOpenModal(!openModal)
        }}>Update</Button>
        <Button size="small"  variant="outlined" color="error"
        onClick={(e)=>{
          e.stopPropagation()
          deleteMutation.mutate(id)  
        }}
        >Delete</Button>
      </CardActions>
    </Card>
  );
}

export default NormalPRCard;
