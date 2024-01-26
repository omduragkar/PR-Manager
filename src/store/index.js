import { create } from "zustand";
import { devtools, persist} from 'zustand/middleware'


const loginSignupStore = (set, get) => ({
  email: "",
  password: "",
  confirmPassword: "",
  roles: [],
  isLogin: true,
  rolesIDs: [],
  setIsLogin: (isLogin) => set({ isLogin }),
  setData: (data) => set({ ...get(), [data.name]: data.value }),
  getData: (name) => (name ? get()[name] : get()),
});
// function isTokenExpired(token) {
//   try {
//     const decoded = jwt.decode(token);
//     return decoded.exp < Date.now() / 1000;
//   } catch (err) {
//     return false;
//   }
// }



export const useLoginSignupStore = create(devtools(loginSignupStore));

const createPRData = (set, get)=>({
  title:"",
  description:"",
  approvers:[],
  isSequential:false,
  setPRData:(data)=>set(data),
  clear:()=>set({title:"",description:"",approvers:[],isSequential:false}),
  getPRData:(name)=>(name?get()[name]:get())
})
export const usecreatePRdata = create(devtools(createPRData));
const store = (set, get) => ({
  user: {},
  isAuthenticated: false,
  setUser: (user) => {
    set({
      user: user,
      isAuthenticated: true,
    });
  },
  getUser: () => get().user?.user,
  getToken: () => get().user?.token,
  getIsAuthenticated: () =>get().isAuthenticated,
  logout: () => {
    localStorage.removeItem("user");
    set({
      user: {},
      isAuthenticated: false,
    });
  },
});
let state = persist(store, {
  name: "user",
  getStorage: () => localStorage,
});

export const useUserStore = create(devtools(state));

const pullRequestStore = (set, get) => ({
  Notifications: [],
  setNotifications: (Notifications) => set({ Notifications }),
  getNotifications: () => get().Notifications,
  myPullRequests: [],
  setMyPullRequests: (myPullRequests) => set({ myPullRequests }),
  getMyPullRequests: () => get().myPullRequests,
  approvalPullRequests: [],
  setApprovalPullRequests: (approvalPullRequests) =>
    set({ approvalPullRequests }),
  getApprovalPullRequests: () => get().approvalPullRequests,
  selfUpdateprs:(data)=>{
    let approvalPR=[];
    let myPR=[];
    data?.pullrequests.map(
      (pullrequest) => {
        if (pullrequest?.askedToReviewByUser) {
         approvalPR.push(pullrequest);
        }else{
          myPR.push(pullrequest);
        }
      }
    );
    set({ approvalPullRequests: approvalPR });
    set({ myPullRequests: myPR });
    set({ Notifications: data?.notifications });
  }

});

export const usePullRequestStore = create(devtools(pullRequestStore));

