import ForceGraph from "@/components/ForceGraph";
import { musicRecSystemPrompt } from "@/prompts/system";
import { Configuration, OpenAIApi } from "openai";

type SearchParamType = { [key: string]: string | undefined }
type Artist = {
    name: string,
    about: string | null,
    explanation: string | null,
    url: string | null
}
type Results = {
    recommendations: Artist[],
    relevancy_matrix: any[]
}

export async function getData(artist: string) {
    if (!artist) {
        return { data: "Please provide an artist" }
    }

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(configuration);

    const numRecommendations = 5
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { "role": "system", "content": musicRecSystemPrompt },
            { role: "user", content: artist + ", " + numRecommendations }
        ],
    });


    if (!completion.data) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    const message = completion.data.choices[0]?.message?.content

    if (message) {
        const results = JSON.parse(message)

        return { data: results }
    }
    return { data: message }
}

const formatIntoGraphData = (originalArtist: string, results: Results) => {
    const allArtists = [{ name: originalArtist, about: null, explanation: null, url: null }, ...results.recommendations]
    const nodes = allArtists.map((artist: Artist) => ({ id: artist.name, about: artist.about, description: artist.explanation, url: artist.url }))
    let links = results.relevancy_matrix.map((row: string[], index: number) => (
        row.map((value, innerIndex) => (
            { source: nodes[index].id, target: nodes[innerIndex].id, width: parseInt(value) ?? 1 }
        ))
    )).flat().filter((link) => link.source !== link.target)

    // Normalise widths between 1 and 10
    const max = Math.max(...links.map((link) => link.width))
    const min = Math.min(...links.map((link) => link.width))
    links = links.map((link) => ({ ...link, width: (link.width - min) / (max - min) * 9 + 1 }))

    return { nodes, links }
}

export default async function SearchPage({
    searchParams
}: {
    searchParams: SearchParamType
}
) {
    if (!searchParams.artist) {
        return <h1>Please enter an artist</h1>
    }
    const { data } = await getData(searchParams.artist)
    const graphData = formatIntoGraphData(searchParams.artist, data)
    console.log(data)
    console.log(graphData)
    return (
        <main className="p-4">
            <h1 className="title">Here&apos;s some music similar to {searchParams?.artist}...</h1>
            {/* <ul className="p-4 list-disc">
                {data.recommendations.map((item: any) => (
                    <li key={item.name} className="mb-2">
                        <h1>{item.name}</h1>
                        <p>{item.explanation}</p>
                    </li>
                ))}
            </ul> */}

            {/* <table className="table-auto">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Artist</th>
                        <th>{searchParams.artist}</th>
                        {data.recommendations.map((artist: Artist) => (
                            <th className="px-4 py-2">{artist.name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.relevancy_matrix.map((row: string[], index: number) => (
                        <tr>
                            <td className="border px-4 py-2">{index == 0 ? searchParams.artist : data.recommendations[index - 1]?.name}</td>
                            {row.map((value) => (
                                <td className="border px-4 py-2">{value ?? '-'}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table> */}
            <ForceGraph data={graphData} />
        </main>
    )
}