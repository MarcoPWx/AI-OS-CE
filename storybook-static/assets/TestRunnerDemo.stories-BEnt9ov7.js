import{r as u,R as a}from"./index-R2V08a_e.js";import{w as l,e as o,u as m}from"./index-C-PFODCg.js";function p(){const[n,t]=u.useState(0);return a.createElement("div",{style:{padding:16}},a.createElement("div",{"aria-label":"count"},"Count: ",n),a.createElement("button",{type:"button",onClick:()=>t(i=>i+1)},"Increment"))}const C={title:"Testing/Counter",component:p,parameters:{docs:{description:{component:"Simple Counter to verify Storybook Test Runner (play functions) works in CI."}}}},e={play:async({canvasElement:n})=>{const t=l(n);await o(t.getByLabelText(/count/i)).toHaveTextContent("Count: 0"),await m.click(t.getByRole("button",{name:/increment/i})),await o(t.getByLabelText(/count/i)).toHaveTextContent("Count: 1")}};var c,r,s;e.parameters={...e.parameters,docs:{...(c=e.parameters)==null?void 0:c.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/count/i)).toHaveTextContent('Count: 0');
    await userEvent.click(canvas.getByRole('button', {
      name: /increment/i
    }));
    await expect(canvas.getByLabelText(/count/i)).toHaveTextContent('Count: 1');
  }
}`,...(s=(r=e.parameters)==null?void 0:r.docs)==null?void 0:s.source}}};const x=["Default"];export{e as Default,x as __namedExportsOrder,C as default};
