import React from "react";
import { ReactNode, useContext } from "react";

const UserContext = React.createContext({});

const UserProvider = ({ children }: { children: ReactNode }) => {};

export const useAccount = () => useContext(UserContext);
