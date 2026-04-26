"use strict";(()=>{function g(o,s,n){let e=s.data,l=n.defaultTone||s.tonePreference||"professional",t=n.defaultLength||s.lengthPreference||"moderate",a=Object.entries(e).reduce((r,[i,u])=>(u&&typeof u=="string"&&u.trim()!==""&&(r[i]=u),r),{});e.customFields&&Object.entries(e.customFields).forEach(([r,i])=>{i&&(a[r]=i)});let c=o.map((r,i)=>({index:i,label:r.label,name:r.name,type:r.type,placeholder:r.placeholder,options:r.options}));return`You are an intelligent AI form filler. 

## User Profile Data
\`\`\`json
${JSON.stringify(a,null,2)}
\`\`\`

## Response Constraints
- Tone: ${l}
- Length: ${t}

## Form Fields To Fill
\`\`\`json
${JSON.stringify(c,null,2)}
\`\`\`

## INSTRUCTIONS
1. Analyze the User Profile Data heavily.
2. For each Form Field, determine the best value from the profile data.
3. If it is a name, email, or phone field, use EXACT values. Do not invent details.
4. If it is a dropdown (has options), you MUST select the exact string from the options array.
5. If it requires a paragraph/essay, use the Tone/Length constraint and generate a rich answer using the profile's rawInfo or experience.
6. If the field is a checkbox or radio button, output exactly "true" or "false" based on whether it should be selected.
7. If the field type is "date", you MUST output the value exactly in "YYYY-MM-DD" format.
8. If the field type is "time", you MUST output the value exactly in "HH:MM" (24-hour) format.
9. If the profile doesn't have the info, leave value as an empty string "".

CRITICAL: Respond ONLY with a valid JSON object matching this schema exactly (no markdown formatting or text outside the JSON):
{
  "suggestions": [
    { "index": <number>, "value": "<string>", "confidence": <float> }
  ]
}`}async function p(o,s,n){let e=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s}`},body:JSON.stringify({model:n||"gpt-4o",messages:[{role:"system",content:"You are a precise form-filling assistant. Always respond with valid JSON only."},{role:"user",content:o}],temperature:.3,max_tokens:4096})});if(!e.ok){let a=await e.json().catch(()=>({}));throw new Error(a.error?.message||`OpenAI API error: ${e.status}`)}let t=(await e.json()).choices?.[0]?.message?.content||"";return h(t)}async function f(o,s,n){let e=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":s,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:n&&!n.includes("-4-")&&!n.includes("opus")?n:"claude-3-7-sonnet-20250219",max_tokens:4096,messages:[{role:"user",content:o}]})});if(!e.ok){let a=await e.json().catch(()=>({}));throw new Error(a.error?.message||`Anthropic API error: ${e.status}`)}let t=(await e.json()).content?.[0]?.text||"";return h(t)}async function d(o,s,n,e=1){let l=n&&n.includes("gemini")?n:"gemini-2.5-flash";try{let t=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${l}:generateContent?key=${s}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:`You are a precise form-filling assistant. Always respond with valid JSON only.

${o}`}]}],generationConfig:{temperature:.3,responseMimeType:"application/json"}})});if(!t.ok){if((t.status===503||t.status===429)&&e<4)return await new Promise(i=>setTimeout(i,2e3*e)),d(o,s,n,e+1);let r=await t.json().catch(()=>({}));if(r.error?.message?.includes("high demand")||r.error?.message?.includes("Spikes"))return{suggestions:[]};throw new Error(r.error?.message||`Gemini API error: ${t.status}`)}let c=(await t.json()).candidates?.[0]?.content?.parts?.[0]?.text||"";return h(c)}catch(t){if(e<4&&(t.message.includes("fetch")||t.message.includes("Network")))return await new Promise(a=>setTimeout(a,2e3*e)),d(o,s,n,e+1);throw t}}async function m(o,s,n){let e=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s}`},body:JSON.stringify({model:n||"llama-3.3-70b-versatile",messages:[{role:"system",content:"You are a precise form-filling assistant. Always respond with valid JSON only."},{role:"user",content:o}],temperature:.3,max_completion_tokens:4096})});if(!e.ok){let a=await e.json().catch(()=>({}));throw new Error(a.error?.message||`Groq API error: ${e.status}`)}let t=(await e.json()).choices?.[0]?.message?.content||"";return h(t)}function h(o){try{let s=JSON.parse(o);if(s.suggestions)return s}catch{let s=o.match(/```(?:json)?\s*([\s\S]*?)```/);if(s)try{let e=JSON.parse(s[1].trim());if(e.suggestions)return e}catch{}let n=o.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);if(n)try{let e=JSON.parse(n[0]);if(e.suggestions)return e}catch{}}throw new Error("Failed to parse AI response. Please try again.")}chrome.runtime.onMessage.addListener((o,s,n)=>{if(s.id!==chrome.runtime.id)return console.warn("Blocked unauthorized message from:",s.origin),!1;if(o.type==="GENERATE_FILLS"){let{fields:e,profile:l,settings:t}=o.payload,a=g(e,l,t),c,r=i=>(i||"").replace(/[^\x20-\x7E]/g,"").trim();return t.aiProvider==="gemini"?c=d(a,r(t.geminiApiKey),t.geminiModel):t.aiProvider==="anthropic"?c=f(a,r(t.anthropicApiKey),t.anthropicModel):t.aiProvider==="groq"?c=m(a,r(t.groqApiKey),t.groqModel):c=p(a,r(t.openaiApiKey),t.openaiModel),c.then(i=>n(i)).catch(i=>n({suggestions:[],error:i.message})),!0}if(o.type==="DOM_CHANGED")return!1});chrome.runtime.onInstalled.addListener(o=>{o.reason==="install"&&(console.log("FormPilot installed successfully"),chrome.tabs.create({url:chrome.runtime.getURL("landing.html")}))});})();
