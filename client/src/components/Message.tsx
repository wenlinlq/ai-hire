import React, { useState, useEffect } from "react";

interface MessageProps {
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
  onClose: () => void;
}

const Message: React.FC<MessageProps> = ({
  type,
  message,
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeClass = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-[#4CAF50] text-green-800";
      case "error":
        return "bg-red-50 border-[#F44336] text-red-800";
      case "warning":
        return "bg-yellow-50 border-[#FF9800] text-yellow-800";
      case "info":
      default:
        return "bg-blue-50 border-primary-500 text-blue-800";
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
      <div className={`${getTypeClass()} border-l-4 p-4 rounded shadow-sm`}>
        <div className="flex items-start">
          <div className="flex-1">
            <p className="text-sm">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-neutral-500 hover:text-neutral-700 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

interface MessageState {
  id: number;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

let messageId = 0;

const MessageContainer: React.FC = () => {
  const [messages, setMessages] = useState<MessageState[]>([]);

  const addMessage = (
    type: "success" | "error" | "info" | "warning",
    message: string,
    duration?: number,
  ) => {
    const id = messageId++;
    setMessages((prev) => [...prev, { id, type, message, duration }]);
  };

  const removeMessage = (id: number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  // 导出消息方法
  if (!window.message) {
    window.message = {
      success: (msg: string, duration?: number) =>
        addMessage("success", msg, duration),
      error: (msg: string, duration?: number) =>
        addMessage("error", msg, duration),
      info: (msg: string, duration?: number) =>
        addMessage("info", msg, duration),
      warning: (msg: string, duration?: number) =>
        addMessage("warning", msg, duration),
    };
  }

  return (
    <>
      {messages.map((msg) => (
        <Message
          key={msg.id}
          type={msg.type}
          message={msg.message}
          duration={msg.duration}
          onClose={() => removeMessage(msg.id)}
        />
      ))}
    </>
  );
};

declare global {
  interface Window {
    message: {
      success: (message: string, duration?: number) => void;
      error: (message: string, duration?: number) => void;
      info: (message: string, duration?: number) => void;
      warning: (message: string, duration?: number) => void;
    };
  }
}

export default MessageContainer;
