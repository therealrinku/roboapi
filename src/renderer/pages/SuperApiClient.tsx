import { useRef, useState } from 'react';
import { FiFile, FiSend } from 'react-icons/fi';

export default function SuperApiClient() {
  const reqUrl = useRef(null);
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('Headers');

  const [headers, setHeaders] = useState([{ key: 'Cookie', value: 'pussy' }]);
  const [params, setParams] = useState([]);

  async function sendReq() {
    window.electron.ipcRenderer.sendMessage(
      'send-request',
      reqUrl.current.value,
    );

    window.electron.ipcRenderer.once('send-request', (arg) => {
      setResponse(arg);
    });
  }

  return (
    <div className="flex items-start text-sm">
      <div className="w-[50%] text-sm px-5 mt-5 gap-3 sticky top-5">
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

        <div className="flex items-center gap-5 mt-2">
          <button
            onClick={() => setActiveTab('Headers')}
            className={`${activeTab === 'Headers' ? 'font-bold' : ''}`}
          >
            Headers
          </button>
          <button
            onClick={() => setActiveTab('Body')}
            className={`${activeTab === 'Body' ? 'font-bold' : ''}`}
          >
            Body
          </button>
          <button
            onClick={() => setActiveTab('Params')}
            className={`${activeTab === 'Params' ? 'font-bold' : ''}`}
          >
            Params
          </button>
        </div>

        <div className="mt-2 border-t">
          {activeTab === 'Headers' && (
            <div>
              {headers.map((header) => {
                return (
                  <p key={header.key}>
                    {header.key} {header.value}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-[50%] pt-5 border-l min-h-screen overflow-x-hidden px-5">
        <pre>{JSON.stringify(response, null, 2)}</pre>
      </div>
    </div>
  );
}
