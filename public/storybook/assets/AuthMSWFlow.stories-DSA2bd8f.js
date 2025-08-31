import{r as l,R as a}from"./index-R2V08a_e.js";import{w as k,u as g,e as y}from"./index-C-PFODCg.js";function O(){const[r,n]=l.useState("testuser@example.com"),[w,L]=l.useState("password123"),[C,c]=l.useState(null),[h,i]=l.useState(null),[T,s]=l.useState(null),[o,b]=l.useState(null),[m,u]=l.useState(!1),P=async()=>{u(!0),s(null),c(null),i(null);try{const e=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:r,password:w})});c(e.status);const t=await e.json().catch(()=>null);e.ok?(i(t),b((t==null?void 0:t.access_token)||null)):s((t==null?void 0:t.error)||`HTTP ${e.status}`)}catch(e){s((e==null?void 0:e.message)||"Network error")}finally{u(!1)}},R=async()=>{u(!0),s(null),c(null),i(null);try{const e=await fetch("/api/auth/session",{headers:o?{Authorization:`Bearer ${o}`}:{}});c(e.status);const t=await e.json().catch(()=>null);e.ok?i(t):s((t==null?void 0:t.error)||`HTTP ${e.status}`)}catch(e){s((e==null?void 0:e.message)||"Network error")}finally{u(!1)}},H=async()=>{u(!0),s(null),c(null),i(null);try{const e=await fetch("/api/auth/logout",{method:"POST",headers:o?{Authorization:`Bearer ${o}`}:{}});c(e.status);const t=await e.json().catch(()=>null);e.ok?(i(t),b(null)):s((t==null?void 0:t.error)||`HTTP ${e.status}`)}catch(e){s((e==null?void 0:e.message)||"Network error")}finally{u(!1)}};return a.createElement("div",{style:{padding:16,maxWidth:680}},a.createElement("h3",null,"Auth (MSW) — Login, Session, Logout"),a.createElement("div",{style:{display:"flex",gap:8,alignItems:"center",marginBottom:12}},a.createElement("label",null,"Email"," ",a.createElement("input",{"aria-label":"email",value:r,onChange:e=>n(e.target.value)})),a.createElement("label",null,"Password"," ",a.createElement("input",{"aria-label":"password",value:w,onChange:e=>L(e.target.value)})),a.createElement("button",{onClick:P,disabled:m},m?"Working…":"Login"),a.createElement("button",{onClick:R,disabled:m||!o},"Check Session"),a.createElement("button",{onClick:H,disabled:m||!o},"Logout")),a.createElement("div",null,"Status: ",C??"-"),T&&a.createElement("div",{style:{color:"#ff6b6b"},"aria-label":"error"},T),h&&a.createElement("pre",{"aria-label":"result",style:{background:"#0b1020",color:"#d7e0ff",padding:8,borderRadius:6}},JSON.stringify(h,null,2)),o&&a.createElement("div",{"aria-label":"token",style:{fontSize:12,opacity:.7}},"token: ",o.slice(0,8),"…"))}const I={title:"Auth/MSW Flow",component:O,parameters:{docs:{description:{component:"Exercises MSW auth endpoints: POST /api/auth/login, GET /api/auth/session, POST /api/auth/logout."}}}},p={play:async({canvasElement:r})=>{const n=k(r);await g.click(n.getByRole("button",{name:/login/i})),await y(n.getByText(/status: 200/i)).toBeInTheDocument(),await y(n.getByLabelText("result")).toHaveTextContent("testuser@example.com")}},d={play:async({canvasElement:r})=>{const n=k(r);await g.clear(n.getByLabelText("password")),await g.type(n.getByLabelText("password"),"short"),await g.click(n.getByRole("button",{name:/login/i})),await y(n.getByText(/status: 401/i)).toBeInTheDocument(),await y(n.getByLabelText("error")).toHaveTextContent(/invalid/i)}};var x,E,S;p.parameters={...p.parameters,docs:{...(x=p.parameters)==null?void 0:x.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    // Use defaults (testuser@example.com / password123)
    await userEvent.click(c.getByRole('button', {
      name: /login/i
    }));
    await expect(c.getByText(/status: 200/i)).toBeInTheDocument();
    await expect(c.getByLabelText('result')).toHaveTextContent('testuser@example.com');
  }
}`,...(S=(E=p.parameters)==null?void 0:E.docs)==null?void 0:S.source}}};var f,v,B;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    await userEvent.clear(c.getByLabelText('password'));
    await userEvent.type(c.getByLabelText('password'), 'short');
    await userEvent.click(c.getByRole('button', {
      name: /login/i
    }));
    await expect(c.getByText(/status: 401/i)).toBeInTheDocument();
    await expect(c.getByLabelText('error')).toHaveTextContent(/invalid/i);
  }
}`,...(B=(v=d.parameters)==null?void 0:v.docs)==null?void 0:B.source}}};const N=["LoginSuccess","LoginFailShortPassword"];export{d as LoginFailShortPassword,p as LoginSuccess,N as __namedExportsOrder,I as default};
