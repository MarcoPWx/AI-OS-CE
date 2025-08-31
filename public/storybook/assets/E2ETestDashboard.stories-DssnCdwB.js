import{E as U}from"./E2ETestDashboard-ClMHbEFl.js";import{w as H,e as t,u as J}from"./index-C-PFODCg.js";import"./index-R2V08a_e.js";const j={title:"Testing/E2E Test Dashboard",component:U,parameters:{layout:"fullscreen",docs:{description:{component:"End-to-end test execution dashboard showing test results, metrics, trends, and detailed test run information."}}},tags:["autodocs"]},s={args:{}},a={args:{},parameters:{docs:{description:{story:"Dashboard showing all E2E tests passing with 100% success rate."}}}},n={args:{},parameters:{docs:{description:{story:"Dashboard showing some test failures requiring investigation and fixes."}}}},r={args:{},parameters:{docs:{description:{story:"Live view of tests currently executing with real-time updates."}}}},o={args:{},play:async({canvasElement:u})=>{const e=H(u);await t(e.getByText("E2E Test Dashboard")).toBeInTheDocument(),await t(e.getByText(/Auth Flow/i)).toBeInTheDocument(),await t(e.getByText(/Quiz Flow/i)).toBeInTheDocument(),await t(e.getByText(/User Journey/i)).toBeInTheDocument();const p=e.getByText(/Pass Rate/i);t(p).toBeInTheDocument();const L=e.getByText(/Avg Duration/i);t(L).toBeInTheDocument();const Q=e.getByText(/Auth Flow/i);await J.click(Q)}},i={args:{},parameters:{docs:{description:{story:"Shows test execution trends over the last 30 days with pass/fail rates and performance metrics."}}}},c={args:{},parameters:{docs:{description:{story:"Detailed view of individual test results with stack traces, screenshots, and debugging information."}}},play:async({canvasElement:u})=>{const e=H(u),p=await e.findByText(/Failed/i);await J.click(p),await t(e.getByText(/Stack Trace/i)).toBeInTheDocument()}},d={args:{},parameters:{docs:{description:{story:"Dashboard integrated with CI/CD pipeline showing test results from latest builds."}}}};var l,m,g;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {}
}`,...(g=(m=s.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var h,w,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Dashboard showing all E2E tests passing with 100% success rate.'
      }
    }
  }
}`,...(y=(w=a.parameters)==null?void 0:w.docs)==null?void 0:y.source}}};var T,v,D;n.parameters={...n.parameters,docs:{...(T=n.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Dashboard showing some test failures requiring investigation and fixes.'
      }
    }
  }
}`,...(D=(v=n.parameters)==null?void 0:v.docs)==null?void 0:D.source}}};var x,B,f;r.parameters={...r.parameters,docs:{...(x=r.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Live view of tests currently executing with real-time updates.'
      }
    }
  }
}`,...(f=(B=r.parameters)==null?void 0:B.docs)==null?void 0:f.source}}};var I,E,b;o.parameters={...o.parameters,docs:{...(I=o.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {},
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Check main dashboard elements
    await expect(canvas.getByText('E2E Test Dashboard')).toBeInTheDocument();

    // Check test suites are displayed
    await expect(canvas.getByText(/Auth Flow/i)).toBeInTheDocument();
    await expect(canvas.getByText(/Quiz Flow/i)).toBeInTheDocument();
    await expect(canvas.getByText(/User Journey/i)).toBeInTheDocument();

    // Check metrics are visible
    const passRate = canvas.getByText(/Pass Rate/i);
    expect(passRate).toBeInTheDocument();
    const avgDuration = canvas.getByText(/Avg Duration/i);
    expect(avgDuration).toBeInTheDocument();

    // Interact with a test suite
    const authFlow = canvas.getByText(/Auth Flow/i);
    await userEvent.click(authFlow);
  }
}`,...(b=(E=o.parameters)==null?void 0:E.docs)==null?void 0:b.source}}};var k,F,S;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Shows test execution trends over the last 30 days with pass/fail rates and performance metrics.'
      }
    }
  }
}`,...(S=(F=i.parameters)==null?void 0:F.docs)==null?void 0:S.source}}};var C,A,R;c.parameters={...c.parameters,docs:{...(C=c.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Detailed view of individual test results with stack traces, screenshots, and debugging information.'
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Click on a failed test to see details
    const failedTest = await canvas.findByText(/Failed/i);
    await userEvent.click(failedTest);

    // Check that details are shown
    await expect(canvas.getByText(/Stack Trace/i)).toBeInTheDocument();
  }
}`,...(R=(A=c.parameters)==null?void 0:A.docs)==null?void 0:R.source}}};var P,q,z;d.parameters={...d.parameters,docs:{...(P=d.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Dashboard integrated with CI/CD pipeline showing test results from latest builds.'
      }
    }
  }
}`,...(z=(q=d.parameters)==null?void 0:q.docs)==null?void 0:z.source}}};const G=["Default","AllTestsPassing","WithFailures","InProgress","Interactive","HistoricalTrends","DetailedResults","CIIntegration"];export{a as AllTestsPassing,d as CIIntegration,s as Default,c as DetailedResults,i as HistoricalTrends,r as InProgress,o as Interactive,n as WithFailures,G as __namedExportsOrder,j as default};
