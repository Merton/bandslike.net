'use client';
import { useRouter } from 'next/navigation'
import ForceGraph2D from 'react-force-graph-2d';

export default function ForceGraph({ data }: { data: { nodes: { id: string }[], links: { source: string; target: string }[] }}) {
    const router = useRouter();

    return (
        <ForceGraph2D
            graphData={data}
            linkWidth={(link) => link.width}
            linkDirectionalParticles={1}
            nodeLabel={(node) => `<div><h1><strong>Artist: ${node.id}</strong></h1><br/><p><strong>About: </strong>${node.about ?? ''}</p><p><strong>Similarity: </strong>${node.description ?? ''}</p></div>`}
            onNodeClick={(node) => {
                // Open URL
                if (node.url) {
                    router.push(node.url)
                }
            }}
        />
    )
}
