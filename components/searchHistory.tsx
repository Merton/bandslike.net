"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, X } from "lucide-react"

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
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">
          Recent searches
        </h4>
        {searches.length > 1 && (
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        )
        }
      </div>
      <div className="rounded-md border px-4 py-3 font-mono text-sm">
        {recentSearch?.content}
      </div>
      <CollapsibleContent className="space-y-2">
        {searches.slice(0, -1).map((search, i) => (
          <div key={i} className="rounded-md border px-4 py-3 font-mono text-sm">
            {search.content}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}