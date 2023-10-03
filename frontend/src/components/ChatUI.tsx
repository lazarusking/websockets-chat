import Chat, {
  Bubble,
  Button,
  Input,
  MessageProps,
  Modal,
  useMessages,
} from "@chatui/core";
import "@chatui/core/dist/index.css";
import { useEffect, useReducer, useRef } from "react";
import { genUniqueId } from "../lib/genUUID";
import { websocket } from "../lib/socket";
import { AppState, appReducer } from "../reducers/appReducer";
import { useStore } from "../store/chat";

type User = {
  id: string;
  user: string;
};

interface WSMessage extends User {
  message: string;
  status: string;
}

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

const initialMessages = [
  {
    type: "text",
    content: { text: "Hello, try sending a message" },
    user: {
      avatar: "//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg",
    },
  },
];
export default function ChatUI() {
  const { messages, appendMsg, setTyping } = useMessages(initialMessages);
  const [state, dispatch] = useReducer(appReducer, initialState);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setIsConnected, setHasUsername, setOpen, setUserID } = useStore();
  useEffect(() => {
    const connectWebSocket = () => {
      websocket.addEventListener("open", onConnect);
      websocket.addEventListener("close", reConnect);
      websocket.addEventListener("message", addNewMsg);
    };
    const reConnect = () => {
      onDisconnect();
      setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };

    function addNewMsg(event: MessageEvent) {
      let data: WSMessage = JSON.parse(event.data);
      console.debug(data, state.userID);
      console.debug(data.id == state.userID.id);
      if (state.userID.id !== data.id) {
        switch (data.status) {
          case "typing":
            setTyping(true);
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
              setTyping(false);
            }, 1000);
            break;
          case "setup":
            dispatch({ type: "SET_USER_ID", userID: data });
            setUserID(data);
            console.log(data);
            console.log(state.userID);
            break;
          default:
            appendMsg({
              type: "text",
              content: { text: data.message },
              position: "left",
              user: { name: data.user },
            });
            break;
        }
      }
    }

    function onConnect() {
      console.log("connected");
      dispatch({ type: "SET_IS_CONNECTED", isConnected: true });
      setIsConnected(true);
      // dispatch({ type: "SET_USER_ID", userID: state.userID });
      // console.log(state);
    }

    function onDisconnect() {
      dispatch({ type: "SET_IS_CONNECTED", isConnected: false });
      setIsConnected(false);
    }

    connectWebSocket();
    return () => {
      websocket.removeEventListener("open", onConnect);
      websocket.removeEventListener("close", reConnect);
      websocket.removeEventListener("message", addNewMsg);
    };
  }, [state, setTyping, appendMsg]);

  function handleOpen() {
    dispatch({ type: "SET_OPEN", open: true });
    setOpen(true);
  }

  function handleClose() {
    dispatch({ type: "SET_OPEN", open: false });
    setOpen(false);
  }

  function handleChange() {
    websocket.send(JSON.stringify({ ...state.userID, status: "typing" }));
  }

  function handleSend(type: string, val: string) {
    if (type === "text" && val.trim()) {
      appendMsg({
        type: "text",
        content: { text: val },
        position: "right",
        user: { name: state.userID.user },
      });
      const data: WSMessage = { ...state.userID, status: "", message: val };
      console.log(data, state.userID);
      websocket.send(JSON.stringify(data));
    }
  }

  function handleQuickReplyClick(item: { name: string }) {
    handleSend("text", item.name);
  }

  function renderMessageContent(msg: MessageProps) {
    const { type, content } = msg;

    switch (type) {
      case "text":
        return <Bubble content={content.text} title="idk" />;
      case "image":
        return (
          <Bubble type="image">
            <img src={content.picUrl} alt="" />
          </Bubble>
        );
      default:
        return null;
    }
  }
  const defaultQuickReplies = [
    {
      icon: "message",
      name: "Hello",
      isNew: true,
      isHighlight: true,
    },
    {
      name: "Hi",
      isNew: true,
    },
    {
      name: "Sup",
      isHighlight: true,
    },
    {
      name: "What?",
    },
  ];

  return (
    <>
      <div>
        <Button onClick={() => handleOpen()}>Open</Button>
        <Modal
          active={state.open}
          title="Set Username"
          showClose={false}
          onClose={handleClose}
          actions={[
            {
              label: "Confirm",
              color: "primary",
              inputMode: "text",
              onClick: () => {
                dispatch({
                  type: "SET_USER_ID",
                  userID: { ...state.userID, user: state.username },
                });
                dispatch({ type: "SET_HAS_USERNAME", hasUsername: true });
                handleClose();
              },
            },
            {
              label: "Back",
              onClick: handleClose,
            },
          ]}
        >
          <Input
            name="username"
            maxLength={20}
            value={state.username}
            onChange={(val) =>
              dispatch({ type: "SET_USERNAME", username: val })
            }
            placeholder="Enter username..."
          />
        </Modal>
        {/* {state.open && (
        )} */}
      </div>
      <Chat
        locale="en"
        navbar={{
          title: `Test chat ${state.isConnected ? "🟢" : "🔴reconnecting"}`,
        }}
        messages={messages}
        placeholder="Enter message"
        renderMessageContent={renderMessageContent}
        quickReplies={defaultQuickReplies}
        onQuickReplyClick={handleQuickReplyClick}
        onSend={handleSend}
        onInputChange={handleChange}
        inputOptions={{ value: "Send", "aria-label": "helooooo" }}
      />
    </>
  );
}
