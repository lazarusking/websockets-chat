import { create } from "zustand";
type User = {
  id: string;
  user: string;
};

interface WSMessage extends User {
  message: string;
  status: string;
}

type AppState = {
  userID: WSMessage;
  isConnected: boolean;
  hasUsername: boolean;
  open: boolean;
  username: string;
};

type Action = {
  setUserID: (userID: WSMessage) => void;
  setIsConnected: (isConnected: boolean) => void;
  setHasUsername: (hasUsername: boolean) => void;
  setOpen: (open: boolean) => void;
  setUsername: (username: string) => void;
  // updateLastName: (lastName: State['lastName']) => void
};
const initialState: AppState = {
  userID: {
    id: "",
    user: "accel",
    message: "",
    status: "",
  },
  isConnected: false,
  hasUsername: false,
  open: false,
  username: "",
};

export const useStore = create<AppState & Action>()((set) => ({
  ...initialState,
  setIsConnected: (bool) => set(() => ({ isConnected: bool })),
  setUserID: (userID) => set(() => ({ userID: userID })),
  setHasUsername: (hasUsername) => set(() => ({ hasUsername: hasUsername })),
  setOpen: (open) => set(() => ({ open: open })),
  setUsername: (username) =>
    set((state) => ({ userID: { ...state.userID, user: username } })),
}));
