"use client"

import * as React from "react"
import { ChevronsLeftRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Search } from "@/app/page"
import { useEffect } from "react"

export const SearchHistory = ({
  searches,
  onClick
}: {
  searches: Search[],
  onClick: (i: number) => void
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const selectSearch = (i: number) => {
    onClick(i)
    setSelectedIndex(i)
    setIsOpen(false)
  }

  useEffect(() => {
    setSelectedIndex(searches.length - 1)
  }, [searches, setSelectedIndex])

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex"
    >
      <div>
        {searches.length > 1 && (
          <CollapsibleTrigger asChild>
            <Button size="lg" className="p-2 px-4 hover:text-white hover:bg-secondary">
              <h4 className="text-lg font-semibold">
                History
              </h4>
              <ChevronsLeftRight className="ml-2 h-5 w-5" />
            </Button>
          </CollapsibleTrigger>
        )
        }
      </div>
      <CollapsibleContent className="flex flex-wrap">
        {searches.map((search, i) => (
          <div onClick={() => selectSearch(i)} key={i} className={`ml-2 h-fit text-white rounded-md px-4 py-3 font-mono text-sm hover:bg-slate-700 hover:cursor-pointer ${selectedIndex == i ? "bg-green-400" : "bg-slate-500" }`}>
            {search.originalArtist}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}