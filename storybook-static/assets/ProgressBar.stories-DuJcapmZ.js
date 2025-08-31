import{w as s,e as t}from"./index-C-PFODCg.js";import{P as c}from"./ProgressBar-DWy1RBCf.js";import"./index-R2V08a_e.js";const m={title:"UI/Design/ProgressBar",component:c,args:{percent:50},parameters:{docs:{description:{component:"Simple progress bar"}}}},e={play:async({canvasElement:i})=>{const a=s(i).getByLabelText("progress");await t(a).toBeInTheDocument(),await t(a).toHaveAttribute("role","progressbar"),await t(a).toHaveAttribute("aria-valuemin","0"),await t(a).toHaveAttribute("aria-valuemax","100"),await t(a).toHaveAttribute("aria-valuenow","50"),await t(a).toHaveAttribute("aria-valuetext","50%")}};var r,o,n;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    const bar = c.getByLabelText('progress');
    await expect(bar).toBeInTheDocument();
    await expect(bar).toHaveAttribute('role', 'progressbar');
    await expect(bar).toHaveAttribute('aria-valuemin', '0');
    await expect(bar).toHaveAttribute('aria-valuemax', '100');
    // default args percent: 50
    await expect(bar).toHaveAttribute('aria-valuenow', '50');
    await expect(bar).toHaveAttribute('aria-valuetext', '50%');
  }
}`,...(n=(o=e.parameters)==null?void 0:o.docs)==null?void 0:n.source}}};const v=["Default"];export{e as Default,v as __namedExportsOrder,m as default};
