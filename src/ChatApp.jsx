import React, { useState, useEffect } from "react";
import axios from "axios";
import { ReactComponent as SendButton } from "./assets/send-message-arrow.svg";

function ChatApp() {
  const [instanceId, setInstanceId] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const API_URL = `https://api.green-api.com`;

  const handleLogin = () => {
    if (instanceId && apiToken) {
      setIsLoggedIn(true);
    } else {
      alert("Введите idInstance и apiTokenInstance.");
    }
  };

  const sendMessage = async () => {
    if (!phoneNumber || !message) {
      alert("Введите номер телефона и сообщение.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/waInstance${instanceId}/SendMessage/${apiToken}`,
        {
          chatId: `${phoneNumber}@c.us`,
          message,
        }
      );
      const currentDate = new Date();
      const hours = String(currentDate.getHours()).padStart(2, "0");
      const minutes = String(currentDate.getMinutes()).padStart(2, "0");
      setMessages([
        ...messages,
        {
          sender: "me",
          time: `${hours} : ${minutes}`,
          text: message,
        },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
      alert("Ошибка отправки сообщения, попробуйте позже.");
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/waInstance${instanceId}/ReceiveNotification/${apiToken}`
      );
      if (!response.data) {
        return;
      }
      if (
        response.data ??
        response.data.body?.messageData?.textMessageData?.textMessage
      ) {
        const receivedMessage =
          response.data.body.messageData.textMessageData.textMessage;
        const currentDate = new Date();
        const hours = String(currentDate.getHours()).padStart(2, "0");
        const minutes = String(currentDate.getMinutes()).padStart(2, "0");
        setMessages([
          ...messages,
          {
            sender: "other",
            time: `${hours} : ${minutes}`,
            text: receivedMessage,
          },
        ]);
        if (response.data) {
          await axios.delete(
            `${API_URL}/waInstance${instanceId}/DeleteNotification/${apiToken}/${response.data.receiptId}`
          );
        }
      }
    } catch (error) {
      console.error("Ошибка получения сообщения:", error);
      alert("Ошибка получения сообщения, попробуйте позже.");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  return (
    <div className="container">
      {!isLoggedIn ? (
        <div className="auth-container">
          <h2 className="text-xl font-bold mb-4">Введите данные Green API</h2>
          <input
            className="border p-2 mb-2 w-full"
            type="text"
            placeholder="idInstance"
            value={instanceId}
            onChange={(e) => setInstanceId(e.target.value)}
          />
          <input
            className="border p-2 mb-4 w-full"
            type="text"
            placeholder="apiTokenInstance"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-xl"
            onClick={handleLogin}
          >
            Войти
          </button>
        </div>
      ) : (
        <div className="container">
          <div className="chat-container">
            <h2 className="text-xl font-bold mb-4">Чат</h2>
            <input
              className="border p-2 mb-2 w-[300px]"
              type="text"
              placeholder="Номер телефона получателя"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <div className=" flex flex-col h-[75%] border p-4 mb-2 overflow-y-scroll bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col w-fit mb-2 px-3 rounded-xl ${
                    msg.sender === "me"
                      ? "self-end bg-green-300"
                      : "self-start bg-gray-300"
                  }`}
                >
                  <span className="block py-1">{msg.text}</span>
                  <span className="text-sm text-gray-500 text-right">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                className="border p-2 flex-1 rounded-md"
                type="text"
                placeholder="Введите сообщение"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <SendButton
                className="cursor-pointer"
                width={32}
                height={32}
                onClick={sendMessage}
              >
                Отправить
              </SendButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatApp;
