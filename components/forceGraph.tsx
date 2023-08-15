'use client';

import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function ForceGraph({
    data,
    nodeColor
}: {
    data: {
        nodes: { id: string }[],
        links: { source: string; target: string }[]
    },
    nodeColor: (node: { id: string }) => string
}) {
    const fgRef = useRef<any>();
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    const onLoad = () => {
        if (fgRef.current) {
            fgRef.current.zoomToFit(500, 10);
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowSize({ width: window.innerWidth * 0.7, height: window.innerHeight * 0.7 });
        }
    }, []);

    if (!windowSize.width || !windowSize.height) {
        return null;
    }

    return (
        <ForceGraph2D
            width={windowSize.width}
            height={windowSize.height}
            maxZoom={5}
            minZoom={3}
            ref={fgRef}
            onEngineStop={onLoad}
            cooldownTicks={20}
            graphData={data}
            linkWidth={(link) => link.width}
            linkDirectionalParticles={3}
            linkDirectionalParticleSpeed={0.001}
            nodeColor={(node) => nodeColor(node)}
            nodeLabel={(node) => `<div><h1><strong>${node.id}</strong></h1>`}
            onNodeClick={(node) => {
                // Open URL
                if (node.url) {
                    window.open(node.url, '_blank');
                }
            }}
        />
    )
}