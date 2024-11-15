import { useRef, useState } from 'react';
import { FiFile, FiSend, FiTrash2 } from 'react-icons/fi';
import Loading from '../components/Loading';

export default function SuperApiClient() {
  const reqUrl = useRef(null);
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('Headers');
  const [loading, setLoading] = useState(false);

  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [params, setParams] = useState([{ key: '', value: '' }]);

  async function sendReq() {
    setLoading(true);

    const activeHeaders = headers.filter(header=>header.key.trim());
    const activeParams = params.filter(param=>param.key.trim());
    
    window.electron.ipcRenderer.sendMessage(
      'send-request',
      {reqUrl: reqUrl.current.value, headers: activeHeaders, params: activeParams }
    );

    window.electron.ipcRenderer.once('send-request', (arg) => {
      setResponse(arg);
      setLoading(false);
    });
  }

  function handleAddHeader() {
    setHeaders((prev) => [...prev, { key: '', value: '' }]);
  }

  function handleChangeHeader(
    type: 'key' | 'value',
    index: number,
    value: string,
  ) {
    const copiedHeaders = [...headers];
    copiedHeaders[index][type] = value;
    setHeaders(copiedHeaders);
  }

  function handleDeleteHeader(index: number) {
    if (index === 0 && headers.length === 1) {
      const copiedHeaders = [...headers];
      copiedHeaders[index].key = '';
      copiedHeaders[index].value = '';
      setHeaders(copiedHeaders);
      return;
    }
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddParams() {
    setParams((prev) => [...prev, { key: '', value: '' }]);
  }

  function handleChangeParams(
    type: 'key' | 'value',
    index: number,
    value: string,
  ) {
    const copiedParams = [...params];
    copiedParams[index][type] = value;
    setParams(copiedParams);
  }

  function handleDeleteParams(index: number) {
    if (index === 0 && headers.length === 1) {
      const copiedParams = [...params];
      copiedParams[index].key = '';
      copiedParams[index].value = '';
      setParams(copiedParams);
      return;
    }
    setParams((prev) => prev.filter((_, i) => i !== index));
  }

  const headersCount = headers.filter((header) => header.key.trim()).length;
  const paramsCount = params.filter((param) => param.key.trim()).length;

  return (
    <div className="flex items-start text-xs max-h-screen overflow-hidden">
      <div className="w-[50%] px-5 gap-3 mt-5">
        <div>
          <p className="font-bold flex items-center gap-2">
            <FiFile /> Unsaved Request
          </p>
          <div className="flex items-center mt-2 pr-3 bg-gray-200 rounded">
            <input
              ref={reqUrl}
              placeholder="Request Url"
              className="w-full bg-inherit outline-none p-2 rounded"
            />
            <button onClick={sendReq}>
              <FiSend />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-5 mt-2">
          <button
            onClick={() => setActiveTab('Headers')}
            className={`${activeTab === 'Headers' ? 'font-bold' : ''}`}
          >
            Headers
            {headersCount > 0 && (
              <span className="bg-gray-200 rounded px-[5px] py-[0.5px] ml-1">
                {headersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('Params')}
            className={`${activeTab === 'Params' ? 'font-bold' : ''}`}
          >
            Params
            {paramsCount > 0 && (
              <span className="bg-gray-200 rounded px-[5px] py-[0.5px] ml-1">
                {paramsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('Body')}
            className={`${activeTab === 'Body' ? 'font-bold' : ''}`}
          >
            Body
          </button>
        </div>

        <div className="mt-2 border-t max-h-[80vh] overflow-y-auto">
          {activeTab === 'Headers' && (
            <div>
              <button
                onClick={handleAddHeader}
                className="mt-2 flex items-center gap-2"
              >
                Add New
              </button>
              {headers.map((header, i) => {
                return (
                  <div
                    key={header.key}
                    className="flex items-center justify-between mt-2"
                  >
                    <input
                      key={header.key}
                      value={header.key}
                      onChange={(e) =>
                        handleChangeHeader('key', i, e.target.value)
                      }
                      type="text"
                      placeholder="Key"
                      className="w-[45%] border p-2 rounded outline-none bg-gray-200"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) =>
                        handleChangeHeader('value', i, e.target.value)
                      }
                      placeholder="Value"
                      className="w-[45%] border p-2 rounded outline-none bg-gray-200"
                    />
                    <button onClick={() => handleDeleteHeader(i)}>
                      <FiTrash2 size={15} color="red" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === 'Params' && (
            <div>
              <button
                onClick={handleAddParams}
                className="mt-2 flex items-center gap-2"
              >
                Add New
              </button>
              {params.map((param, i) => {
                return (
                  <div
                    key={param.key}
                    className="flex items-center justify-between mt-2"
                  >
                    <input
                      value={param.key}
                      onChange={(e) =>
                        handleChangeParams('key', i, e.target.value)
                      }
                      type="text"
                      placeholder="Key"
                      className="w-[45%] border p-2 rounded outline-none bg-gray-200"
                    />
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) =>
                        handleChangeParams('value', i, e.target.value)
                      }
                      placeholder="Value"
                      className="w-[45%] border p-2 rounded outline-none bg-gray-200"
                    />
                    <button onClick={() => handleDeleteParams(i)}>
                      <FiTrash2 size={15} color="red" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-[50%] pt-5 border-l min-h-screen px-5">
        {loading && (
          <div className="h-screen w-full flex flex-col items-center justify-center">
            <Loading />
          </div>
        )}
        {response && !loading && <pre>{JSON.stringify(response, null, 2)}</pre>}
      </div>
    </div>
  );
}
