import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { musicRecSystemPrompt } from '@/prompts/system';

// Create an OpenAI API client (that's edge friendly!)
// const config = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    fetch
});

const fetchCache = 'force-cache';

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
    const { artist, amount } = await req.json();
    // Ask OpenAI for a streaming completion given the prompt
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        stream: true,
        messages: [
            {
                role: 'system',
                content: musicRecSystemPrompt,
            },
            { role: "user", content: artist + ", " + amount }
        ],
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
}