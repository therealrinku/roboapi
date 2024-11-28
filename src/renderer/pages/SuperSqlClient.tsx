import { useRef, useState } from 'react';
import { FiPower } from 'react-icons/fi';
import Loading from '../components/Loading';
import useSuperApp from '../hooks/useSuperApp';

export default function SuperSqlClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryRef = useRef<HTMLTextAreaElement>(null);
  const caInputRef = useRef<HTMLInputElement>(null);
  const { quitApp } = useSuperApp();

  const [loading, setLoading] = useState<boolean>(false);
  const [connectedDb, setConnectedDb] = useState(null);
  const [dbResponse, setDbResponse] = useState(null);

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

  function sendQuery() {
    setLoading(true);
    window.electron.ipcRenderer.sendMessage('send-db-query', {
      query: queryRef.current?.value,
    });
    window.electron.ipcRenderer.once('send-db-query', (resp) => {
      if (resp.error) {
        alert('Something went wrong while querying the db');
      } else {
        setDbResponse(resp.response);
      }
      setLoading(false);
    });
  }

  const rows = dbResponse ? JSON.parse(dbResponse).rows : [];
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
            disabled={loading}
            className={`w-[25%] ${connectedDb ? 'bg-red-500' : 'bg-green-500'} rounded p-2 text-white font-bold`}
            onClick={connectedDb ? disconnect : connect}
          >
            {connectedDb ? 'Disconnect' : 'Connect'}
          </button>
        </div>

        {connectedDb && (
          <div className="mt-5 flex flex-col gap-2">
            <p className="font-bold">Query</p>
            <textarea
              ref={queryRef}
              className="bg-gray-100 w-full h-[55vh] p-2 outline-none rounded"
            />
            <button
              disabled={loading}
              className="w-[25%] bg-green-500 rounded p-2 text-white font-bold self-end"
              onClick={sendQuery}
            >
              Query
            </button>
          </div>
        )}
      </div>

      <div className="w-[50%] border-l min-h-screen">
        {loading && (
          <div className="h-screen w-full flex flex-col items-center justify-center">
            <Loading />
          </div>
        )}

        {!loading && dbResponse && (
          <table className="min-w-full table-auto border-collapse border border-gray-300 min-h-screen overflow-y-auto">
            <thead>
              <tr>
                {Object.keys(rows[0]).map((key, colIndex) => (
                  <th
                    key={colIndex}
                    className="border border-gray-300 px-4 py-2 text-left bg-gray-100"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex: number) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="border border-gray-300 px-4 py-2"
                    >
                      {col}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
