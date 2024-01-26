import { toast } from "react-toastify";

export const onErrorHandler = (error, to=null) => {
    console.error(error);
    if(error){
        if(error.response && error.response.data?.message && error.response.data?.message !== ""){
            toast && toast.error(error.response.data.message);
            if(error.response.data?.redirects){
                localStorage.clear();
                window.location.href = error.response.data.redirectUrl;
            }
            return;
        }else if(error.response && error.response.data?.error && error.response.data?.error !== ""){
            toast && toast.error(error.response.data.error);
            return;
        }
        else if(error.message && error.message !== ""){
            toast && toast.error(error.message);
            return;
        }
        else if(error?.response?.message && error?.response?.message !== ""){
            toast && toast.error(error.response.message);
            return;
        }
        else{
            toast && toast.error("Something went wrong");
            return;
        }
    }
    toast && toast.error("Something went wrong");
    return;
};