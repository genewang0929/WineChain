import { createContext, useState } from "react";

export const RoleContext = createContext();

export function RoleProvider({ children }) {
  const [role, setRole] = useState(null); 
  const [accountsInfo, setAccountsInfo] = useState({
    winery: null,
    distributor: null,
    retailer: null,
    regulator: null,
    consumer: null,
  });

  return (
    <RoleContext.Provider value={{ role, setRole, accountsInfo, setAccountsInfo }}>
      {children}
    </RoleContext.Provider>
  );
}
