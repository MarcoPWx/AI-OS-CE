import{S as E}from"./S2SDashboard-okBTv7Bu.js";import{w as I,u as b,e as t}from"./index-C-PFODCg.js";import"./index-R2V08a_e.js";const q={title:"Dashboard/S2S Architecture",component:E,parameters:{layout:"fullscreen",helpDocs:[{href:"?path=/story/labs-technology-overview-lab--page",title:"Technology Overview Lab"}],docs:{description:{component:"Service-to-Service architecture dashboard showing microservice health, communication patterns, and real-time events."}}},tags:["autodocs"]},a={args:{}},s={args:{},parameters:{docs:{description:{story:"All services reporting healthy status with normal traffic patterns."}}}},n={args:{},parameters:{docs:{description:{story:"Some services experiencing issues or degraded performance."}}},play:async({canvasElement:o})=>{const i=await I(o).findByText("auth-service");await b.click(i)}},r={args:{},parameters:{docs:{description:{story:"System under high load with increased request rates across all services."}}}},c={args:{},play:async({canvasElement:o})=>{const e=I(o);await t(e.getByText("auth-service")).toBeInTheDocument(),await t(e.getByText("api-gateway")).toBeInTheDocument(),await t(e.getByText("quiz-service")).toBeInTheDocument();const i=e.getAllByText("Healthy");t(i.length).toBeGreaterThan(0);const D=e.getByText("Recent Events");t(D).toBeInTheDocument()}};var l,h,p;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {}
}`,...(p=(h=a.parameters)==null?void 0:h.docs)==null?void 0:p.source}}};var m,d,u;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'All services reporting healthy status with normal traffic patterns.'
      }
    }
  }
}`,...(u=(d=s.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var v,g,y;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Some services experiencing issues or degraded performance.'
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    // Simulate clicking on a service to see details
    const canvas = within(canvasElement);
    const authService = await canvas.findByText('auth-service');
    await userEvent.click(authService);
  }
}`,...(y=(g=n.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var T,w,S;r.parameters={...r.parameters,docs:{...(T=r.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'System under high load with increased request rates across all services.'
      }
    }
  }
}`,...(S=(w=r.parameters)==null?void 0:w.docs)==null?void 0:S.source}}};var x,B,f;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {},
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Check that all main services are visible
    await expect(canvas.getByText('auth-service')).toBeInTheDocument();
    await expect(canvas.getByText('api-gateway')).toBeInTheDocument();
    await expect(canvas.getByText('quiz-service')).toBeInTheDocument();

    // Check health indicators
    const healthyIndicators = canvas.getAllByText('Healthy');
    expect(healthyIndicators.length).toBeGreaterThan(0);

    // Check that events are being displayed
    const eventsSection = canvas.getByText('Recent Events');
    expect(eventsSection).toBeInTheDocument();
  }
}`,...(f=(B=c.parameters)==null?void 0:B.docs)==null?void 0:f.source}}};const C=["Default","AllHealthy","WithIssues","HighTraffic","Interactive"];export{s as AllHealthy,a as Default,r as HighTraffic,c as Interactive,n as WithIssues,C as __namedExportsOrder,q as default};
