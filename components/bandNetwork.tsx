'use client';

import { Search } from '@/app/page';
import dynamic from 'next/dynamic'

const ForceGraph = dynamic(() => import('../components/forceGraph'), { ssr: false });

type Node = {
  id: string,
  level: number
}
type ArtistTypes = {
  source: string,
  immediate: string[],
  secondary: string[]
}
const formatIntoGraphData = ({ originalArtist, results }: Search) => {
  const artistNode = { id: originalArtist, level: 0 };
  const immediateNodes = results.map(({ artist }) => ({ id: artist, level: 1 }));
  const secondaryNodes = results.map(({ similarArtists }) => similarArtists.map((artist) => ({ id: artist, level: 2 }))).flat();


  const links = results.map(({ artist, similarArtists }) => {
    return similarArtists.map((target: string) => ({ source: artist, target }))
  }).flat();

  links.push(...immediateNodes.map(({ id }) => ({ source: originalArtist, target: id })));

  let nodes = [artistNode, ...immediateNodes, ...secondaryNodes];
  // Remove duplicate nodes based on ID
  nodes = nodes.filter((node, index, self) => self.findIndex((n) => n.id === node.id) === index);

  const artists = {
    source: originalArtist,
    immediate: immediateNodes.map(({ id }) => id),
    secondary: secondaryNodes.map(({ id }) => id)
  }

  return { nodes, links, artists }
}

const getNodeColour = (node: { id: string, level: number }, artists: ArtistTypes) => {
  if (node.level === 0) {
    return '#7400B8'
  }
  if (node.level === 1) {
    return '#5E60CE'
  }

  if (node.level === 2) {
    // Red hex
    return '#4ea7df'
  }

  return '#5E60CE'
}


export const BandNetwork = ({
  data
}: {
  data: Search
}) => {
  const { nodes, links, artists } = formatIntoGraphData(data);

  const graphData = {
    nodes,
    links
  }

  return (
    <div className="border-2 border-solid overflow-hidden border-zinc-400 rounded-lg">
      <ForceGraph data={graphData} nodeColor={(node) => getNodeColour(node as Node, artists)} />
    </div>
  )

}