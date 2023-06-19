"use client";
import { useEffect, useState, createContext, useContext } from "react";
import FormMessages, { Message } from "../form/FormMessages";

const userMessagesContext = createContext<{
  messages: Message[];
  addMessage: (Message) => void;
}>({ messages: [], addMessage: () => {} });

const UserMessagesProviderInner = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Message) => {
    setMessages((messages) => [...messages, message]);
  };
  return (
    <userMessagesContext.Provider value={{ messages, addMessage }}>
      {children}
      <FormMessages stateStuff={{ messages }} />
    </userMessagesContext.Provider>
  );
};

export const UserMessagesProvider = ({ children }) => {
  return <UserMessagesProviderInner>{children}</UserMessagesProviderInner>;
};

export const useMessagesContext = () => useContext(userMessagesContext);
