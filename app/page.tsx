'use client';

import { useChat } from "ai/react";
import { useState } from "react";
import { SearchHistory } from '@/components/searchHistory';
import { Progress } from '@/components/ui/progress';
import { BandNetwork } from "@/components/bandNetwork";


export default function HomePage() {
  const [artist, setArtist] = useState("");
  const amount = 3;

  const { input, setInput, handleInputChange, handleSubmit, isLoading, messages } =
    useChat({
      body: {
        artist,
        amount,
      }
    });

  const onSubmit = (e: any) => {
    setArtist(input);
    setInput(input)
    handleSubmit(e);
  };

  const lastMessage = messages[messages.length - 1];
  let recommendations = null;
  let error = null;

  if (!isLoading) {
    const message = lastMessage?.role === "assistant" ? lastMessage.content : null;
    try {
      if (message) {
        console.log("Message length", message.length)
        recommendations = JSON.parse(message);
      }
    } catch (e) {
      error = e + "\n" + message
    }
  }

  const averageResponseLength = 400
  const loadingProgress = lastMessage ? lastMessage.content.length / averageResponseLength * 100 : 0;

  return (
    <main className="flex min-h-screen flex-col items-center">
      <section className="w-full bg-primary p-12">
        <div className="flex flex-wrap items-center max-w-screen-lg m-auto">
          <h1 className="text-4xl min-w-fit md:w-2/5 text-primary-foreground">
            Bands like...<br /><span className="text-cyan-300 underline">{artist}</span>
          </h1>
          <form onSubmit={onSubmit} className="w-full md:w-3/5 mt-8">
            <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">bands like...</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                value={input}
                onChange={(e) => {
                  setArtist(e.target.value)
                  handleInputChange(e);
                }}
                placeholder="bands like..."
                required
                enterKeyHint="go"
                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              <button type="submit" className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Go
              </button>
            </div>
          </form>
        </div>
        {/* <p className="mt-2 mb-2">Designed to help you get out of your music rut by finding similar bands, <br /> and not just the most popular ones.</p> */}
      </section>
      <section className="w-full px-12 py-6">
        <div className="max-w-screen-lg m-auto">
        {messages.length > 0 && <SearchHistory searches={messages.filter((m) => m.role === 'user')}></SearchHistory>}
        {isLoading ? <Progress value={loadingProgress} className="mt-12 mb-12" /> : <>
          {recommendations && (
            <BandNetwork originalArtist={artist} results={recommendations} />
          )}</>
        }
        </div>
      </section>

      {error && <p className="text-red-500">Ah, somethings gone wrong. This happens, give it another go <br />{error}</p>}
    </main>
  )
}
