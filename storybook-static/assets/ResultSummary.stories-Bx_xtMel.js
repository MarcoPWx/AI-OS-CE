import{w as c,e as a}from"./index-C-PFODCg.js";import{R as m}from"./ResultSummary-8mU3NRta.js";import"./index-R2V08a_e.js";const l={title:"UI/Quiz/ResultSummary",component:m,args:{score:8,total:10,percent:80,xp:120,maxStreak:4},parameters:{docs:{description:{component:"Shows summary of results — score, percent, XP, max streak."}}}},e={play:async({canvasElement:n})=>{const t=c(n);await a(t.getByTestId("result-summary")).toBeInTheDocument(),await a(t.getByTestId("result-score")).toHaveTextContent("8/10 (80%)")}};var s,r,o;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('result-summary')).toBeInTheDocument();
    await expect(c.getByTestId('result-score')).toHaveTextContent('8/10 (80%)');
  }
}`,...(o=(r=e.parameters)==null?void 0:r.docs)==null?void 0:o.source}}};const y=["Default"];export{e as Default,y as __namedExportsOrder,l as default};
