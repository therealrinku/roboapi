import { useState } from 'react';
import {
  FiArrowLeft,
  FiClipboard,
  FiDatabase,
  FiPlay,
  FiPower,
  FiRotateCw,
  FiTable,
  FiX,
} from 'react-icons/fi';
import Loading from '../components/common/loading';
import {
  ISuperSqlConnectionResponse,
  ISuperSqlDbQueryResponse,
  ISuperSqlDbTables,
  ISuperSqlGetTablesQueryResponse,
  ISuperSqlSendQueryResponse,
} from '../global';
import ConnectionForm from '../components/supersql/connection-form';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { autocompletion } from '@codemirror/autocomplete';
import useSuperApp from '../hooks/use-super-app';
import { pgDataTypes } from '../utils/pg';
import ReactJsonView from '@microlink/react-json-view';

export default function SuperSqlClient() {
  const { quitApp } = useSuperApp();
  const [activeTab, setActiveTab] = useState<'Tables' | 'Query'>('Tables');
  const [query, setQuery] = useState('');

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTables, setLoadingTables] = useState<boolean>(false);
  const [connectedDb, setConnectedDb] = useState<string | null>(null);
  const [dbResponse, setDbResponse] = useState<
    ISuperSqlDbQueryResponse | null | undefined
  >(null);
  const [dbTables, setDbTables] = useState<ISuperSqlDbTables>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Record<string, string> | null>(
    null,
  );

  function fetchTables() {
    setLoadingTables(true);
    window.electron.ipcRenderer.sendMessage('get-db-tables');

    window.electron.ipcRenderer.once('get-db-tables', (resp) => {
      const response = resp as ISuperSqlGetTablesQueryResponse;
      if (response.error) {
        alert(response.message);
      } else if (response.response) {
        const table = JSON.parse(response.response) as {
          rows: [{ table_name: string }];
        };
        setDbTables(table.rows);
      }
      setLoadingTables(false);
    });
  }

  function disconnect() {
    setLoading(true);

    window.electron.ipcRenderer.sendMessage('disconnect-from-db');
    window.electron.ipcRenderer.once('disconnect-from-db', (resp) => {
      const response = resp as ISuperSqlConnectionResponse;
      if ('error' in response) {
        alert(response.message);
      } else {
        setConnectedDb(null);
        setDbResponse(null);
        setSelectedTable(null);
      }
      setLoading(false);
    });
  }

  function sendQuery(query: string) {
    setLoading(true);

    window.electron.ipcRenderer.sendMessage('send-db-query', { query });
    window.electron.ipcRenderer.once('send-db-query', (resp) => {
      const response = resp as ISuperSqlSendQueryResponse;
      if (response.error) {
        alert(response.message);
      } else if (response.response) {
        const dbResp = JSON.parse(
          response.response,
        ) as ISuperSqlDbQueryResponse;
        setDbResponse(dbResp);
        setSelectedRow(null);
      }
      setLoading(false);
    });
  }

  const rows = dbResponse ? dbResponse.rows : [];

  //@ts-expect-error
  function tableAutoCompletions(context) {
    let word = context.matchBefore(/\w*/);
    if (word.from == word.to && !context.explicit) return null;
    return {
      from: word.from,
      options: dbTables.map((table) => {
        return {
          label: table.table_name,
          type: 'keyword',
        };
      }),
    };
  }

  return (
    <div className="flex items-start text-xs max-h-screen overflow-hidden">
      <div className="w-[20%] gap-3 mt-5">
        {!connectedDb && (
          <div className="px-5">
            <div className="absolute bottom-0 left-0 h-8 border-t w-[25%] flex items-center">
              <button
                className="flex items-center gap-2 font-bold h-full bg-gray-200 px-5"
                onClick={quitApp}
              >
                <FiArrowLeft size={15} />
                Back
              </button>
            </div>
            <ConnectionForm
              onConnectionSuccess={(dbName) => {
                setConnectedDb(dbName);
                fetchTables();
              }}
            />
          </div>
        )}

        {connectedDb && (
          <div className="absolute bottom-0 left-0 h-8 border-t w-[20%] flex items-center">
            <button
              className="flex items-center font-bold px-5 bg-red-500 h-full"
              onClick={disconnect}
            >
              <FiPower size={15} color="white" />
            </button>

            <div className="flex items-center gap-2 bg-gray-100 h-full px-5">
              <FiDatabase size={15} />
              {connectedDb}
            </div>

            {connectedDb && activeTab === 'Query' && (
              <div className="flex items-center gap-5 ml-auto pr-5">
                <button
                  disabled={loading}
                  className="font-bold flex items-center gap-2"
                  onClick={() => sendQuery(query)}
                >
                  <FiPlay size={15} /> Run
                </button>
              </div>
            )}
          </div>
        )}

        {connectedDb && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-5 mx-5">
              <button
                className={`${activeTab === 'Tables' && 'font-bold'} flex items-center gap-2 outline-none`}
                onClick={() => setActiveTab('Tables')}
              >
                Tables
                <button
                  className="font-bold flex items-center gap-2"
                  onClick={fetchTables}
                  disabled={loadingTables}
                >
                  <FiRotateCw size={13} />
                </button>
              </button>
              <button
                className={`${activeTab === 'Query' && 'font-bold'}`}
                onClick={() => setActiveTab('Query')}
              >
                Query
              </button>
            </div>

            {activeTab === 'Tables' && (
              <div className="flex flex-col items-start">
                {loadingTables && (
                  <p className="font-bold text-center mt-2 px-5">
                    Loading tables...
                  </p>
                )}
                {!loadingTables &&
                  dbTables.map((row) => {
                    return (
                      <button
                        className={`${selectedTable === row.table_name ? 'bg-gray-100' : ''} py-2 w-full flex gap-2 items-center outline-none pl-5`}
                        key={row.table_name}
                        onClick={() => {
                          sendQuery(`select * from ${row.table_name}`);
                          setSelectedTable(row.table_name);
                        }}
                      >
                        <FiTable />
                        <p className="max-w-[80%] truncate">{row.table_name}</p>
                      </button>
                    );
                  })}
              </div>
            )}

            {activeTab === 'Query' && (
              <CodeMirror
                value={query}
                onChange={(e) => setQuery(e)}
                height="80vh"
                className="border outline-none"
                extensions={[
                  sql(),
                  autocompletion({ override: [tableAutoCompletions] }),
                ]}
              />
            )}
          </div>
        )}
      </div>

      <div className="w-[80%] border-l min-h-screen">
        {loading && (
          <div className="h-screen w-full flex flex-col items-center justify-center">
            <Loading />
          </div>
        )}

        {selectedRow && (
          <div className="fixed right-0 top-0 z-50 bg-white w-[25%] h-screen border-l break-all shadow-lg">
            <div className="w-full flex items-center gap-4 px-3 py-1">
              <button
                className="ml-auto"
                onClick={() =>
                  navigator.clipboard.writeText(JSON.stringify(selectedRow))
                }
              >
                <FiClipboard size={15} />
              </button>
              <button className="" onClick={() => setSelectedRow(null)}>
                <FiX size={17} />
              </button>
            </div>

            <ReactJsonView
              src={selectedRow}
              enableClipboard={false}
              style={{
                fontFamily: 'Geist',
                padding: '15px',
                overflowY: 'auto',
                height: '95%',
              }}
              displayObjectSize={false}
              displayDataTypes={false}
              displayArrayKey={false}
              iconStyle="circle"
            />
          </div>
        )}

        {!loading && dbResponse && (
          <div>
            <div className="h-[100vh] overflow-auto pb-8">
              <table className="table-auto border-collapse w-full border-b">
                <thead>
                  <tr>
                    {dbResponse.fields.map((field, idx) => {
                      //@ts-expect-error
                      const dataType = pgDataTypes[field.dataTypeID];
                      return (
                        <td
                          key={idx}
                          className="px-4 py-2 text-left bg-gray-200 sticky top-0 whitespace-nowrap"
                        >
                          {field.name}{' '}
                          <span className="text-gray-500">{dataType}</span>
                        </td>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex: number) => (
                    <tr
                      key={rowIndex}
                      className={`even:bg-gray-100 hover:bg-gray-200 hover:cursor-pointer ${selectedRow?.index === rowIndex.toString() && 'outline-1 outline-dotted outline-green-500'}`}
                      onClick={() => {
                        if (selectedRow?.index === rowIndex.toString()) {
                          setSelectedRow(null);
                        } else {
                          setSelectedRow({
                            ...row,
                            index: rowIndex.toString(),
                          });
                        }
                      }}
                    >
                      {Object.values(row).map((col, colIndex) => (
                        <td
                          key={colIndex}
                          title={col}
                          className="py-2 px-4 w-48 max-w-48 overflow-hidden truncate"
                        >
                          {col}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {rows.length === 0 && (
                <p className="p-5 text-center">no rows found</p>
              )}
            </div>

            <div className="absolute bottom-0 right-0 pl-5 h-8 border-t w-[80%] flex items-center gap-5 bg-white border-l">
              <span className="flex items-center gap-1">
                <FiTable size={15} />
                {selectedTable}
              </span>
              <span>
                <b>{rows.length}</b> rows
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
