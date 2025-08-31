import{r as i,R as a}from"./index-R2V08a_e.js";import{h as c,H as l,d as Te}from"./index-BptGKHon.js";import{w as r,u as o,e as s}from"./index-C-PFODCg.js";import{D as fe}from"./DefaultsChip-CQdNt6TR.js";const D=[{path:"/api/lessons",method:"GET"},{path:"/api/quizzes",method:"GET"},{path:"/api/cache",method:"GET"},{path:"/api/ratelimit",method:"GET"},{path:"/api/login",method:"POST"},{path:"/api/tooltips/generate",method:"POST"}];function ze(){const[t,e]=i.useState(D[0]),[p,I]=i.useState(!1),[we,L]=i.useState(null),[C,k]=i.useState(null),[G,P]=i.useState(null),[q,S]=i.useState(null),[R,Ee]=i.useState(""),[u,xe]=i.useState(!1),O=t.method==="POST",Be=i.useMemo(()=>{if(O){const n=t.path==="/api/login"?{email:"demo@quizmentor.app"}:t.path==="/api/tooltips/generate"?{input:R}:{};return{method:"POST",headers:{"Content-Type":"application/json",...u?{"x-msw-no-defaults":"1"}:{}},body:JSON.stringify(n)}}return{method:"GET",headers:{"x-client-id":"storybook",...u?{"x-msw-no-defaults":"1"}:{}}}},[t,O,R,u]),ve=async()=>{I(!0),L(null),k(null),P(null),S(null);try{const n=await fetch(t.path,Be);L(n.status);const y=n.headers.get("content-type")||"";if(n.status===304)k({note:"Not Modified (ETag match)"});else if(n.ok)if(y.includes("application/json")){const m=await n.json();k(m)}else{const m=await n.text();P(m)}else{const m=await n.text();S(m||`HTTP ${n.status}`)}}catch(n){S((n==null?void 0:n.message)||"Network error")}finally{I(!1)}},d=async n=>{await fetch("/__msw__/defaults",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n==="slower"?{latencyMs:300,errorRate:0}:n==="flaky"?{latencyMs:100,errorRate:.2}:n==="chaos"?{latencyMs:500,errorRate:.5}:{latencyMs:0,errorRate:0})})};return a.createElement("div",{style:{padding:16,maxWidth:820}},a.createElement("h3",null,"API Playground (MSW)"),a.createElement("div",{style:{display:"flex",gap:12,alignItems:"center",marginBottom:12}},a.createElement(fe,null),a.createElement("div",{style:{display:"flex",gap:8}},a.createElement("button",{onClick:()=>d("default")},"Default"),a.createElement("button",{onClick:()=>d("slower")},"Slower"),a.createElement("button",{onClick:()=>d("flaky")},"Flaky"),a.createElement("button",{onClick:()=>d("chaos")},"Chaos")),a.createElement("label",{style:{marginLeft:"auto"}},a.createElement("input",{type:"checkbox",checked:u,onChange:n=>xe(n.target.checked)})," ","No defaults (x-msw-no-defaults)")),a.createElement("div",{style:{display:"flex",gap:8,alignItems:"center",marginBottom:12}},a.createElement("label",null,"Endpoint:",a.createElement("select",{"aria-label":"endpoint",value:`${t.method} ${t.path}`,onChange:n=>{const[y,m]=n.target.value.split(" "),be=D.find(H=>H.method===y&&H.path===m);e(be)}},D.map(n=>a.createElement("option",{key:`${n.method} ${n.path}`},`${n.method} ${n.path}`)))),O&&a.createElement("input",{"aria-label":"input",placeholder:t.path==="/api/tooltips/generate"?"Enter text (use TRIGGER_*)":"POST body preset",value:R,onChange:n=>Ee(n.target.value),style:{width:300}}),a.createElement("button",{onClick:ve,disabled:p},p?"Loading…":"Call API")),a.createElement("div",{style:{fontFamily:"monospace",whiteSpace:"pre-wrap",background:"#0b1020",color:"#d7e0ff",padding:12,borderRadius:8}},a.createElement("div",null,"Status: ",we??"-"),q&&a.createElement("div",{style:{color:"#ff6b6b"}},"Error: ",q),C&&a.createElement(a.Fragment,null,a.createElement("div",null,"Data:"),a.createElement("pre",{"aria-label":"response"},JSON.stringify(C,null,2))),G&&a.createElement(a.Fragment,null,a.createElement("div",null,"Raw:"),a.createElement("pre",{"aria-label":"raw"},G))))}const De={title:"API/Playground",component:ze,parameters:{helpDoc:"?path=/story/specs-service-catalog--page#msw",helpTitle:"Service Catalog — MSW",docs:{description:{component:"Interactive API Playground powered by MSW. Select an endpoint and call it. Responses are mocked with caching (ETag), rate-limiting (429), and sample data. See also: /docs/mocks/SERVICE_MOCKING_COVERAGE.md"}},chromatic:{viewports:[375,768,1280]}}},g={play:async({canvasElement:t})=>{const e=r(t);await o.click(e.getByRole("button",{name:/call api/i})),await s(e.getByText(/status:/i)).toBeInTheDocument(),await s(e.getByLabelText("response")).toHaveTextContent("lessons")}},h={parameters:{docs:{description:{story:"Overrides GET /api/lessons to return 500 for this story only."}},msw:{handlers:[c.get("/api/lessons",async()=>new l("Server error (simulated)",{status:500,headers:{"Content-Type":"text/plain"}}))]}},play:async({canvasElement:t})=>{const e=r(t);await o.click(e.getByRole("button",{name:/call api/i})),await s(e.getByText(/status: 500/i)).toBeInTheDocument(),await s(e.getByText(/server error/i)).toBeInTheDocument()}},T={parameters:{docs:{description:{story:"Overrides GET /api/lessons to delay 2 seconds to simulate a slow network."}},msw:{handlers:[c.get("/api/lessons",async()=>(await Te(2e3),l.json({lessons:[]})))]}},play:async({canvasElement:t})=>{const e=r(t);await o.click(e.getByRole("button",{name:/call api/i})),await s(e.getByText(/status: 200/i)).toBeInTheDocument(),await s(e.getByLabelText("response")).toHaveTextContent("lessons")}},w={parameters:{docs:{description:{story:"Overrides GET /api/lessons to return an empty set, demonstrating empty states."}},msw:{handlers:[c.get("/api/lessons",async()=>l.json({lessons:[]}))]}},play:async({canvasElement:t})=>{const e=r(t);await o.click(e.getByRole("button",{name:/call api/i})),await s(e.getByText(/status: 200/i)).toBeInTheDocument(),await s(e.getByLabelText("response")).toHaveTextContent("lessons")}},E={parameters:{docs:{description:{story:"Overrides GET /api/quizzes to return 500 for this story only."}},msw:{handlers:[c.get("/api/quizzes",async()=>new l("Server error (simulated)",{status:500}))]}},play:async({canvasElement:t})=>{const e=r(t);await o.selectOptions(e.getByLabelText("endpoint"),"GET /api/quizzes"),await o.click(e.getByRole("button",{name:/call api/i})),await s(e.getByText(/status: 500/i)).toBeInTheDocument()}},x={parameters:{docs:{description:{story:"Overrides GET /api/quizzes to return an empty set, for empty-state demos."}},msw:{handlers:[c.get("/api/quizzes",async()=>l.json({quizzes:[]}))]}},play:async({canvasElement:t})=>{const e=r(t);await o.selectOptions(e.getByLabelText("endpoint"),"GET /api/quizzes"),await o.click(e.getByRole("button",{name:/call api/i})),await s(e.getByText(/status: 200/i)).toBeInTheDocument(),await s(e.getByLabelText("response")).toHaveTextContent("quizzes")}},B={parameters:{docs:{description:{story:"Overrides POST /api/login to return 401 unauthorized."}},msw:{handlers:[c.post("/api/login",async()=>new l("Unauthorized",{status:401}))]}},play:async({canvasElement:t})=>{const e=r(t);await o.selectOptions(e.getByLabelText("endpoint"),"POST /api/login"),await o.click(e.getByRole("button",{name:/call api/i})),await s(e.getByText(/status: 401/i)).toBeInTheDocument(),await s(e.getByText(/unauthorized/i)).toBeInTheDocument()}},v={parameters:{docs:{description:{story:"Overrides POST /api/login to delay 2 seconds then succeed."}},msw:{handlers:[c.post("/api/login",async({request:t})=>{await Te(2e3);const e=await t.json().catch(()=>({})),p=(e==null?void 0:e.email)||"demo@quizmentor.app";return l.json({token:"delayed-token",user:{id:"demo",email:p}})})]}},play:async({canvasElement:t})=>{const e=r(t);await o.selectOptions(e.getByLabelText("endpoint"),"POST /api/login"),await o.click(e.getByRole("button",{name:/call api/i})),await s(e.getByText(/status: 200/i)).toBeInTheDocument(),await s(e.getByLabelText("response")).toHaveTextContent("token")}},b={parameters:{docs:{description:{story:"Forces GET /api/cache to always return 304 Not Modified."}},msw:{handlers:[c.get("/api/cache",async()=>new l(null,{status:304,headers:{ETag:'"demo-etag-abc123"',"Cache-Control":"public, max-age=60"}}))]}},play:async({canvasElement:t})=>{const e=r(t);await o.selectOptions(e.getByLabelText("endpoint"),"GET /api/cache"),await o.click(e.getByRole("button",{name:/call api/i})),await s(e.getByText(/status: 304/i)).toBeInTheDocument(),await s(e.getByText(/not modified/i)).toBeInTheDocument()}},f={parameters:{docs:{description:{story:"Demonstrates 429 Too Many Requests after exceeding rate limit."}}},play:async({canvasElement:t})=>{const e=r(t);await o.selectOptions(e.getByLabelText("endpoint"),"GET /api/ratelimit");for(let p=0;p<4;p++)await o.click(e.getByRole("button",{name:/call api/i}));await s(e.getByText(/status: 429/i)).toBeInTheDocument(),await s(e.getByText(/rate_limited/i)).toBeInTheDocument()}},z={parameters:{globals:{theme:"dark"},docs:{description:{story:"Dark theme preview for API Playground."}}}};var j,M,_;g.parameters={...g.parameters,docs:{...(j=g.parameters)==null?void 0:j.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    // Default endpoint is GET /api/lessons
    await userEvent.click(c.getByRole('button', {
      name: /call api/i
    }));
    await expect(c.getByText(/status:/i)).toBeInTheDocument();
    await expect(c.getByLabelText('response')).toHaveTextContent('lessons');
  }
}`,...(_=(M=g.parameters)==null?void 0:M.docs)==null?void 0:_.source}}};var A,N,$;h.parameters={...h.parameters,docs:{...(A=h.parameters)==null?void 0:A.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Overrides GET /api/lessons to return 500 for this story only.'
      }
    },
    msw: {
      handlers: [http.get('/api/lessons', async () => {
        return new HttpResponse('Server error (simulated)', {
          status: 500,
          headers: {
            'Content-Type': 'text/plain'
          }
        });
      })]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', {
      name: /call api/i
    }));
    await expect(c.getByText(/status: 500/i)).toBeInTheDocument();
    await expect(c.getByText(/server error/i)).toBeInTheDocument();
  }
}`,...($=(N=h.parameters)==null?void 0:N.docs)==null?void 0:$.source}}};var F,Q,W;T.parameters={...T.parameters,docs:{...(F=T.parameters)==null?void 0:F.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Overrides GET /api/lessons to delay 2 seconds to simulate a slow network.'
      }
    },
    msw: {
      handlers: [http.get('/api/lessons', async () => {
        await delay(2000);
        return HttpResponse.json({
          lessons: []
        });
      })]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', {
      name: /call api/i
    }));
    // After delay we should get 200 with empty array
    await expect(c.getByText(/status: 200/i)).toBeInTheDocument();
    await expect(c.getByLabelText('response')).toHaveTextContent('lessons');
  }
}`,...(W=(Q=T.parameters)==null?void 0:Q.docs)==null?void 0:W.source}}};var J,U,V;w.parameters={...w.parameters,docs:{...(J=w.parameters)==null?void 0:J.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Overrides GET /api/lessons to return an empty set, demonstrating empty states.'
      }
    },
    msw: {
      handlers: [http.get('/api/lessons', async () => HttpResponse.json({
        lessons: []
      }))]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', {
      name: /call api/i
    }));
    await expect(c.getByText(/status: 200/i)).toBeInTheDocument();
    await expect(c.getByLabelText('response')).toHaveTextContent('lessons');
  }
}`,...(V=(U=w.parameters)==null?void 0:U.docs)==null?void 0:V.source}}};var K,X,Y;E.parameters={...E.parameters,docs:{...(K=E.parameters)==null?void 0:K.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Overrides GET /api/quizzes to return 500 for this story only.'
      }
    },
    msw: {
      handlers: [http.get('/api/quizzes', async () => new HttpResponse('Server error (simulated)', {
        status: 500
      }))]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    // Select the quizzes endpoint
    await userEvent.selectOptions(c.getByLabelText('endpoint'), 'GET /api/quizzes');
    await userEvent.click(c.getByRole('button', {
      name: /call api/i
    }));
    await expect(c.getByText(/status: 500/i)).toBeInTheDocument();
  }
}`,...(Y=(X=E.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,ee,te;x.parameters={...x.parameters,docs:{...(Z=x.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Overrides GET /api/quizzes to return an empty set, for empty-state demos.'
      }
    },
    msw: {
      handlers: [http.get('/api/quizzes', async () => HttpResponse.json({
        quizzes: []
      }))]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText('endpoint'), 'GET /api/quizzes');
    await userEvent.click(c.getByRole('button', {
      name: /call api/i
    }));
    await expect(c.getByText(/status: 200/i)).toBeInTheDocument();
    await expect(c.getByLabelText('response')).toHaveTextContent('quizzes');
  }
}`,...(te=(ee=x.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var ne,ae,se;B.parameters={...B.parameters,docs:{...(ne=B.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Overrides POST /api/login to return 401 unauthorized.'
      }
    },
    msw: {
      handlers: [http.post('/api/login', async () => new HttpResponse('Unauthorized', {
        status: 401
      }))]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText('endpoint'), 'POST /api/login');
    await userEvent.click(c.getByRole('button', {
      name: /call api/i
    }));
    await expect(c.getByText(/status: 401/i)).toBeInTheDocument();
    await expect(c.getByText(/unauthorized/i)).toBeInTheDocument();
  }
}`,...(se=(ae=B.parameters)==null?void 0:ae.docs)==null?void 0:se.source}}};var oe,re,ie;v.parameters={...v.parameters,docs:{...(oe=v.parameters)==null?void 0:oe.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Overrides POST /api/login to delay 2 seconds then succeed.'
      }
    },
    msw: {
      handlers: [http.post('/api/login', async ({
        request
      }) => {
        await delay(2000);
        const body = await request.json().catch(() => ({}) as any);
        const email = (body as any)?.email || 'demo@quizmentor.app';
        return HttpResponse.json({
          token: 'delayed-token',
          user: {
            id: 'demo',
            email
          }
        });
      })]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText('endpoint'), 'POST /api/login');
    await userEvent.click(c.getByRole('button', {
      name: /call api/i
    }));
    await expect(c.getByText(/status: 200/i)).toBeInTheDocument();
    await expect(c.getByLabelText('response')).toHaveTextContent('token');
  }
}`,...(ie=(re=v.parameters)==null?void 0:re.docs)==null?void 0:ie.source}}};var ce,le,pe;b.parameters={...b.parameters,docs:{...(ce=b.parameters)==null?void 0:ce.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Forces GET /api/cache to always return 304 Not Modified.'
      }
    },
    msw: {
      handlers: [http.get('/api/cache', async () => new HttpResponse(null, {
        status: 304,
        headers: {
          ETag: '"demo-etag-abc123"',
          'Cache-Control': 'public, max-age=60'
        }
      }))]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText('endpoint'), 'GET /api/cache');
    await userEvent.click(c.getByRole('button', {
      name: /call api/i
    }));
    await expect(c.getByText(/status: 304/i)).toBeInTheDocument();
    await expect(c.getByText(/not modified/i)).toBeInTheDocument();
  }
}`,...(pe=(le=b.parameters)==null?void 0:le.docs)==null?void 0:pe.source}}};var me,ue,de;f.parameters={...f.parameters,docs:{...(me=f.parameters)==null?void 0:me.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates 429 Too Many Requests after exceeding rate limit.'
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText('endpoint'), 'GET /api/ratelimit');
    // Perform 4 sequential calls; the 4th should be 429
    for (let i = 0; i < 4; i++) {
      await userEvent.click(c.getByRole('button', {
        name: /call api/i
      }));
    }
    await expect(c.getByText(/status: 429/i)).toBeInTheDocument();
    await expect(c.getByText(/rate_limited/i)).toBeInTheDocument();
  }
}`,...(de=(ue=f.parameters)==null?void 0:ue.docs)==null?void 0:de.source}}};var ye,ge,he;z.parameters={...z.parameters,docs:{...(ye=z.parameters)==null?void 0:ye.docs,source:{originalSource:`{
  parameters: {
    globals: {
      theme: 'dark'
    },
    docs: {
      description: {
        story: 'Dark theme preview for API Playground.'
      }
    }
  }
}`,...(he=(ge=z.parameters)==null?void 0:ge.docs)==null?void 0:he.source}}};const Ie=["Default","ErrorLessons","TimeoutLessons","EmptyLessons","ErrorQuizzes","EmptyQuizzes","ErrorLogin","TimeoutLogin","Cache304","RateLimit429","DarkTheme"];export{b as Cache304,z as DarkTheme,g as Default,w as EmptyLessons,x as EmptyQuizzes,h as ErrorLessons,B as ErrorLogin,E as ErrorQuizzes,f as RateLimit429,T as TimeoutLessons,v as TimeoutLogin,Ie as __namedExportsOrder,De as default};
