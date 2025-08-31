import{r as o,R as e}from"./index-R2V08a_e.js";import{w as b,u as r,e as y}from"./index-C-PFODCg.js";function v(){const[n,t]=o.useState("intro"),[i,a]=o.useState(null),[p,c]=o.useState(null),d=()=>t("question"),E=()=>{c(i===1),t("result")};return e.createElement("div",{style:{maxWidth:420}},n==="intro"&&e.createElement("div",null,e.createElement("h3",null,"Quiz Flow Demo"),e.createElement("button",{type:"button","aria-label":"start-quiz",onClick:d},"Start Quiz")),n==="question"&&e.createElement("div",null,e.createElement("div",{role:"heading","aria-level":4},"What is closure in JavaScript?"),e.createElement("ul",null,e.createElement("li",null,e.createElement("label",null,e.createElement("input",{type:"radio",name:"opt",onChange:()=>a(0)})," Block scope")),e.createElement("li",null,e.createElement("label",null,e.createElement("input",{type:"radio",name:"opt",onChange:()=>a(1)})," Function + environment")),e.createElement("li",null,e.createElement("label",null,e.createElement("input",{type:"radio",name:"opt",onChange:()=>a(2)})," Module pattern"))),e.createElement("button",{type:"button","aria-label":"submit-answer",disabled:i===null,onClick:E},"Submit")),n==="result"&&e.createElement("div",null,e.createElement("div",{"aria-label":"result-text"},p?"Correct!":"Try again"),e.createElement("button",{type:"button","aria-label":"back-home",onClick:()=>{t("intro"),a(null),c(null)}},"Back")))}const C={title:"Flows/QuizFlowDemo",component:v,parameters:{docs:{description:{component:"A tiny quiz flow demo used to validate play() interactions without relying on app screens."}},chromatic:{viewports:[375,768]}}},l={play:async({canvasElement:n})=>{const t=b(n);await r.click(t.getByRole("button",{name:/start quiz/i})),await r.click(t.getByRole("radio",{name:/function \/\+ environment/i})),await r.click(t.getByRole("button",{name:/submit/i})),await y(t.getByLabelText(/result-text/i)).toHaveTextContent("Correct!")}};var s,u,m;l.parameters={...l.parameters,docs:{...(s=l.parameters)==null?void 0:s.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', {
      name: /start quiz/i
    }));
    await userEvent.click(c.getByRole('radio', {
      name: /function \\/\\+ environment/i
    }));
    await userEvent.click(c.getByRole('button', {
      name: /submit/i
    }));
    await expect(c.getByLabelText(/result-text/i)).toHaveTextContent('Correct!');
  }
}`,...(m=(u=l.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};const x=["HappyPath"];export{l as HappyPath,x as __namedExportsOrder,C as default};
