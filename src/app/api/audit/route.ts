import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
    try {
        const { code } = await req.json();
        
        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 });
        }

        const prompt = `You are an expert AI Smart Contract Auditor pointing out common vulnerabilities, gas inefficiencies, a risk score, and suggestions.
Analyze this Solidity code and return the result STRICTLY as a JSON object with this EXACT structure:
{
  "riskScore": 85,
  "vulnerabilities": ["Reentrancy in withdraw function", "Unchecked external call"],
  "gasInefficiencies": ["Use ++i instead of i++", "Cache array length in state loop"],
  "suggestions": ["Add nonReentrant modifier", "Use SafeMath or ^0.8.0 compiler"]
}
If no issues, riskScore should be low, but always return valid JSON matching that structure.

Code to audit:
${code}`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.2
        });

        const resultStr = completion.choices[0]?.message?.content || '{}';
        const result = JSON.parse(resultStr);
        
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Audit error:", error.message || error);
        return NextResponse.json({ error: "Failed to audit contract: " + (error.message || "") }, { status: 500 });
    }
}
