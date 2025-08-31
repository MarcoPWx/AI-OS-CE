import{R as s}from"./index-R2V08a_e.js";import{w as m,u as a,e as i}from"./index-C-PFODCg.js";import{Q as y}from"./QuizQuestion-s4EL5Y_x.js";const g={title:"UI/Quiz/QuizQuestion",component:y,args:{question:"What is 2+2?",options:["1","2","4","5"],correctIndex:2},parameters:{docs:{description:{component:"Presentational question with options. Stateless, tested in Storybook first."}}}},n={play:async({canvasElement:t})=>{const e=m(t);await a.click(e.getByTestId("question-option-2")),await i(e.getByTestId("question-option-2")).toBeInTheDocument()}};function b(){const[t,e]=s.useState(null);return s.createElement(y,{question:"Pick the even number",options:["1","2","3","5"],selectedIndex:t,onSelect:w=>e(w),correctIndex:1})}const o={render:()=>s.createElement(b,null),play:async({canvasElement:t})=>{const e=m(t);await a.click(e.getByRole("listbox")),await a.keyboard("{ArrowDown}"),await i(e.getByTestId("question-option-1")).toHaveAttribute("data-selected","true"),await a.keyboard("{Enter}"),await i(e.getByTestId("question-option-1")).toHaveAttribute("data-selected","true")}};var r,c,u;n.parameters={...n.parameters,docs:{...(r=n.parameters)==null?void 0:r.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    // Click option index 2
    await userEvent.click(c.getByTestId('question-option-2'));
    // No visual state assertion beyond click (stateless). Just ensure the button is in the document.
    await expect(c.getByTestId('question-option-2')).toBeInTheDocument();
  }
}`,...(u=(c=n.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var d,l,p;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <Controlled />,
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    // Focus listbox and arrow down into second option
    await userEvent.click(c.getByRole('listbox'));
    await userEvent.keyboard('{ArrowDown}');
    await expect(c.getByTestId('question-option-1')).toHaveAttribute('data-selected', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(c.getByTestId('question-option-1')).toHaveAttribute('data-selected', 'true');
  }
}`,...(p=(l=o.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};const x=["Default","Keyboard"];export{n as Default,o as Keyboard,x as __namedExportsOrder,g as default};
