import { PropsWithChildren, createContext } from 'react';

export const RootContext = createContext({});

export function RootContextProvider({ children }: PropsWithChildren) {
  return <RootContext.Provider value={{}}>{children}</RootContext.Provider>;
}
