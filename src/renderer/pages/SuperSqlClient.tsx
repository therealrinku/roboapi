import { useRef, useState } from 'react';
import { FiClipboard, FiPlay, FiPower, FiSend, FiTable } from 'react-icons/fi';
import Loading from '../components/Loading';
import useSuperApp from '../hooks/useSuperApp';

export default function SuperSqlClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryRef = useRef<HTMLTextAreaElement>(null);
  const caInputRef = useRef<HTMLInputElement>(null);
  const { quitApp } = useSuperApp();

  const [activeTab, setActiveTab] = useState<'Tables' | 'Query'>('Tables');

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTables, setLoadingTables] = useState<boolean>(false);
  const [connectedDb, setConnectedDb] = useState(null);
  const [dbResponse, setDbResponse] = useState(null);
  const [dbTables, setDbTables] = useState([]);

  function fetchTables() {
    setLoadingTables(true);
    window.electron.ipcRenderer.sendMessage('get-db-tables');

    window.electron.ipcRenderer.once('get-db-tables', (resp) => {
      if (resp.error) {
        alert(resp.message);
      } else {
        setDbTables(JSON.parse(resp.response).rows);
      }
      setLoadingTables(false);
    });
  }

  function connect() {
    setLoading(true);
    window.electron.ipcRenderer.sendMessage('connect-to-db', {
      connectionUri: inputRef.current?.value,
      caFilePath: caInputRef.current?.files?.[0]?.path,
    });

    window.electron.ipcRenderer.once('connect-to-db', (resp) => {
      if (resp.error) {
        alert(resp.message);
      } else {
        setConnectedDb(inputRef.current?.value);
        fetchTables();
      }
      setLoading(false);
    });
  }

  function disconnect() {
    setLoading(true);
    window.electron.ipcRenderer.sendMessage('disconnect-from-db');
    window.electron.ipcRenderer.once('disconnect-from-db', (resp) => {
      if (resp.error) {
        alert(resp.message);
      } else {
        setConnectedDb(null);
        setDbResponse(null);
      }
      setLoading(false);
    });
  }

  function sendQuery(customQuery?: string) {
    setLoading(true);
    const q = customQuery ? customQuery : queryRef.current?.value;
    window.electron.ipcRenderer.sendMessage('send-db-query', {
      query: q,
    });
    window.electron.ipcRenderer.once('send-db-query', (resp) => {
      if (resp.error) {
        alert(resp.message);
      } else {
        setDbResponse(resp.response);
      }
      setLoading(false);
    });
  }

  const rows = dbResponse ? JSON.parse(dbResponse).rows : [];
  return (
    <div className="flex items-start text-xs max-h-screen overflow-hidden">
      <div className="w-[45%] px-5 gap-3 mt-5">
        <div className="absolute bottom-0 left-0 pl-5 py-2 border-t w-[45%] flex items-center gap-5">
          <button
            className="flex items-center gap-2 font-bold"
            onClick={quitApp}
          >
            <FiPower size={15} />
          </button>
          {connectedDb && activeTab === 'Query' && (
            <div className="flex items-center gap-5 ml-auto pr-5">
              <button
                className="font-bold"
                onClick={() =>
                  queryRef.current ? (queryRef.current.value = '') : () => {}
                }
              >
                Clear Query
              </button>
              <button
                disabled={loading}
                className="font-bold flex items-center gap-2"
                onClick={sendQuery}
              >
                <FiPlay /> Execute Query
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-bold">PostgresSQL connection string</span>
          <input
            ref={inputRef}
            type="text"
            disabled={loading || connectedDb ? true : false}
            className="bg-gray-100 rounded p-2 w-full outline-none"
          />
          <span className="font-bold">CA cert file (optional)</span>
          <input
            ref={caInputRef}
            type="file"
            disabled={loading || connectedDb ? true : false}
            className="bg-gray-100 rounded p-2 w-full outline-none"
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
            <div className="flex items-center gap-5">
              <button
                className={`${activeTab === 'Tables' && 'font-bold'}`}
                onClick={() => setActiveTab('Tables')}
              >
                Tables
              </button>
              <button
                className={`${activeTab === 'Query' && 'font-bold'}`}
                onClick={() => setActiveTab('Query')}
              >
                Query
              </button>
            </div>

            {activeTab === 'Tables' && (
              <div className="flex flex-col gap-2 items-start">
                {dbTables.map((row) => {
                  return (
                    <button
                      className="py-2 w-full bg-gray-100 rounded flex items-center gap-2 outline-none pl-2"
                      key={row.table_name}
                      onClick={() =>
                        sendQuery(`select * from ${row.table_name}`)
                      }
                    >
                      <FiTable />
                      {row.table_name}
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'Query' && (
              <textarea
                placeholder="Enter SQL Query"
                ref={queryRef}
                className="bg-gray-100 w-full h-[58vh] p-2 outline-none rounded mt-2"
              />
            )}
          </div>
        )}
      </div>

      <div className="w-[55%] border-l min-h-screen">
        {loading && (
          <div className="h-screen w-full flex flex-col items-center justify-center">
            <Loading />
          </div>
        )}

        {!loading && dbResponse && (
          <div className="h-[100vh] overflow-auto">
            <table className="table-auto border-collapse border-r border-b">
              <thead>
                <tr>
                  {Object.keys(rows[0]).map((key, colIndex) => (
                    <th
                      key={colIndex}
                      className="border border-gray-300 px-4 py-2 text-left bg-gray-200 sticky top-0"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((col: any, colIndex) => (
                      <td
                        key={colIndex}
                        title={col}
                        onDoubleClick={() => navigator.clipboard.writeText(col)}
                        className="border border-gray-300 p-2 w-48 max-w-48 overflow-hidden truncate"
                      >
                        {col}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
