import dynamic from "next/dynamic";
import { useState } from "react";
import SendButton from "./send-button";

export default function Home() {
  const MapChart = dynamic(() => import("./map-chart"), {
    ssr: false,
  });
  const init: JSX.Element[] = [];
  const [res, setRes] = useState(init);
  return (
    <div className="flex justify-center items-center border-red-50">
      <div className="flex sm:w-8/12 h-screen">
        <MapChart />
      </div>
      <div className="flex flex-col h-screen  sm:w-4/12 right-0">
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Messages will be displayed here */}
          <div className="space-y-4">
            <div className="bg-gray-200 text-gray-700 p-4 rounded-lg self-start">
              Hello! How can I help you today?
            </div>
            <div className="bg-blue-500 text-white p-4 rounded-lg self-end">
              Enter business name and city to get security measures
            </div>
            <div className="flex flex-col">{res}</div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex w-100">
            {/* <input
              type="text"
              className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none text-black"
              placeholder="Type your message..."
            /> */}
            <SendButton setResponse={setRes} />
          </div>
        </div>
      </div>
    </div>
  );
}
