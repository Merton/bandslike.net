'use client';

import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import { SearchHistory } from '@/components/searchHistory';
import { Progress } from '@/components/ui/progress';
import { BandNetwork } from "@/components/bandNetwork";

import { usePathname, useRouter } from 'next/navigation'

export default function HomePage() {
  const [artist, setArtist] = useState("");

  const pathname = usePathname()
  const router = useRouter()

  const onSubmit = (e: any) => {
    e.preventDefault();
    console.log("onSubmit", artist)
    const artistSlug = encodeURIComponent(artist)
    console.log("artistSlug", artistSlug)
    console.log("pathname", pathname + artistSlug)
    router.push(pathname + artistSlug)
  };

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
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
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
      <article className="w-full max-w-screen-lg mx-auto px-3 sm:px-0">
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
