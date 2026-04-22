import React, { useState, useRef, useEffect } from "react";
import aiChatApi from "../../api/aiChatApi";

interface Message {
  id: string;
  content: string;
  role: "user" | "ai";
  timestamp: Date;
}

const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // 创建一个临时的AI消息，用于显示打字效果
    const tempAiMessageId = (Date.now() + 1).toString();
    const tempAiMessage: Message = {
      id: tempAiMessageId,
      content: "",
      role: "ai",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempAiMessage]);

    try {
      // 准备上下文（最近5条消息）
      const context = messages
        .slice(-5)
        .map((msg) => ({
          question: msg.role === "user" ? msg.content : "",
          answer: msg.role === "ai" ? msg.content : "",
        }))
        .filter((item) => item.question || item.answer);

      // 模拟流式打字效果
      const response = await aiChatApi.askQuestion({
        question: inputValue,
        context: context.length > 0 ? context : undefined,
      });

      // 实现打字机效果
      let currentContent = "";
      const typingSpeed = 30; // 打字速度（毫秒/字符）

      for (let i = 0; i < response.answer.length; i++) {
        currentContent += response.answer[i];
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAiMessageId
              ? { ...msg, content: currentContent }
              : msg,
          ),
        );
        // 等待一段时间，模拟打字效果
        await new Promise((resolve) => setTimeout(resolve, typingSpeed));
      }
    } catch (error) {
      console.error("发送问题失败:", error);
      // 更新临时消息为错误信息
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAiMessageId
            ? { ...msg, content: "抱歉，我暂时无法回答这个问题。请稍后再试。" }
            : msg,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-700">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">
            AI智能招聘助手
          </h1>
          <p className="text-neutral-600">24小时在线，为你解答招新相关问题</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm h-[600px] flex flex-col">
          {/* 聊天消息区域 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${message.role === "user" ? "bg-primary-100 text-primary-800" : "bg-neutral-100 text-neutral-800"}`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="mt-2 text-xs text-neutral-500 text-right">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-neutral-100 text-neutral-800">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce"></div>
                      <div
                        className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 输入区域 */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入你的问题..."
                disabled={isTyping}
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isTyping || !inputValue.trim()}
                className="rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
              >
                {isTyping ? "发送中..." : "发送"}
              </button>
            </div>
            <p className="mt-2 text-xs text-neutral-500 text-center">
              提示：可以询问关于招新流程、岗位要求、面试准备等问题
            </p>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">常见问题</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "如何准备社团招新面试？",
              "不同岗位的要求是什么？",
              "招新流程是怎样的？",
              "如何提高简历通过率？",
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => setInputValue(question)}
                className="text-left px-4 py-2 rounded hover:bg-blue-100 text-blue-700"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
