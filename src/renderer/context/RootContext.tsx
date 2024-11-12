import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useState,
} from 'react';
import { IApp } from '../global';

interface RootContextProps {
  app: IApp;
  setApp: Dispatch<SetStateAction<IApp>>;
}

export const RootContext = createContext<RootContextProps>({
  app: null,
  setApp: () => {},
});

export function RootContextProvider({ children }: PropsWithChildren) {
  const [app, setApp] = useState<IApp>(null);

  return (
    <RootContext.Provider
      value={{
        app,
        setApp,
      }}
    >
      {children}
    </RootContext.Provider>
  );
}
