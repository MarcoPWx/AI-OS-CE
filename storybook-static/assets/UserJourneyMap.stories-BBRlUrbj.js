import{U as C}from"./UserJourneyMap-DNHJgX7E.js";import{w as M,e as o,u as k}from"./index-C-PFODCg.js";import"./index-R2V08a_e.js";const L={title:"Analytics/User Journey Map",component:C,parameters:{layout:"fullscreen",docs:{description:{component:"Interactive user journey visualization showing user flows, drop-off points, conversion funnels, and session analytics."}},helpDocs:[{href:"?path=/story/labs-technology-overview-lab--page",title:"Technology Overview Lab"}]},tags:["autodocs"]},n={args:{}},r={args:{},parameters:{docs:{description:{story:"Journey map focused on new user onboarding flow from landing to first quiz completion."}}}},t={args:{},parameters:{docs:{description:{story:"User flow from quiz selection through completion and results sharing."}}}},s={args:{},parameters:{docs:{description:{story:"Scenario showing high drop-off rates at critical journey points for optimization analysis."}}}},a={args:{},play:async({canvasElement:U})=>{const e=M(U);await o(e.getByText("Landing")).toBeInTheDocument(),await o(e.getByText("Registration")).toBeInTheDocument(),await o(e.getByText("Dashboard")).toBeInTheDocument();const E=e.getByText(/Conversion Rate/i);o(E).toBeInTheDocument();const J=e.getAllByText(/drop-off/i);o(J.length).toBeGreaterThan(0);const j=e.getByText("Registration");await k.click(j)}},i={args:{},parameters:{docs:{description:{story:"Mobile-specific user journey with touch interactions and app-specific flows."}},viewport:{defaultViewport:"mobile1"}}},c={args:{},parameters:{docs:{description:{story:"Journey map for returning users showing shortened flows and direct navigation patterns."}}}};var p,d,u;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {}
}`,...(u=(d=n.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var m,l,g;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Journey map focused on new user onboarding flow from landing to first quiz completion.'
      }
    }
  }
}`,...(g=(l=r.parameters)==null?void 0:l.docs)==null?void 0:g.source}}};var f,y,h;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'User flow from quiz selection through completion and results sharing.'
      }
    }
  }
}`,...(h=(y=t.parameters)==null?void 0:y.docs)==null?void 0:h.source}}};var w,v,T;s.parameters={...s.parameters,docs:{...(w=s.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Scenario showing high drop-off rates at critical journey points for optimization analysis.'
      }
    }
  }
}`,...(T=(v=s.parameters)==null?void 0:v.docs)==null?void 0:T.source}}};var B,x,b;a.parameters={...a.parameters,docs:{...(B=a.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {},
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Check main journey stages are visible
    await expect(canvas.getByText('Landing')).toBeInTheDocument();
    await expect(canvas.getByText('Registration')).toBeInTheDocument();
    await expect(canvas.getByText('Dashboard')).toBeInTheDocument();

    // Check metrics are displayed
    const conversionRate = canvas.getByText(/Conversion Rate/i);
    expect(conversionRate).toBeInTheDocument();

    // Check drop-off indicators
    const dropOffElements = canvas.getAllByText(/drop-off/i);
    expect(dropOffElements.length).toBeGreaterThan(0);

    // Interact with a journey stage
    const registrationStage = canvas.getByText('Registration');
    await userEvent.click(registrationStage);
  }
}`,...(b=(x=a.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};var D,R,I;i.parameters={...i.parameters,docs:{...(D=i.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Mobile-specific user journey with touch interactions and app-specific flows.'
      }
    },
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
}`,...(I=(R=i.parameters)==null?void 0:R.docs)==null?void 0:I.source}}};var S,z,O;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Journey map for returning users showing shortened flows and direct navigation patterns.'
      }
    }
  }
}`,...(O=(z=c.parameters)==null?void 0:z.docs)==null?void 0:O.source}}};const G=["Default","NewUserOnboarding","QuizCompletionFlow","HighDropOffRate","Interactive","MobileJourney","ReturnUserFlow"];export{n as Default,s as HighDropOffRate,a as Interactive,i as MobileJourney,r as NewUserOnboarding,t as QuizCompletionFlow,c as ReturnUserFlow,G as __namedExportsOrder,L as default};
