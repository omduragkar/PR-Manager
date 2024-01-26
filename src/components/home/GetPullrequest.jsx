import React from 'react'
import { useQuery } from 'react-query'
import { getPullRequestsAndNotifications } from '../../utils/apiCalls'
import { usePullRequestStore, useUserStore } from '../../store'
import { toast } from 'react-toastify';
import { Stack, Typography } from '@mui/material';
import VerticalTabs from './TabWise';
import { onErrorHandler } from '../../utils/errorHandler';

function GetPullrequest() {
    
    const {getToken, logout} = useUserStore();
    const {selfUpdateprs, getMyPullRequests, getApprovalPullRequests, getNotifications} = usePullRequestStore();
    const getpr = useQuery({
        queryKey: 'getpr',
        queryFn: ()=>getPullRequestsAndNotifications(getToken()),
        onSuccess: (data)=>selfUpdateprs(data?.data),
        onError: error=>onErrorHandler(error)
        
    })
    console.log({
        getMyPullRequests: getMyPullRequests(),
        getApprovalPullRequests: getApprovalPullRequests(),
        getNotifications: getNotifications()
    })
  return (
        <VerticalTabs />
  )
}

export default GetPullrequest