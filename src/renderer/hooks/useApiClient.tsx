import { useContext } from 'react';
import { RootContext } from '../context/root-context';

export default function useApiClient() {
  const context = useContext(RootContext);

  return context;
}
