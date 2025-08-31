import{R as r}from"./index-R2V08a_e.js";import{w as l,e as a}from"./index-C-PFODCg.js";import{T as u}from"./Timer-Yijg6dgA.js";function p(){const[o,t]=r.useState(5);return r.useEffect(()=>{const e=setInterval(()=>t(m=>Math.max(0,m-1)),300);return()=>clearInterval(e)},[]),r.createElement(u,{secondsLeft:o,totalSeconds:5})}const v={title:"UI/Design/Timer",component:p,parameters:{docs:{description:{component:"Countdown display demo"}}}},n={play:async({canvasElement:o})=>{const t=l(o),e=t.getByTestId("timer-text");await a(e).toBeInTheDocument(),await a(t.getByRole("status",{name:"timer"})).toBeInTheDocument(),await a(e).toHaveAttribute("aria-live","polite"),await a(e).toHaveAttribute("aria-atomic","true")}};var s,c,i;n.parameters={...n.parameters,docs:{...(s=n.parameters)==null?void 0:s.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    const el = c.getByTestId('timer-text');
    await expect(el).toBeInTheDocument();
    // a11y: role and live region
    await expect(c.getByRole('status', {
      name: 'timer'
    })).toBeInTheDocument();
    await expect(el).toHaveAttribute('aria-live', 'polite');
    await expect(el).toHaveAttribute('aria-atomic', 'true');
  }
}`,...(i=(c=n.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};const x=["Default"];export{n as Default,x as __namedExportsOrder,v as default};
