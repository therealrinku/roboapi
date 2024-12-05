import { useRef, useState } from 'react';
import { ISuperSqlConnectionResponse } from '../global';

interface Props {
  onConnectionSuccess: (dbName: string) => void;
}

export default function SqlClientConnectionForm({
  onConnectionSuccess,
}: Props) {
  const [useConnectionString, setUseConnectionString] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const connectionStringInputRef = useRef<HTMLInputElement>(null);
  const hostInputRef = useRef<HTMLInputElement>(null);
  const dbNameInputRef = useRef<HTMLInputElement>(null);
  const portInputRef = useRef<HTMLInputElement>(null);
  const userInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const caInputRef = useRef<HTMLInputElement>(null);

  function handleConnectDb() {
    setIsLoading(true);

    let connectionUri = null;
    if (useConnectionString) {
      connectionUri = connectionStringInputRef.current?.value;
    } else {
      connectionUri = `postgres://${userInputRef.current?.value}:${passwordInputRef.current?.value}@${hostInputRef.current?.value}:${portInputRef.current?.value}/${dbNameInputRef.current?.value}`;
    }

    window.electron.ipcRenderer.sendMessage('connect-to-db', {
      connectionUri: connectionUri,
      caFilePath: caInputRef.current?.files?.[0]?.path,
    });

    window.electron.ipcRenderer.once('connect-to-db', (resp) => {
      const response = resp as ISuperSqlConnectionResponse;
      if ('error' in response) {
        alert(response.message);
      } else {
        const dbName =
          connectionUri && connectionUri.split(':')[1].replace('//', '');
        onConnectionSuccess(String(dbName));
      }
      setIsLoading(false);
    });
  }

  return (
    <div className="flex flex-col gap-5 py-12 w-full">
      <div className="flex flex-col gap-2">
        <span className="font-bold">Connection</span>
        <select className="bg-gray-100 rounded p-2 w-full outline-none">
          <option>Postgresql</option>
        </select>
      </div>

      {useConnectionString ? (
        <>
          <div className="flex flex-col gap-2">
            <span className="font-bold">Connection String</span>
            <input
              ref={connectionStringInputRef}
              type="text"
              disabled={isLoading}
              className="bg-gray-100 rounded p-2 w-full outline-none"
              required
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <span className="font-bold">Host</span>
            <input
              ref={hostInputRef}
              type="text"
              disabled={isLoading}
              className="bg-gray-100 rounded p-2 w-full outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-bold">Database Name</span>
            <input
              ref={dbNameInputRef}
              type="text"
              disabled={isLoading}
              className="bg-gray-100 rounded p-2 w-full outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-bold">Port</span>
            <input
              ref={portInputRef}
              defaultValue="5432"
              type="text"
              disabled={isLoading}
              className="bg-gray-100 rounded p-2 w-full outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-bold">User</span>
            <input
              ref={userInputRef}
              type="text"
              disabled={isLoading}
              className="bg-gray-100 rounded p-2 w-full outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-bold">Password</span>
            <input
              ref={passwordInputRef}
              type="text"
              disabled={isLoading}
              className="bg-gray-100 rounded p-2 w-full outline-none"
              required
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <span className="font-bold">CA cert file (optional)</span>
        <input
          ref={caInputRef}
          type="file"
          disabled={isLoading}
          className="bg-gray-100 rounded p-2 w-full outline-none"
          required
        />
      </div>

      <button
        className="underline font-bold"
        onClick={() => setUseConnectionString((prev) => !prev)}
      >
        {useConnectionString ? 'Use connection input' : 'Use connection string'}
      </button>

      <button
        disabled={isLoading}
        className="w-full bg-green-500 rounded p-2 text-white font-bold"
        onClick={handleConnectDb}
      >
        Connect
      </button>
    </div>
  );
}
