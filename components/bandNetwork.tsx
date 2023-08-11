import dynamic from 'next/dynamic'

const ForceGraph = dynamic(() => import('@/components/forceGraph'), { ssr: false });

type Results = {
    original_artist: string,
    adjacency_list: { [source: string]: string[] }[]
  }

const formatIntoGraphData = (originalArtist: string, results: Results) => {
    // Combine all artists from recommendations and adjacency_list
    const otherArtists = results.adjacency_list.map((adjacency) => [Object.keys(adjacency)[0], ...adjacency[Object.keys(adjacency)[0]]]).flat();
    const allArtists = [originalArtist, ...otherArtists];

    // Remove duplicates
    const nodes = Array.from(new Set(allArtists)).map((artist) => ({ id: artist }));
  
    const links = results.adjacency_list.map((adjacency) => {
      const source = Object.keys(adjacency)[0];
      const targets = adjacency[source];
      return targets.map((target: string) => ({ source, target }))
    }).flat();
  
    const topLevelArtists = [...results.adjacency_list.map((adjacency) => Object.keys(adjacency)[0])];
    links.push(...topLevelArtists.map((artist) => ({ source: originalArtist, target: artist })));
  
  
    return { nodes, links, otherArtists }
  }

  const getNodeColour = (node: { id: string}, originalArtist: string, otherArtists: string[]) => {
    if (node.id === originalArtist) {
      return 'green'
    }
    if (otherArtists.includes(node.id)) {
        return 'blue'
        }
    return 'blue'
  }


export const BandNetwork = ({
    originalArtist,
    results
}: {
    originalArtist: string,
    results: Results
}) => {
    const { nodes, links, otherArtists } = formatIntoGraphData(originalArtist, results);

    const graphData = {
        nodes,
        links
    }

    return (
        <ForceGraph data={graphData} nodeColor={(node) => getNodeColour(node, originalArtist, otherArtists)}/>
    )

}