import { FiFile, FiSend } from 'react-icons/fi';

export default function SuperApiClient() {
  function getColor(rq: 'GET' | 'POST') {
    return 'bg-red-500';
  }

  return (
    <div className="flex items-start">
      <div className="bg-gray-200 w-[22%] h-screen text-sm flex flex-col items-center">
        <div className="flex flex-col items-center w-full mt-10 gap-2">
          <button className="flex items-center gap-2 hover:bg-gray-300 w-full p-2">
            <span className="text-red-500 font-bold">GET</span>
            <p>order_created hook</p>
          </button>
          <button className="flex items-center gap-2 hover:bg-gray-300 w-full p-2">
            <span className="text-yellow-500 font-bold">POST</span>
            <p>order_created hook</p>
          </button>
        </div>
      </div>

      <div className="w-[88%] text-sm px-5 mt-5 gap-3">
        <p className="font-bold flex items-center gap-2">
          <FiFile /> Order Created Webhook
        </p>
        <div className="flex items-center mt-2 pr-3 bg-gray-200">
          <input
            placeholder="Request Url"
            className="w-full bg-inherit outline-none p-2"
          />
          <button>
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
}
