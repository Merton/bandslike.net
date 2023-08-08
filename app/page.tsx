'use client';

import ForceGraph from "@/components/ForceGraph";
import { useChat } from "ai/react";
import { useState } from "react";

// type SearchParamType = { [key: string]: string | undefined }
type Artist = {
  name: string,
  about: string | null,
  explanation: string | null,
  url: string | null
}
type Results = {
  recommendations: Artist[],
  relevancy_matrix: any[]
}

const formatIntoGraphData = (originalArtist: string, results: Results) => {
  const allArtists = [{ name: originalArtist, about: null, explanation: null, url: null }, ...results.recommendations]
  const nodes = allArtists.map((artist: Artist) => ({ id: artist.name, about: artist.about, description: artist.explanation, url: artist.url }))
  let links = results.relevancy_matrix.map((row: string[], index: number) => (
    row.map((value, innerIndex) => (
      { source: nodes[index].id, target: nodes[innerIndex].id, width: parseInt(value) ?? 1 }
    ))
  )).flat().filter((link) => link.source !== link.target)

  // Normalise widths between 1 and 10
  const max = Math.max(...links.map((link) => link.width))
  const min = Math.min(...links.map((link) => link.width))
  links = links.map((link) => ({ ...link, width: (link.width - min) / (max - min) * 9 + 1 }))

  return { nodes, links }
}

export default function HomePage() {
  const [artist, setArtist] = useState('');
  const amount = 5
  const { input, handleInputChange, handleSubmit, isLoading, messages } =
    useChat({
      body: {
        artist,
        amount,
      },
      // onResponse() {
      //   scrollToBios();
      // },
    });

  const onSubmit = (e: any) => {
    console.log("onSubmit")
    setArtist(input);
    handleSubmit(e);
  };

  const lastMessage = messages[messages.length - 1];
  const recommendations = lastMessage?.role === "assistant" ? JSON.parse(lastMessage.content) : null;
  const graphData = recommendations ? formatIntoGraphData(artist, recommendations) : null;

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1>
        You might like...
      </h1>
      <form onSubmit={onSubmit} className="w-1/2 mt-8">
        <label htmlFor="artist" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
          </div>
          <input 
            value={input}
            onChange={handleInputChange} 
            type="search" 
            name="artist" 
            id="artist" 
            placeholder="Search" 
            required
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
          >
          </input>
          <button type="submit" className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Search
          </button>
        </div>
      </form>

      {isLoading ? <h1>Loading!</h1> : <div>
        <ul className="p-4 list-disc">
          {recommendations?.recommendations.map((item: any) => (
            <li key={item.name} className="mb-2">
              <h1>{item.name}</h1>
              <p>{item.explanation}</p>
            </li>
          ))}
        </ul>

        {/* {graphData && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
              {artist}
            </h2>
            <ForceGraph data={graphData} />
          </div>
        )} */}
      </div>
      }
    </main>
  )
}
