import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { temperatureData } = await request.json()

    // Get API key from environment variable (server-side only)
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return NextResponse.json(
        { 
          error: 'API key not configured',
          insights: [
            'Gemini API key is not configured on the server.',
            'Please add GEMINI_API_KEY to the .env.local file.',
            'Get your free API key from https://aistudio.google.com/apikey'
          ]
        },
        { status: 400 }
      )
    }

    if (!temperatureData || !temperatureData.current || temperatureData.current.length === 0) {
      return NextResponse.json(
        { 
          error: 'No data provided',
          insights: ['No temperature data available for analysis. Please upload a data file.']
        },
        { status: 400 }
      )
    }

    // Prepare data summary
    const current = temperatureData.current
    const dataPoints = current.length

    const prompt = `You are an AI expert in industrial temperature monitoring and predictive maintenance systems. 

Provide 3 professional insights about temperature monitoring in industrial equipment (each under 20 words):

1. [General insight about temperature monitoring patterns and importance]
2. [Insight about temperature threshold management and alerts]
3. [Recommendation for temperature-based predictive maintenance]

Keep each insight professional, actionable, and under 20 words. Focus on industrial temperature monitoring best practices.`

    // Call Gemini API directly using v1 endpoint (works with free API keys)
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    )

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json()
      throw new Error(`API Error: ${errorData.error?.message || apiResponse.statusText}`)
    }

    const data = await apiResponse.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Parse the response into individual insights
    const insights = text.split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3)
    
    if (insights.length > 0) {
      return NextResponse.json({ insights, success: true })
    } else {
      // Fallback if parsing fails
      return NextResponse.json({ insights: [text], success: true })
    }
  } catch (error) {
    console.error('Gemini AI Error:', error)
    return NextResponse.json(
      { 
        error: error.message,
        insights: [
          'Error generating AI analysis. Please check your API key.',
          'Visit .env.local file to add/verify your Gemini API key.',
          'Get your key from https://makersuite.google.com/app/apikey'
        ]
      },
      { status: 500 }
    )
  }
}
