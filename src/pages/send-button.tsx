"use client";
import { useState } from "react";
import { useCoordinates } from "./coordinates-context";

type SendButtonProps = {
  setResponse: (s: JSX.Element[]) => void;
};

const SendButton = ({ setResponse }: SendButtonProps) => {
  const [input, setInput] = useState("");
  const [step, setStep] = useState<"city" | "business">("city");
  const [city, setCity] = useState("");
  const [business, setBusiness] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setCoordinates } = useCoordinates();

  const handleSend = async () => {
    if (step === "city") {
      setCity(input);
      setStep("business");
      setInput(""); // clear input for the next question
      setResponse([<span key="cityPrompt">What type of business is it?</span>]);
    } else if (step === "business") {
      setIsLoading(true);
      setBusiness(input);
      try {
        const response = await fetch(`/api/chat-bot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city, business: input }),
        });
        const data = await response.json();
        
        // Add artificial delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setResponse(data.content.split("\n").map((s:string, i:number) => <span key={i}>{s}</span>));
        setStep("city");
        setCity("");
        setBusiness("");
        setCoordinates(data.coordinates);
      } finally {
        setIsLoading(false);
        setInput("");
      }
    }
    if (step === "city") {
      setInput("");
    }
  };

  return (
    <div className="flex w-full">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={step === "city" ? "Enter a city..." : "Enter a business type..."}
        className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none text-black"
        disabled={isLoading}
      />
      <button
        onClick={handleSend}
        className={`bg-blue-500 text-white p-2 rounded-r-lg flex items-center justify-center min-w-[80px] ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
        }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
        ) : (
          'Send'
        )}
      </button>
    </div>
  );
};

export default SendButton;