type User = {
  id: string;
  user: string;
};

interface WSMessage extends User {
  message: string;
  status: string;
}

type AppAction =
  | { type: "SET_USER_ID"; userID: WSMessage }
  | { type: "SET_IS_CONNECTED"; isConnected: boolean }
  | { type: "SET_HAS_USERNAME"; hasUsername: boolean }
  | { type: "SET_OPEN"; open: boolean }
  | { type: "SET_USERNAME"; username: string };

export type AppState = {
  userID: WSMessage;
  isConnected: boolean;
  hasUsername: boolean;
  open: boolean;
  username: string;
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER_ID":
      return { ...state, userID: action.userID };
    case "SET_IS_CONNECTED":
      return { ...state, isConnected: action.isConnected };
    case "SET_HAS_USERNAME":
      return { ...state, hasUsername: action.hasUsername };
    case "SET_OPEN":
      return { ...state, open: action.open };
    case "SET_USERNAME":
      return { ...state, username: action.username };
    default:
      return state;
  }
}
