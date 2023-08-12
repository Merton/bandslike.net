"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export const SearchHistory = ({
  searches,
}: {
  searches: { role: string; content: string }[]
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const recentSearch = searches[searches.length - 1]

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-[350px] space-y-2"
    >
      <div className="">
        {searches.length > 1 && (
          <CollapsibleTrigger asChild>
            <Button size="lg" className="p-2 px-4 hover:text-white hover:bg-secondary">
              <h4 className="text-lg font-semibold">
                History
              </h4>
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        )
        }
      </div>
      <CollapsibleContent className="space-y-2 absolute">
        {searches.slice(0, -1).map((search, i) => (
          <div key={i} className=" bg-slate-500 text-white rounded-md border px-4 py-3 font-mono text-sm">
            {search.content}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}