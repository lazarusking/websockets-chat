import { create } from "zustand";
import { persist } from "zustand/middleware";
type User = {
  id: string;
  user: string;
};

export interface WSMessage extends User {
  message: string;
  status: string;
}

type AppState = {
  userID: WSMessage;
  isConnected: boolean;
  hasUsername: boolean;
  open: boolean;
  username: string;
  isTyping: boolean;
};

type Action = {
  setUserID: (userID: WSMessage) => void;
  setIsConnected: (isConnected: boolean) => void;
  setHasUsername: (hasUsername: boolean) => void;
  setOpen: (open: boolean) => void;
  setUsername: (username: string) => void;
  setIsTyping: (boolean: boolean) => void;
  // updateLastName: (lastName: State['lastName']) => void
};
const initialState: AppState = {
  userID: {
    id: "",
    user: "",
    message: "",
    status: "",
  },
  isConnected: false,
  hasUsername: false,
  open: false,
  username: "",
  isTyping: false,
};

export const useStore = create<AppState & Action>()(
  persist(
    (set) => ({
      ...initialState,
      setIsConnected: (bool) => set(() => ({ isConnected: bool })),
      setUserID: (userID) => set(() => ({ userID: userID })),
      setHasUsername: (hasUsername) =>
        set(() => ({ hasUsername: hasUsername })),
      setOpen: (open) => set(() => ({ open: open })),
      setUsername: (username) => set(() => ({ username: username })),
      setIsTyping: (typing) => set(() => ({ isTyping: typing })),
    }),
    {
      name: "user-details", // name of item in the storage (must be unique)
      partialize: (state) => ({ userID: state.userID }),
    }
  )
);
