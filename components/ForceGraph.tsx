'use client';

import { ForceGraph2D } from 'react-force-graph';

// const data = {
//     nodes: [
//         { id: 'Harry' },
//         { id: 'Sally' },
//         { id: 'Alice' },
//     ],
//     links: [
//         { source: 'Harry', target: 'Sally', width: 1 },
//         { source: 'Harry', target: 'Alice', width: 10 },
//     ],
// };
// { data }: { data: { nodes: { id: string }[], links: { source: string; target: string }[] }}
export default function ForceGraph({ data }: { data: { nodes: { id: string }[], links: { source: string; target: string }[] }}) {
    return (
        <ForceGraph2D
            graphData={data}
            linkWidth={(link) => link.width}
            linkDirectionalParticles={1}
            nodeLabel={(node) => `<div><h1><strong>Artist: ${node.id}</strong></h1><br/><p><strong>About: </strong>${node.about ?? ''}</p><p><strong>Similarity: </strong>${node.description ?? ''}</p></div>`}
            onNodeClick={(node) => {
                // Open URL
                if (node.url) {
                    window.open(node.url, '_blank');
                }
            }}
        />
    )
}
