import{R as e,r as u}from"./index-R2V08a_e.js";import{w as q,e as $}from"./index-C-PFODCg.js";const J=[{id:"docs-dx-mdx3",title:"Docs & DX stabilization (MDX3)",status:"In Progress",priority:"P1",owner:"Docs Team",eta:"This sprint",risk:"Low"},{id:"qa-guardrails",title:"QA & Guardrails",status:"Planned",priority:"P1",owner:"QE",eta:"Next sprint",risk:"Medium"},{id:"perf-bundle",title:"Performance & Bundling",status:"Planned",priority:"P2",owner:"Core",eta:"Next sprint",risk:"Medium"}],L=["Planned","In Progress","Blocked","Done"],b=["P0","P1","P2"];function g({children:a}){return e.createElement("span",{style:{display:"inline-block",fontSize:12,padding:"2px 8px",border:"1px solid rgba(255,255,255,0.16)",borderRadius:999,marginRight:6,opacity:.85}},a)}function p(a){const[r,l]=u.useState(a.statusFilter??L),[s,c]=u.useState(a.priorityFilter??b),[n,o]=u.useState(a.search??""),[i,d]=u.useState(!1);e.useEffect(()=>{if(a.loadingDelayMs&&a.loadingDelayMs>0){d(!0);const t=setTimeout(()=>d(!1),Math.min(1e4,a.loadingDelayMs));return()=>clearTimeout(t)}else d(!1)},[a.loadingDelayMs]);const k=!!a.loading||i,T=u.useMemo(()=>a.epics?a.epics.filter(t=>r.includes(t.status)&&s.includes(t.priority)&&(!n||t.title.toLowerCase().includes(n.toLowerCase()))):[],[a.epics,r,s,n]);return e.createElement("div",{style:{padding:16}},e.createElement("h3",null,"Epic Manager"),e.createElement("div",{style:{display:"flex",gap:16,flexWrap:"wrap",alignItems:"center",marginBottom:12}},e.createElement("div",null,e.createElement("div",{style:{fontWeight:600,marginBottom:4}},"Status"),L.map(t=>e.createElement("label",{key:t,style:{marginRight:8}},e.createElement("input",{type:"checkbox",checked:r.includes(t),onChange:w=>{l(m=>w.target.checked?[...m,t]:m.filter(P=>P!==t))}})," ",t))),e.createElement("div",null,e.createElement("div",{style:{fontWeight:600,marginBottom:4}},"Priority"),b.map(t=>e.createElement("label",{key:t,style:{marginRight:8}},e.createElement("input",{type:"checkbox",checked:s.includes(t),onChange:w=>{c(m=>w.target.checked?[...m,t]:m.filter(P=>P!==t))}})," ",t))),e.createElement("div",null,e.createElement("input",{"aria-label":"search",placeholder:"Search epics...",value:n,onChange:t=>o(t.target.value)}))),k&&e.createElement("div",{"aria-label":"loading"},"Loading epics…"),a.error&&!k&&e.createElement("div",{role:"alert",style:{color:"#ff6b6b"}},a.error,e.createElement("div",{style:{marginTop:8,fontSize:13}},"API unavailable? View the roadmap docs:"," ",e.createElement("a",{href:"/docs/status/EPIC_MANAGEMENT_CURRENT.md",target:"_blank",rel:"noreferrer",style:{color:"#60a5fa"}},"EPIC_MANAGEMENT_CURRENT.md")," ","or"," ",e.createElement("a",{href:"/docs/status/DEVLOG.md",target:"_blank",rel:"noreferrer",style:{color:"#60a5fa"}},"DEVLOG.md"))),!k&&!a.error&&e.createElement("div",null,T.length===0?e.createElement("div",{"aria-label":"empty"},"No epics match your filters."):e.createElement("ul",{style:{listStyle:"none",padding:0}},T.map(t=>e.createElement("li",{key:t.id,style:{padding:12,border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,marginBottom:8}},e.createElement("div",{style:{fontWeight:600}},t.title),e.createElement("div",{style:{marginTop:4}},e.createElement(g,null,t.status),e.createElement(g,null,t.priority),t.owner&&e.createElement(g,null,"Owner: ",t.owner),t.eta&&e.createElement(g,null,"ETA: ",t.eta),t.risk&&e.createElement(g,null,"Risk: ",t.risk)))))))}const ee={title:"Docs/Epics/Epic Manager",component:p,parameters:{layout:"fullscreen",helpDocs:[{href:"?path=/story/specs-epic-management-full-spec--page",title:"Epics Full Spec"},{href:"?path=/story/overview-architecture--page",title:"Architecture"}],docs:{description:{component:"Interactive Epic Manager view to explore the current roadmap. Use the inline filters to adjust Status and Priority, or try the scenario variants (Empty/Loading/Error)."}}},args:{epics:J,loading:!1,error:null,statusFilter:L,priorityFilter:b,search:"",loadingDelayMs:0},argTypes:{epics:{control:"object"},loading:{control:"boolean"},error:{control:"text"},statusFilter:{control:{type:"check"},options:L},priorityFilter:{control:{type:"check"},options:b},search:{control:"text"},loadingDelayMs:{control:{type:"number",min:0,max:1e4,step:100}}}},h={play:async({canvasElement:a})=>{var n,o,i;const r=q(a),l=r.getByLabelText("Planned"),s=r.getByLabelText("In Progress"),c=r.getByLabelText("Blocked");l.checked&&await r.findByLabelText("Planned").then(()=>{}),await((n=l.click)==null?void 0:n.call(l)),s.checked&&await((o=s.click)==null?void 0:o.call(s)),c.checked&&await((i=c.click)==null?void 0:i.call(c)),await $(r.getByLabelText("empty")).toBeInTheDocument()}};function K(){const[a,r]=e.useState([]),[l,s]=e.useState(!1),[c,n]=e.useState(null);return e.useEffect(()=>{let o=!0;return(async()=>{s(!0);try{const i=await fetch("/api/epics",{method:"GET"});if(!i.ok)throw new y(`HTTP ${i.status}`);const d=await i.json();o&&r((d==null?void 0:d.epics)||[])}catch(i){o&&n((i==null?void 0:i.message)||"Failed to load epics")}finally{o&&s(!1)}})(),()=>{o=!1}},[]),e.createElement(p,{epics:a,loading:l,error:c||void 0})}const f={parameters:{docs:{description:{story:"Live data from /api/epics (MSW in-memory store). No dependency on _CURRENT docs."}}},render:()=>e.createElement(K,null)},E={parameters:{docs:{description:{story:"Shows the empty state when no epics are provided."}}},args:{epics:[]},play:async({canvasElement:a})=>{const r=q(a);await $(r.getByLabelText("empty")).toBeInTheDocument()}},v={parameters:{docs:{description:{story:"Shows a loading indicator while epics are fetched (static flag)."}}},args:{loading:!0}},S={parameters:{docs:{description:{story:"Simulates loading via a timer. Adjust loadingDelayMs in controls."}}},args:{loadingDelayMs:1500}},y={parameters:{docs:{description:{story:"Simulates a server error when loading epics."}}},args:{error:"Failed to load epics. Please retry."}};var M,x,D;p.parameters={...p.parameters,docs:{...(M=p.parameters)==null?void 0:M.docs,source:{originalSource:`function EpicManager(props: EpicManagerProps) {
  const [localStatus, setLocalStatus] = useState<EpicStatus[]>(props.statusFilter ?? allStatuses);
  const [localPriorities, setLocalPriorities] = useState<EpicPriority[]>(props.priorityFilter ?? allPriorities);
  const [localSearch, setLocalSearch] = useState<string>(props.search ?? '');
  const [delayedLoading, setDelayedLoading] = useState<boolean>(false);
  React.useEffect(() => {
    if (props.loadingDelayMs && props.loadingDelayMs > 0) {
      setDelayedLoading(true);
      const t = setTimeout(() => setDelayedLoading(false), Math.min(10000, props.loadingDelayMs));
      return () => clearTimeout(t);
    } else {
      setDelayedLoading(false);
    }
  }, [props.loadingDelayMs]);
  const isLoading = Boolean(props.loading) || delayedLoading;
  const filtered = useMemo(() => {
    if (!props.epics) return [];
    return props.epics.filter(e => localStatus.includes(e.status) && localPriorities.includes(e.priority) && (!localSearch || e.title.toLowerCase().includes(localSearch.toLowerCase())));
  }, [props.epics, localStatus, localPriorities, localSearch]);
  return <div style={{
    padding: 16
  }}>
      <h3>Epic Manager</h3>

      {/* Inline control panel */}
      <div style={{
      display: 'flex',
      gap: 16,
      flexWrap: 'wrap',
      alignItems: 'center',
      marginBottom: 12
    }}>
        <div>
          <div style={{
          fontWeight: 600,
          marginBottom: 4
        }}>Status</div>
          {allStatuses.map(s => <label key={s} style={{
          marginRight: 8
        }}>
              <input type="checkbox" checked={localStatus.includes(s)} onChange={e => {
            setLocalStatus(prev => e.target.checked ? [...prev, s] : prev.filter(x => x !== s));
          }} />{' '}
              {s}
            </label>)}
        </div>
        <div>
          <div style={{
          fontWeight: 600,
          marginBottom: 4
        }}>Priority</div>
          {allPriorities.map(p => <label key={p} style={{
          marginRight: 8
        }}>
              <input type="checkbox" checked={localPriorities.includes(p)} onChange={e => {
            setLocalPriorities(prev => e.target.checked ? [...prev, p] : prev.filter(x => x !== p));
          }} />{' '}
              {p}
            </label>)}
        </div>
        <div>
          <input aria-label="search" placeholder="Search epics..." value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
        </div>
      </div>

      {/* States */}
      {isLoading && <div aria-label="loading">Loading epics…</div>}
      {props.error && !isLoading && <div role="alert" style={{
      color: '#ff6b6b'
    }}>
          {props.error}
          <div style={{
        marginTop: 8,
        fontSize: 13
      }}>
            API unavailable? View the roadmap docs:
            {' '}
            <a href="/docs/status/EPIC_MANAGEMENT_CURRENT.md" target="_blank" rel="noreferrer" style={{
          color: '#60a5fa'
        }}>EPIC_MANAGEMENT_CURRENT.md</a>
            {' '}or{' '}
            <a href="/docs/status/DEVLOG.md" target="_blank" rel="noreferrer" style={{
          color: '#60a5fa'
        }}>DEVLOG.md</a>
          </div>
        </div>}

      {!isLoading && !props.error && <div>
          {filtered.length === 0 ? <div aria-label="empty">No epics match your filters.</div> : <ul style={{
        listStyle: 'none',
        padding: 0
      }}>
              {filtered.map(e => <li key={e.id} style={{
          padding: 12,
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8,
          marginBottom: 8
        }}>
                  <div style={{
            fontWeight: 600
          }}>{e.title}</div>
                  <div style={{
            marginTop: 4
          }}>
                    <Chip>{e.status}</Chip>
                    <Chip>{e.priority}</Chip>
                    {e.owner && <Chip>Owner: {e.owner}</Chip>}
                    {e.eta && <Chip>ETA: {e.eta}</Chip>}
                    {e.risk && <Chip>Risk: {e.risk}</Chip>}
                  </div>
                </li>)}
            </ul>}
        </div>}
    </div>;
}`,...(D=(x=p.parameters)==null?void 0:x.docs)==null?void 0:D.source}}};var C,B,R;h.parameters={...h.parameters,docs:{...(C=h.parameters)==null?void 0:C.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    // Narrow filter to only Done to force empty state with sample data
    const planned = c.getByLabelText('Planned') as HTMLInputElement;
    const inProgress = c.getByLabelText('In Progress') as HTMLInputElement;
    const blocked = c.getByLabelText('Blocked') as HTMLInputElement;
    // Uncheck these if checked
    if (planned.checked) await c.findByLabelText('Planned').then(() => {});
    await (planned as any).click?.();
    if (inProgress.checked) await (inProgress as any).click?.();
    if (blocked.checked) await (blocked as any).click?.();
    await expect(c.getByLabelText('empty')).toBeInTheDocument();
  }
}`,...(R=(B=h.parameters)==null?void 0:B.docs)==null?void 0:R.source}}};var I,N,A;f.parameters={...f.parameters,docs:{...(I=f.parameters)==null?void 0:I.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Live data from /api/epics (MSW in-memory store). No dependency on _CURRENT docs.'
      }
    }
  },
  render: () => <EpicManagerLive />
}`,...(A=(N=f.parameters)==null?void 0:N.docs)==null?void 0:A.source}}};var _,F,W;E.parameters={...E.parameters,docs:{...(_=E.parameters)==null?void 0:_.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Shows the empty state when no epics are provided.'
      }
    }
  },
  args: {
    epics: []
  },
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText('empty')).toBeInTheDocument();
  }
}`,...(W=(F=E.parameters)==null?void 0:F.docs)==null?void 0:W.source}}};var G,U,O;v.parameters={...v.parameters,docs:{...(G=v.parameters)==null?void 0:G.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Shows a loading indicator while epics are fetched (static flag).'
      }
    }
  },
  args: {
    loading: true
  }
}`,...(O=(U=v.parameters)==null?void 0:U.docs)==null?void 0:O.source}}};var V,j,z;S.parameters={...S.parameters,docs:{...(V=S.parameters)==null?void 0:V.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Simulates loading via a timer. Adjust loadingDelayMs in controls.'
      }
    }
  },
  args: {
    loadingDelayMs: 1500
  }
}`,...(z=(j=S.parameters)==null?void 0:j.docs)==null?void 0:z.source}}};var H,Q,X;y.parameters={...y.parameters,docs:{...(H=y.parameters)==null?void 0:H.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Simulates a server error when loading epics.'
      }
    }
  },
  args: {
    error: 'Failed to load epics. Please retry.'
  }
}`,...(X=(Q=y.parameters)==null?void 0:Q.docs)==null?void 0:X.source}}};const te=["EpicManager","Default","Live","Empty","Loading","LoadingWithDelay","Error"];export{h as Default,E as Empty,p as EpicManager,y as Error,f as Live,v as Loading,S as LoadingWithDelay,te as __namedExportsOrder,ee as default};
