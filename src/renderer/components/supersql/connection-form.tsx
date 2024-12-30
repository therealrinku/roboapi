import { useRef, useState } from 'react';
import { ISuperSqlConnectionResponse } from '../../global';

interface Props {
  onConnectionSuccess: (dbName: string) => void;
}

export default function ConnectionForm({ onConnectionSuccess }: Props) {
  const [connectWith, setConnectWith] = useState<
    'connection_string' | 'connection_inputs'
  >('connection_string');
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
    if (connectWith === 'connection_string') {
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
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-2">
        <span className="font-bold">Connect With</span>
        <select
          className="bg-gray-100 rounded p-2 w-full outline-none"
          value={connectWith}
          onChange={(e) =>
            setConnectWith(
              e.target.value as 'connection_string' | 'connection_inputs',
            )
          }
        >
          <option value="connection_string">Connection String</option>
          <option value="connection_inputs">Connection Inputs</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-bold">Connection</span>
        <select className="bg-gray-100 rounded p-2 w-full outline-none">
          <option>Postgresql</option>
        </select>
      </div>

      {connectWith === 'connection_string' ? (
        <>
          <div className="flex flex-col gap-2">
            <span className="font-bold">Connection String</span>
            <input
              title="Connection String"
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
        disabled={isLoading}
        className="w-full bg-green-500 rounded p-2 text-white font-bold"
        onClick={handleConnectDb}
      >
        {isLoading ? 'Connecting....' : 'Connect'}
      </button>
    </div>
  );
}
