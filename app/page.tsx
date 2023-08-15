'use client';

import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import { SearchHistory } from '@/components/searchHistory';
import { Progress } from '@/components/ui/progress';
import { BandNetwork } from "@/components/bandNetwork";

import { usePathname, useRouter } from 'next/navigation'

const AVERAGE_RESPONSE_LENGTH = 400;
const NUM_RECOMMENDATIONS = 3;

export type Search = {
  originalArtist: string;
  amount: number;
  results: AdjacencyList[];
}

type Result = {
  originalArtist: string;
  adjacencyList: AdjacencyList[];
}

type AdjacencyList = {
  artist: string;
  similarArtists: string[];
}

const parseResponse = (response: string): Result => {
  return JSON.parse(response);
}

export default function SearchPage({ searchParams: { queryArtist } }: {
  searchParams: {
    queryArtist: string;
  }
}) {
  const [artist, setArtist] = useState("");
  const [searches, setSearches] = useState<Search[]>([]);
  const [selectedSearch, setSelectedSearch] = useState<Search | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nodeClicked, setNodeClicked] = useState(false);

  const pathname = usePathname()
  const router = useRouter()

  const { input, setInput, handleInputChange, handleSubmit, isLoading, messages } =
    useChat({
      body: {
        artist,
        amount: NUM_RECOMMENDATIONS,
      }
    });

  const onSubmit = (e: any) => {
    setArtist(input);
    setInput(input)
    handleSubmit(e);
  };

  const updateSelectedSearch = (search: Search) => {
    const params = new URLSearchParams()
    params.set("queryArtist", search.originalArtist)
    router.push(pathname + "?" + params.toString())
    setSelectedSearch(search);
    return search
  }

  const recordSearchResult = (result: string) => {
    try {
      const { originalArtist, adjacencyList } = parseResponse(result);
      const newSearch = {
        originalArtist,
        amount: NUM_RECOMMENDATIONS,
        results: adjacencyList,
      }
      setSearches([...searches, newSearch]);
      updateSelectedSearch(newSearch);
      
    } catch (e) {
      setError('Could not parse GPT response: ' + e + " " + result);
    }
  }

  const submitForm = () => {
    onSubmit(new Event('submit'))
  }

  const handleNodeClick = (node: { id: string }) => {
    const previouslySearched = searches.find(search => search.originalArtist.toLowerCase() === node.id.toLowerCase());
    if (previouslySearched) {
      updateSelectedSearch(previouslySearched);
    } else {
      setArtist(node.id);
      setError(null);
      setInput(node.id);
      setNodeClicked(true);
    }
  }

  useEffect(() => {
    if (!isLoading && messages.length > 1) {
      const gptRecommendations = messages[messages.length - 1]?.role === "assistant" ? messages[messages.length - 1].content : null;
      if (gptRecommendations) {
        recordSearchResult(gptRecommendations);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, messages])

  useEffect(() => {
    if (queryArtist) {
      setInput(queryArtist);
      setArtist(queryArtist);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryArtist])

  useEffect(() => {
    if (queryArtist === input && queryArtist !== selectedSearch?.originalArtist) {
      submitForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryArtist, input])

  useEffect(() => {
    if (nodeClicked) {
      setNodeClicked(false);
      submitForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeClicked])


  const lastMessage = messages[messages.length - 1];

  const loadingProgress = lastMessage ? lastMessage.content.length / AVERAGE_RESPONSE_LENGTH * 100 : 0;

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
      </section>
      <section className="w-full px-6 py-6">
        <div className="max-w-screen-lg m-auto">
          {searches.length > 1 &&
            <SearchHistory onClick={(i) => { updateSelectedSearch(searches[i]) }} searches={searches}></SearchHistory>
          }
          {isLoading ?
            (<div className="flex flex-col items-center my-12">
              <h3>Finding similar bands to {artist}</h3>
              <Progress value={loadingProgress} className="mt-4" />
            </div>)
            : <>
              {selectedSearch && (
                <BandNetwork onNodeClick={handleNodeClick} data={selectedSearch} />
              )}</>
          }
        </div>
      </section>
      <article className="w-full max-w-screen-sm p-6 text-lg text-gray-700">
        <p>
          I&apos;ve often found it frustating trying to find new music.
        </p>
        <p className="mt-2">
          I love stumbling across new artists through recommendations, but sometimes you want something that scratches a certain itch, after you&apos;ve listened to the entire back catalogue of your favourite band of the week.
        </p>
        <p className="mt-2">
          So this is a tool to help you find similar bands, <br />and not just the most popular ones.
        </p>
      </article>

      {error && <p className="text-red-500">Ah, somethings gone wrong. This happens, give it another go <br />{error}</p>}
    </main>
  )
}
