import Chat, {
  Bubble,
  Input,
  MessageProps,
  Modal,
  useMessages,
} from "@chatui/core";
import "@chatui/core/dist/index.css";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { websocket } from "../lib/socket";
import { WSMessage, useStore } from "../store/chat";

const initialMessages = [
  {
    type: "text",
    content: { text: "Hello, try sending a message" },
    user: {
      avatar: "http://gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg",
    },
  },
];
export default function ChatUI() {
  const { messages, appendMsg, setTyping } = useMessages(initialMessages);
  // const [state, dispatch] = useReducer(appReducer, initialState);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    isTyping,
    setIsTyping,
    setIsConnected,
    setHasUsername,
    setUsername,
    setOpen,
    setUserID,
  } = useStore();
  const { open, isConnected, userID, username } = useStore(
    useShallow((state) => ({
      open: state.open,
      isConnected: state.isConnected,
      userID: state.userID,
      username: state.username,
    }))
  );
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
      if (userID.id !== data.id) {
        console.debug(data, userID);
        console.debug(data.id == userID.id);
        switch (data.status) {
          case "typing":
            setTyping(true);
            // setIsTyping(true);
            // console.log("is typing here");
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
              setTyping(false);
              setIsTyping(false);
            }, 1000);
            break;
          case "setup":
            setUserID({ ...data, user: userID.user, status: "" });
            console.log(data);
            // console.log(state.userID);
            console.log(userID);
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
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    connectWebSocket();
    return () => {
      websocket.removeEventListener("open", onConnect);
      websocket.removeEventListener("close", reConnect);
      websocket.removeEventListener("message", addNewMsg);
    };
  }, [userID]);

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleChange() {
    if (!isTyping) {
      websocket.send(JSON.stringify({ ...userID, status: "typing" }));
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearInterval(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setInterval(() => {
        setTyping(false);
        setIsTyping(false);
      }, 1000);
    }
  }

  function handleSend(type: string, val: string) {
    if (type === "text" && val.trim()) {
      appendMsg({
        type: "text",
        content: { text: val },
        position: "right",
        user: { name: userID.user },
      });
      const data: WSMessage = { ...userID, status: "", message: val };
      console.log(data, userID);
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
        return <Bubble content={content.text} title="content" />;
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
        <Modal
          active={open}
          title="Set Username"
          showClose={false}
          onClose={handleClose}
          actions={[
            {
              label: "Confirm",
              color: "primary",
              inputMode: "text",
              onClick: () => {
                // dispatch({
                //   type: "SET_USER_ID",
                //   userID: { ...state.userID, user: state.username },
                // });
                // dispatch({ type: "SET_HAS_USERNAME", hasUsername: true });
                setUserID({ ...userID, user: username });
                console.log(userID);
                setHasUsername(true);
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
            value={userID.user}
            onChange={(val) => {
              // dispatch({ type: "SET_USERNAME", username: val })
              setUsername(val);
              setUserID({ ...userID, user: val });
            }}
            placeholder="Enter username..."
          />
        </Modal>
      </div>
      <Chat
        locale="en"
        // navbar={{
        //   title: `Test chat ${isConnected ? "🟢" : "🔴reconnecting"}`,
        // }}
        renderNavbar={() => (
          <Nav isConnected={isConnected} handleOpen={handleOpen} />
        )}
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

export function Nav({
  isConnected,
  handleOpen,
}: {
  isConnected: boolean;
  handleOpen: any;
}) {
  return (
    <header className="Navbar">
      <div className="Navbar-left"></div>
      <div className="Navbar-main">
        <h2 className="Navbar-title">
          {`Test chat ${isConnected ? "🟢" : "🔴reconnecting"}`}
        </h2>
      </div>
      <div className="Navbar-right">
        <button
          onClick={() => handleOpen()}
          //  {/* style={{ background: "rgb(75 85 99" }} */}
          style={{
            background: "transparent",
            border: "none",
            color: "black",
            cursor: "pointer",
          }}
          className="rounded bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75"
          aria-expanded="true"
          aria-label="toggle"
        >
          <svg
            style={{
              height: "2rem",
              width: "2rem",
            }}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25"
            ></path>
          </svg>
        </button>
      </div>
    </header>
  );
}
