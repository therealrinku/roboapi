import { useContext } from 'react';
import { RootContext } from '../context/root-context';
import { IApp } from '../global';

export default function useSuperApp() {
  const { app , setApp} = useContext(RootContext);

  function loadApp(appName:IApp) {
    setApp(appName)
  }

  function quitApp(){
    setApp(null);
  }

  return { app, loadApp, quitApp};
}
