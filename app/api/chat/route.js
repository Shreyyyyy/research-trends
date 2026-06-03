import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req) {
  const { messages, context } = await req.json();

  if (!messages || !Array.length) {
    return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendChunk = (text) => {
        controller.enqueue(encoder.encode(text));
      };

      const hasGroq = !!process.env.GROQ_API_KEY;

      if (!hasGroq) {
        // Sandbox mode RAG chat simulation
        await handleSandboxChat(messages, context, sendChunk);
        controller.close();
        return;
      }

      try {
        const latestMessage = messages[messages.length - 1].content;
        
        const systemPrompt = `You are a helpful Research Assistant Chatbot. Use the following context of research papers/articles from the last 30 days to answer the user's question.
If the answer is not in the context, use your general research knowledge but note that it's outside the direct search findings.
Structure your answer clearly, using bullet points or formatting where appropriate.

Context of collected research:
${context || 'No research papers collected yet.'}`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.5,
            stream: true
          })
        });

        if (!groqRes.ok) {
          throw new Error(`Groq API responded with status ${groqRes.status}`);
        }

        const reader = groqRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('data: ')) {
              if (cleanLine === 'data: [DONE]') continue;
              try {
                const parsed = JSON.parse(cleanLine.substring(6));
                const text = parsed.choices[0]?.delta?.content || '';
                if (text) {
                  sendChunk(text);
                }
              } catch (e) {
                // Ignore parsing errors of partial chunks
              }
            }
          }
        }
      } catch (err) {
        console.error("Groq chat API error:", err);
        sendChunk(`*Error calling Groq API: ${err.message}. Switching to Sandbox chat response...*\n\n`);
        await handleSandboxChat(messages, context, sendChunk);
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

// Sandbox Mode chat responses based on query
async function handleSandboxChat(messages, context, sendChunk) {
  const latestMessage = messages[messages.length - 1].content.toLowerCase();
  
  let response = "";
  if (latestMessage.includes("gap") || latestMessage.includes("future")) {
    response = `Based on the collected research, the primary **research gaps** identified include:
1. **Physical Scaling Limits**: Current thermal dissipation architectures are insufficient for real-world deployments exceeding 1,000 active nodes.
2. **Security & State Leakage**: Standard encryption protocols are highly vulnerable during state extraction cycles, which represents a critical cryptographic vulnerability.
3. **Hybrid Code Standardization**: There are no unified standards or library frameworks supporting neural co-processing architectures, making implementations highly vendor-dependent.

*How can I help you explore these gaps further?*`;
  } else if (latestMessage.includes("summary") || latestMessage.includes("breakthrough")) {
    response = `Here is a quick summary of the **latest breakthroughs** from the last 30 days:
- **Error Minimization**: Error rates in scaling algorithms have been compressed by 42%, approaching commercial-grade tolerances.
- **Inference Accelerators**: Coupling deep neural networks with physical models resulted in a **10-fold increase** in compilation and inference speed.
- **Side-Channel Analysis**: Critical leaks were mapped during execution state transitions, pointing researchers to new cybersecurity solutions.`;
  } else {
    response = `I've analyzed the current research workspace context. The collected papers explore experimental methodologies, computational scaling, and system integration.

Key insights:
- **MIT's study** focuses on error reduction and algorithms.
- **Stanford's hardware trial** outlines physical limits and heating.
- **Oxford's hybrid models** details deep neural network integration.

Could you specify what aspect you'd like to investigate (e.g. security, performance, hardware constraints, or timeline)?`;
  }

  // Stream the response with typing effect simulation
  const words = response.split(' ');
  for (let i = 0; i < words.length; i++) {
    sendChunk(words[i] + ' ');
    await sleep(Math.min(50, Math.floor(Math.random() * 40) + 15));
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
