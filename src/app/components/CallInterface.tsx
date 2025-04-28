"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import agent from "../../../public/agent.png";
import askQuestions from "../../../public/QuestionMayAsk.png";

type Message = {
  type: "user" | "agent";
  text: string;
};

const CallInterface = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioInputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const sampleRate = 16000;

  const questions = [
    "Hello",
    "Hi",
    "How are you?",
    "What is your name?",
    "Where are you from?",
    "What is your purpose?",
    "How can you help me?",
    "What time is it?",
    "Tell me a joke",
    "Thank you!",
    "Bye",
  ];

  const toggleQuestionsPopup = () => {
    setShowQuestions(!showQuestions);
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartCall = async () => {
    try {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        console.log("WebSocket connection already established.");
        return;
      }

      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.CLOSING
      ) {
        console.log("WebSocket connection is closing. Please wait.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const socket = new WebSocket("ws://localhost:8000");
      socketRef.current = socket;

      const audioContext = new ((window.AudioContext as typeof AudioContext) ||
        (window as any).webkitAudioContext)({
        sampleRate: sampleRate,
      });
      audioContextRef.current = audioContext;

      const audioInput = audioContext.createMediaStreamSource(stream);
      audioInputRef.current = audioInput;

      const bufferSize = 2048;
      const numberOfInputChannels = 1;
      const numberOfOutputChannels = 1;
      const scriptProcessor = audioContext.createScriptProcessor(
        bufferSize,
        numberOfInputChannels,
        numberOfOutputChannels
      );
      scriptProcessorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const rawAudio = inputBuffer.getChannelData(0);

        // Convert to 16-bit PCM
        const int16Array = new Int16Array(rawAudio.length);
        for (let i = 0; i < rawAudio.length; i++) {
          const s = Math.max(-1, Math.min(1, rawAudio[i]));
          int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        if (
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN
        ) {
          socketRef.current.send(int16Array.buffer);
        }
      };

      audioInput.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      setIsRinging(true);
      setTimeout(() => {
        if (socket.readyState === WebSocket.OPEN) {
          setIsRinging(false);
          setIsCalling(true);
        } else {
          console.error("WebSocket not connected yet!");
        }
      }, 3000);

      socket.onopen = () => {
        console.log("WebSocket connected!");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "transcription") {
            if (data.userText) {
              setMessages((prev) => [
                ...prev,
                { type: "user", text: data.userText },
              ]);
            }
            if (data.agentReply) {
              setMessages((prev) => [
                ...prev,
                { type: "agent", text: data.agentReply },
              ]);
            }
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket connection failed:", error);
        setIsRinging(false);
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleEndCall = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioInputRef.current) {
      audioInputRef.current.disconnect();
      audioInputRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsCalling(false);
    setIsRinging(false);
    setMessages([]);
    console.log("Call ended");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Agent Info */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ahmed Jawabreh</h2>
        <p className="text-gray-500">Customer Support</p>
      </div>

      {/* Agent Image */}
      <div className="mb-8">
        <Image
          src={agent}
          height={150}
          width={150}
          objectFit="cover"
          alt="AI Agent"
          className="rounded-full mx-auto border-4 border-blue-400 shadow-lg"
        />
      </div>

      {/* Chat Section */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 overflow-y-auto h-96 mb-6">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-10">
            Start speaking to the agent...
          </p>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            } mb-3`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs ${
                msg.type === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-700 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex justify-between items-center flex-row-reverse w-full max-w-md ">
        {/* Qustions Popup */}
        <div className="relative ">
          <Image
            onClick={toggleQuestionsPopup}
            src={askQuestions}
            height={50}
            width={50}
            objectFit="cover"
            alt="AI Agent"
            className="rounded-full mx-auto border-4 cursor-pointer"
          />

          {showQuestions && (
            <div className="absolute bottom-0 left-[253px] transform -translate-x-1/2 bg-white p-6 rounded-lg shadow-lg w-100">
              <h3 className="text-xl font-bold mb-4">How to Use</h3>
              <p className="text-gray-700 mb-4">
                To get started, click the 'Call Agent' button to initiate the
                call. Once you're connected, you can ask the agent any of the
                questions listed below.
              </p>
              <h3 className="text-xl font-bold mb-4">Questions you can ask:</h3>
              <ul className="list-disc pl-5">
                {questions.map((question, index) => (
                  <li key={index} className="text-gray-700">
                    {question}
                  </li>
                ))}
              </ul>
              <button
                onClick={toggleQuestionsPopup}
                className="mt-4 bg-red-500 text-white py-2 px-4 rounded-full"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Call Control button*/}
        <div className="flex flex-col items-center">
          {!isCalling ? (
            <>
              {!socketRef.current ? (
                <button
                  onClick={handleStartCall}
                  className="bg-blue-500 cursor-pointers text-white py-3 px-8 rounded-full text-lg shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out"
                >
                  Call Agent
                </button>
              ) : (
                <>
                  {isRinging && (
                    <div className="text-red-500 font-bold text-xl mb-4">
                      Ringing...
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <button
              onClick={handleEndCall}
              className="bg-red-500 text-white py-3 px-8 rounded-full text-lg shadow-lg hover:bg-red-600 transition duration-300 ease-in-out"
            >
              End Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallInterface;
