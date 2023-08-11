'use client';
import dynamic from 'next/dynamic'

import { useChat } from "ai/react";
import { useState } from "react";

const ForceGraph = dynamic(() => import('../components/ForceGraph'), { ssr: false });

type Artist = {
  name: string,
  about: string | null,
  explanation: string | null,
  url: string | null
}

type Results = {
  adjacency_list: {[source: string]: string[]}[]
}

const formatIntoGraphData = (originalArtist: string, results: Results) => {
  // Combine all artists from recommendations and adjacency_list
  const allArtists = results.adjacency_list.map((adjacency) => [Object.keys(adjacency)[0], ...adjacency[Object.keys(adjacency)[0]]]).flat();
  allArtists.push(originalArtist);
  // Remove duplicates
  const nodes = Array.from(new Set(allArtists)).map((artist) => ({ id: artist }));

  const links = results.adjacency_list.map((adjacency) => {
    const source = Object.keys(adjacency)[0];
    const targets = adjacency[source];
    return targets.map((target: string) => ({ source, target }))
  }).flat();

  const topLevelArtists = [...results.adjacency_list.map((adjacency) => Object.keys(adjacency)[0])];
  links.push(...topLevelArtists.map((artist) => ({ source: originalArtist, target: artist })));

  
  return { nodes, links }
}


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
  let graphData = null;
  let error = null;
  if (!isLoading) {
    const message = lastMessage?.role === "assistant" ? lastMessage.content : null;
    try {
      if (message) {
        recommendations = JSON.parse(message);
      }
    } catch (e) {
      error = message
    }
    graphData = recommendations ? formatIntoGraphData(artist, recommendations) : null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-2xl">
        BandsLike.net
      </h1>
      { messages.length > 0 && <h2>Previous searches</h2> }
      <ul>
      {messages.filter((m) => m.role === 'user').map(m => (
        <li key={m.id}>
          {m.content}
        </li>
      ))}
      </ul>
      <form onSubmit={onSubmit} className="w-1/2 mt-8">
        <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
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
            placeholder="Search"
            required
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <button type="submit" className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Search
          </button>
        </div>
      </form>

      {isLoading ? <h1>Loading!</h1> : <div>
        {graphData && (
            <div className="mt-8 h-100">
              <h2 className="text-2xl font-bold mb-4">
                {artist}
              </h2>
              <ForceGraph data={graphData} />
            </div>
        )}
      </div>
      }

      {error && <p className="text-red-500">{error}</p>}
    </main>
  )
}
