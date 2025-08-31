import{R as t}from"./index-R2V08a_e.js";import{w,u as i,e as x}from"./index-C-PFODCg.js";import{Q as k}from"./QuizQuestion-s4EL5Y_x.js";import{B as S,c as q,n as b,a as D}from"./Button-B9oNP3Nu.js";import{P as Q}from"./ProgressBar-DWy1RBCf.js";import{T as C}from"./Timer-Yijg6dgA.js";import{R as H}from"./ResultSummary-8mU3NRta.js";function R({index:e,total:n,score:c,xp:o,streak:r,maxStreak:a}){return t.createElement("div",{style:{display:"flex",gap:12,alignItems:"center",justifyContent:"space-between",marginBottom:8}},t.createElement("div",null,t.createElement("strong",null,"Progress:")," ",Math.min(e+1,n)," / ",n),t.createElement("div",null,t.createElement("span",{style:{marginRight:10},"data-testid":"hud-score"},t.createElement("strong",null,"Score:")," ",c),t.createElement("span",{style:{marginRight:10},"data-testid":"hud-xp"},t.createElement("strong",null,"XP:")," ",o),t.createElement("span",{"data-testid":"hud-streak"},t.createElement("strong",null,"Streak:")," ",r," (Max ",a,")")))}function z({session:e,onSelect:n,onNext:c,reveal:o=!1,locked:r=!1,secondsLeft:a,totalSeconds:s,showProgress:d=!0}){var l;return t.createElement("div",null,t.createElement(R,{index:e.index,total:e.total,score:e.score,xp:e.xp,streak:e.streak,maxStreak:e.maxStreak}),d&&t.createElement("div",{style:{marginBottom:8}},t.createElement(Q,{percent:(e.index+1)/Math.max(1,e.total)*100})),typeof a=="number"&&typeof s=="number"&&t.createElement("div",{style:{marginBottom:8}},t.createElement(C,{secondsLeft:a,totalSeconds:s})),e.state==="in_progress"&&e.current&&t.createElement(k,{question:e.current.text,options:e.current.options,selectedIndex:((l=e.answers[e.index])==null?void 0:l.selectedIndex)??null,locked:r,revealCorrect:o,correctIndex:e.current.correctIndex,onSelect:n}),e.state==="in_progress"&&t.createElement("div",{style:{marginTop:12}},t.createElement(S,{"data-testid":"next-button",onClick:c},"Next")),e.state==="completed"&&t.createElement("div",{style:{marginTop:12}},t.createElement(H,{score:e.score,total:e.total,percent:e.total>0?Math.round(e.score/e.total*100):0,xp:e.xp,maxStreak:e.maxStreak})))}function M(e,n){const c=[{id:"q1",text:"What is 2+2?",options:["1","2","4","5"],correctIndex:2},{id:"q2",text:"Select the even number",options:["1","2","3","5"],correctIndex:1}],[o,r]=t.useState(()=>q({topic:e,difficulty:n,questions:c}));return{session:o,select:a=>r(s=>D(s,a)),next:()=>r(a=>b(a,c))}}function A(){const{session:e,select:n,next:c}=M("math","easy"),[o,r]=t.useState(!1),[a,s]=t.useState(!1),[d,l]=t.useState(10);t.useEffect(()=>{const p=setInterval(()=>l(B=>Math.max(0,B-1)),500);return()=>clearInterval(p)},[]);function T(p){n(p),r(!0),s(!0)}function h(){r(!1),s(!1),l(10),c()}return t.createElement(z,{session:e,onSelect:T,onNext:h,reveal:a,locked:o,secondsLeft:d,totalSeconds:10})}const W={title:"UI/Quiz/QuizScreen",component:A,parameters:{docs:{description:{component:"Composite quiz screen (HUD + Question + Next). Story uses an internal mock engine to TDD the UI."}}}},u={play:async({canvasElement:e})=>{const n=w(e);await i.click(n.getByTestId("question-option-2")),await x(n.getByTestId("question-option-2")).toHaveAttribute("data-selected","true"),await i.click(n.getByTestId("next-button")),await x(n.getByTestId("hud-score")).toHaveText(/Score:\s+1/)}},m={play:async({canvasElement:e})=>{const n=w(e);await i.click(n.getByTestId("question-option-2")),await i.click(n.getByTestId("next-button")),await i.click(n.getByTestId("question-option-1")),await i.click(n.getByTestId("next-button")),await x(n.getByTestId("result-summary")).toBeInTheDocument()}};var y,g,E;u.parameters={...u.parameters,docs:{...(y=u.parameters)==null?void 0:y.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    // Answer the first question with the correct option (index 2)
    await userEvent.click(c.getByTestId('question-option-2'));
    // Ensure selection is reflected (aria-pressed or data-selected)
    await expect(c.getByTestId('question-option-2')).toHaveAttribute('data-selected', 'true');
    // Next to proceed
    await userEvent.click(c.getByTestId('next-button'));
    // HUD should reflect updated score
    await expect(c.getByTestId('hud-score')).toHaveText(/Score:\\s+1/);
  }
}`,...(E=(g=u.parameters)==null?void 0:g.docs)==null?void 0:E.source}}};var f,I,v;m.parameters={...m.parameters,docs:{...(f=m.parameters)==null?void 0:f.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    // Answer first and next
    await userEvent.click(c.getByTestId('question-option-2'));
    await userEvent.click(c.getByTestId('next-button'));
    // Answer second and next to complete
    await userEvent.click(c.getByTestId('question-option-1'));
    await userEvent.click(c.getByTestId('next-button'));
    await expect(c.getByTestId('result-summary')).toBeInTheDocument();
  }
}`,...(v=(I=m.parameters)==null?void 0:I.docs)==null?void 0:v.source}}};const X=["Default","Completed"];export{m as Completed,u as Default,X as __namedExportsOrder,W as default};
