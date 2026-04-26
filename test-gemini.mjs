

const apiKey = 'AIzaSyD9Jz650ijiKzTPlKi05qBOWLeM_aF4iBU';
const model = 'gemini-1.5-pro';

const prompt = `You are an intelligent AI form filler. 

## User Profile Data
\`\`\`json
{
  "firstName": "Havinash",
  "lastName": "Gangisetty",
  "email": "havinash@example.com"
}
\`\`\`

## Response Constraints
- Tone: professional
- Length: moderate

## Form Fields To Fill
\`\`\`json
[
  {
    "index": 0,
    "label": "Full name",
    "name": "fullname",
    "type": "text",
    "placeholder": ""
  },
  {
    "index": 1,
    "label": "Email address",
    "name": "email",
    "type": "email",
    "placeholder": ""
  }
]
\`\`\`

## INSTRUCTIONS
1. Analyze the User Profile Data heavily.
2. For each Form Field, determine the best value from the profile data.
3. If it is a name, email, or phone field, use EXACT values. Do not invent details.
4. If it is a dropdown (has options), you MUST select the exact string from the options array.
5. If it requires a paragraph/essay, use the Tone/Length constraint and generate a rich answer using the profile's rawInfo or experience.
6. If the profile doesn't have the info, leave value as an empty string "".

CRITICAL: Respond ONLY with a valid JSON object matching this schema exactly (no markdown formatting or text outside the JSON):
{
  "suggestions": [
    { "index": <number>, "value": "<string>", "confidence": <float> }
  ]
}`;

async function run() {
  console.log("Calling Gemini API...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a precise form-filling assistant. Always respond with valid JSON only.\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("API Error:", err);
      return;
    }

    const data = await response.json();
    console.log("Response text:", data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

run();
