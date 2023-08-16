import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { musicRecSystemPrompt } from '@/prompts/system';

// Create an OpenAI API client (that's edge friendly!)
// const config = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    fetch,
});

// const fetchCache = 'force-cache';

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

    const encoder = new TextEncoder();
    const iterable = response[Symbol.asyncIterator]();
    const stream = new ReadableStream({
        async pull(controller) {
            const chunk = await iterable.next();

            if (chunk.done) {
                controller.close();
            } else {
                const value = chunk.value.choices[0].delta.content;

                if (value) {
                    controller.enqueue(encoder.encode(value));
                }

                await new Promise(r => setTimeout(r, 10)); // if we don't sleep, streaming doesn't work
            }
        },
    });

    // Respond with the stream
    return new StreamingTextResponse(stream);

    // // console.log(response.choices[0].message);
    // // Convert the response into a friendly text-stream
    // const stream = OpenAIStream(response);
    // // Respond with the stream
    // return new StreamingTextResponse(stream)
    //     // return response.choices[0].message;
}