import { useRef, useState } from 'react';
import { FiPower } from 'react-icons/fi';
import Loading from '../components/Loading';
import useSuperApp from '../hooks/useSuperApp';

export default function SuperSqlClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const caInputRef = useRef<HTMLInputElement>(null);
  const { quitApp } = useSuperApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [connectedDb, setConnectedDb] = useState(null);

  function connect() {
    setLoading(true);
    window.electron.ipcRenderer.sendMessage('connect-to-db', {
      connectionUri: inputRef.current?.value,
      ca: caInputRef?.current?.value,
    });

    window.electron.ipcRenderer.once('connect-to-db', (resp) => {
      if (resp.error) {
        alert('Something went wrong while connecting to the db');
      } else {
        setConnectedDb(inputRef.current?.value);
      }
      setLoading(false);
    });
  }

  function disconnect() {
    setLoading(true);
    window.electron.ipcRenderer.sendMessage('disconnect-from-db');
    window.electron.ipcRenderer.once('disconnect-from-db', (resp) => {
      if (resp.error) {
        alert('Something went wrong while disconnecting from the db');
      } else {
        setConnectedDb(null);
      }
      setLoading(false);
    });
  }

  return (
    <div className="flex items-start text-xs max-h-screen overflow-hidden">
      <div className="w-[50%] px-5 gap-3 mt-5">
        <div className="absolute bottom-0 left-0 pl-5 py-2 border-t w-[50%]">
          <button
            className="flex items-center gap-2 font-bold"
            onClick={quitApp}
          >
            <FiPower size={15} /> Quit
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <button className="mt-2 flex items-center gap-2 font-bold">
            Postgres
          </button>
          <input
            ref={inputRef}
            type="text"
            disabled={loading || connectedDb ? true : false}
            className="bg-gray-100 rounded p-2 w-full outline-none"
            placeholder="Connection Url"
          />
          <button
            className={`w-[25%] ${connectedDb ? 'bg-red-500' : 'bg-green-500'} rounded p-2 text-white font-bold`}
            onClick={connectedDb ? disconnect : connect}
          >
            {connectedDb ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      <div className="w-[50%] border-l min-h-screen">
        {loading && (
          <div className="h-screen w-full flex flex-col items-center justify-center">
            <Loading />
          </div>
        )}
      </div>
    </div>
  );
}
