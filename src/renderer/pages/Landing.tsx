import { FiDatabase, FiTool, FiWind } from 'react-icons/fi';
import useSuperApp from '../hooks/useSuperApp';

export default function Landing() {
  const { loadApp } = useSuperApp();

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-white dark:bg-[#1e1e1e] dark:text-white text-sm">
      <div className="flex items-center gap-2">
        <FiWind />
        <p>superapp</p>
      </div>

      <div className="flex items-center gap-5 mt-5">
        <button
          className="border rounded p-5 bg-gray-100 flex flex-col items-center gap-2"
          onClick={() => loadApp('super_api_client')}
        >
          <FiTool size={20} />
          <p>super api client</p>
        </button>
        <button
          className="border rounded p-5 bg-gray-100 flex flex-col items-center gap-2"
          onClick={() => loadApp('super_sql_client')}
        >
          <FiDatabase size={20} />
          <p>super sql client</p>
        </button>
      </div>
    </div>
  );
}
