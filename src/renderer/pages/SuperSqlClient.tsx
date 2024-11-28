import { useState } from 'react';
import { FiPower } from 'react-icons/fi';
import Loading from '../components/Loading';
import useSuperApp from '../hooks/useSuperApp';

export default function SuperSqlClient() {
  const { quitApp } = useSuperApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [connectedDb, setConnectedDb] = useState(null);

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
            type="text"
            className="bg-gray-100 rounded p-2 w-full outline-none"
            placeholder="Connection Url"
          />
          <button className='w-[25%] bg-green-500 rounded p-2 text-white font-bold'>Connect</button>
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
