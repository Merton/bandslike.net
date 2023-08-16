'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter } from 'next/navigation'
import { useChat } from "ai/react";

import { SearchHistory } from '@/components/searchHistory';
import { Progress } from '@/components/ui/progress';
import { BandNetwork } from "@/components/bandNetwork";

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

export async function generateStaticParams() {
  const pages = [
    { artistSlug: "ben-howard" },
    { artistSlug: "taylor-swift" },
    { artistSlug: "arctic-monkeys" },
  ];
  return pages.map((page) => ({
    artistSlug: page.artistSlug
  }));
}

const parseResponse = (response: string): Result => {
  return JSON.parse(response);
}

export default function HomePage({ params: { artistSlug } }: {
  params: { artistSlug: string };
}) {
  const [artist, setArtist] = useState("");
  const [searches, setSearches] = useState<Search[]>([]);
  const [selectedSearch, setSelectedSearch] = useState<Search | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const submitForm = () => {
    onSubmit(new Event('submit'))
  }

  const updateSelectedSearch = (search: Search) => {
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
      router.replace(encodeURIComponent(artist))
    } catch (e) {
      setError('Could not parse GPT response: ' + e + " " + result);
    }
  }

  const handleNodeClick = (node: { id: string }) => {
    newSearch(node.id);
  }

  const newSearch = (searchArtist: string) => {
    const previouslySearched = searches.find(search => search.originalArtist.toLowerCase() === searchArtist.toLowerCase());
    setError(null);

    if (previouslySearched) {
      updateSelectedSearch(previouslySearched);
    } else {
      router.replace(encodeURIComponent(searchArtist))
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
    if (artistSlug) {
      const decodedArtistSlug = decodeURIComponent(artistSlug);
      console.log("Decoded", decodedArtistSlug)
      setInput(decodedArtistSlug);
      setArtist(decodedArtistSlug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistSlug])

  useEffect(() => {
    const decodedArtistSlug = decodeURIComponent(artistSlug);
    if (decodedArtistSlug === input && decodedArtistSlug !== selectedSearch?.originalArtist) {
      submitForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistSlug, input])

  const lastMessage = messages[messages.length - 1];

  const loadingProgress = lastMessage ? lastMessage.content.length / AVERAGE_RESPONSE_LENGTH * 100 : 0;

  return (
    <main className="mb-[100px]">
      <section className="w-full bg-primary px-3 sm:px-12 py-12">
        <div className="flex flex-wrap items-center max-w-screen-lg mx-auto">
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
      <section className="w-full max-w-screen-lg mx-auto px-3 sm:px-0">
        <div className="py-6">
          {searches.length > 1 &&
            <div className="mb-4"><SearchHistory onClick={(i) => { updateSelectedSearch(searches[i]) }} searches={searches}></SearchHistory></div>
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
        {error && <p className="text-red-500">Ah, somethings gone wrong. This happens, give it another go <br />{error}</p>}

      </section>
      <article className="w-full max-w-screen-lg mx-auto px-3 sm:px-0">
        {!isLoading &&
          <section className="">
            <h2 className="text-2xl font-bold text-gray-900">Bands similar to {artist}</h2>
            <ul className="">
              {selectedSearch?.results.map(({ artist, similarArtists }, i) => (
                <li key={i} className="mb-2">
                  <span className="hover:cursor-pointer" onClick={() => newSearch(artist)}>{artist}</span>
                  <ul className="ml-6">
                    {similarArtists.map((similarArtist, j) => (
                      <li key={j}><span className="hover:cursor-pointer" onClick={() => newSearch(similarArtist)}>{similarArtist}</span></li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        }
        <section className=" text-gray-700">
          <p>
            I&apos;ve often found it frustating trying to find new music.
          </p>
          <p className="mt-2">
            I love stumbling across new artists through recommendations, but sometimes you want something that scratches a certain itch, after you&apos;ve listened to the entire back catalogue of your favourite band of the week.
          </p>
          <p className="mt-2">
            So this is a tool to help you find similar bands, <br />and not just the most popular ones.
          </p>
        </section>
      </article>
    </main>
  )
}
