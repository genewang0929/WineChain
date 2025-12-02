import { createContext, useState } from "react";

export const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRole] = useState(null);

  const [accountsInfo, setAccountsInfo] = useState({
    winery: null,
    distributor: null,
    retailer: null,
    regulator: null,
    consumer: null,
  });

  const value = {
    role,
    setRole,
    accountsInfo,
    setAccountsInfo,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}
