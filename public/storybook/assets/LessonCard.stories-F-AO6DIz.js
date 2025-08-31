import{R as e,r as Le}from"./index-R2V08a_e.js";import{M as Se,s as k,V as s,T as o}from"./index-C78dfCW2.js";import{w as Re,e as T,u as Ce}from"./index-C-PFODCg.js";import"./extends-ClFxuap2.js";const ve=t=>Math.max(0,Math.min(1,t)),xe=({title:t,description:n,icon:i,color:a="#4f46e5",progress:be=0,locked:c=!1,completed:R=!1,xpReward:C,difficulty:v,onPress:he,style:we})=>{const E=ve(be);return e.createElement(Se,{accessibilityRole:"button",accessibilityLabel:t,onPress:he,disabled:c,style:[r.card,we,c&&r.cardLocked,R&&r.cardCompleted]},e.createElement(s,{style:r.header},e.createElement(o,{style:r.icon},c?"🔒":i||"📘"),e.createElement(s,{style:{flex:1}},e.createElement(o,{style:[r.title,R&&r.titleCompleted],numberOfLines:1},t),n?e.createElement(o,{style:r.description,numberOfLines:2},n):null),v?e.createElement(o,{style:r.difficulty},v):null),!c&&e.createElement(s,{style:r.progressRow},e.createElement(s,{style:r.progressBar},e.createElement(s,{style:[r.progressFill,{width:`${E*100}%`,backgroundColor:a}]})),e.createElement(o,{style:r.progressText},Math.round(E*100),"%")),e.createElement(s,{style:r.footer},C!=null?e.createElement(o,{style:r.meta},"+",C," XP"):e.createElement(s,null),R?e.createElement(o,{style:[r.meta,r.completedText]},"Completed"):c?e.createElement(o,{style:[r.meta,r.lockedText]},"Locked"):null))},r=k.create({card:{gap:8,padding:12,borderRadius:12,backgroundColor:"#0f172a",borderWidth:k.hairlineWidth,borderColor:"#1f2937",width:300},cardLocked:{opacity:.6},cardCompleted:{borderColor:"#10b981"},header:{flexDirection:"row",alignItems:"center",gap:10},icon:{fontSize:24},title:{color:"#e5e7eb",fontSize:16,fontWeight:"700"},titleCompleted:{color:"#a7f3d0"},description:{color:"#9ca3af",fontSize:12},difficulty:{color:"#93c5fd",fontSize:12,fontWeight:"600"},progressRow:{flexDirection:"row",alignItems:"center",gap:8},progressBar:{flex:1,height:6,backgroundColor:"#1f2937",borderRadius:999,overflow:"hidden"},progressFill:{height:"100%",borderRadius:999},progressText:{color:"#e5e7eb",fontSize:12,fontVariant:["tabular-nums"]},footer:{marginTop:2,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},meta:{color:"#d1d5db",fontSize:12,fontWeight:"600"},completedText:{color:"#10b981"},lockedText:{color:"#f59e0b"}}),De={title:"Components/LessonCard",component:xe,decorators:[t=>e.createElement(s,{style:{padding:20,backgroundColor:"#0d1117",flex:1}},e.createElement(t,null))],argTypes:{title:{control:"text"},description:{control:"text"},icon:{control:"text"},color:{control:"color"},progress:{control:{type:"range",min:0,max:1,step:.1}},locked:{control:"boolean"},completed:{control:"boolean"},xpReward:{control:"number"},difficulty:{control:"select",options:["easy","medium","hard"]},onPress:{action:"pressed"}},parameters:{docs:{description:{component:"LessonCard is used to present a course or topic entry with progress, difficulty, and rewards. Use the states below to showcase outcomes (default, in progress, completed, locked)."}}}},l={args:{title:"JavaScript Basics",description:"Learn the fundamentals of JavaScript",icon:"📚",color:"#f1e05a",progress:0,xpReward:100,difficulty:"easy"}},d={args:{title:"React Components",description:"Master React component patterns",icon:"⚛️",color:"#61dafb",progress:.6,xpReward:150,difficulty:"medium"}},p={args:{title:"TypeScript Advanced",description:"Advanced TypeScript concepts",icon:"🔷",color:"#3178c6",progress:1,completed:!0,xpReward:200,difficulty:"hard"}},m={args:{title:"GraphQL Mastery",description:"Deep dive into GraphQL",icon:"🔒",color:"#e10098",progress:0,locked:!0,xpReward:250,difficulty:"hard"}},u={args:{title:"Premium Deep Dives",description:"Unlock premium to access advanced content",icon:"⭐",color:"#fbbf24",progress:0,locked:!0,xpReward:400,difficulty:"hard"}},g={args:{title:"Loading…",description:"Fetching lesson details…",icon:"⏳",color:"#9ca3af",progress:0,xpReward:0,difficulty:"easy"},parameters:{docs:{description:{story:"Simulated loading placeholder. Replace with a skeleton state when available in the component."}},chromatic:{pauseAnimationAtEnd:!0}}},f={args:{title:"Failed to load",description:"Please try again later",icon:"⚠️",color:"#ef4444",progress:0,xpReward:0,difficulty:"easy"},parameters:{docs:{description:{story:"Simulated error placeholder. Use per-story MSW overrides on fetching components to trigger real 500/timeout states."}}}},y={render:t=>{const[n,i]=Le.useState(0);return e.createElement(s,{style:{gap:12}},e.createElement(o,{accessibilityRole:"text",accessibilityLabel:"pressed-count"},"Pressed: ",n),e.createElement("button",{"aria-label":"trigger",onClick:()=>i(a=>a+1),style:{padding:8}},"Trigger click"),e.createElement(xe,{...t,onPress:()=>i(a=>a+1)}))},args:{title:"Click Me Lesson",description:"Play test will click and assert counter",icon:"🧪",color:"#10b981",progress:.2,xpReward:50,difficulty:"easy"},play:async({canvasElement:t})=>{const n=Re(t);await T(n.getByLabelText(/pressed-count/i)).toHaveTextContent("Pressed: 0"),await Ce.click(n.getByRole("button",{name:/trigger/i})),await T(n.getByLabelText(/pressed-count/i)).toHaveTextContent("Pressed: 1")}},x={args:{title:"HTML Basics",description:"Introduction to HTML",icon:"🌐",color:"#e34c26",progress:.3,xpReward:50,difficulty:"easy"}},b={args:{title:"CSS Grid & Flexbox",description:"Layout techniques in CSS",icon:"🎨",color:"#1572b6",progress:.5,xpReward:100,difficulty:"medium"}},h={args:{title:"System Design",description:"Architecture patterns and best practices",icon:"🏗️",color:"#ff6b6b",progress:.2,xpReward:300,difficulty:"hard"}},w={args:{title:"Python Data Structures",description:"Lists, dictionaries, and more",icon:"🐍",color:"#3776ab",progress:.75,xpReward:120,difficulty:"medium"}},L={args:{title:"Git Version Control",description:"Master Git commands",icon:"🔀",color:"#f05032",progress:.9,xpReward:80,difficulty:"easy"}},S={args:{title:"Docker Containers",description:"Containerization with Docker",icon:"🐳",color:"#2496ed",progress:.4,xpReward:180,difficulty:"medium"}};var P,D,M;l.parameters={...l.parameters,docs:{...(P=l.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    title: 'JavaScript Basics',
    description: 'Learn the fundamentals of JavaScript',
    icon: '📚',
    color: '#f1e05a',
    progress: 0,
    xpReward: 100,
    difficulty: 'easy'
  }
}`,...(M=(D=l.parameters)==null?void 0:D.docs)==null?void 0:M.source}}};var B,G,H;d.parameters={...d.parameters,docs:{...(B=d.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    title: 'React Components',
    description: 'Master React component patterns',
    icon: '⚛️',
    color: '#61dafb',
    progress: 0.6,
    xpReward: 150,
    difficulty: 'medium'
  }
}`,...(H=(G=d.parameters)==null?void 0:G.docs)==null?void 0:H.source}}};var A,I,z;p.parameters={...p.parameters,docs:{...(A=p.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    title: 'TypeScript Advanced',
    description: 'Advanced TypeScript concepts',
    icon: '🔷',
    color: '#3178c6',
    progress: 1,
    completed: true,
    xpReward: 200,
    difficulty: 'hard'
  }
}`,...(z=(I=p.parameters)==null?void 0:I.docs)==null?void 0:z.source}}};var F,V,W;m.parameters={...m.parameters,docs:{...(F=m.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    title: 'GraphQL Mastery',
    description: 'Deep dive into GraphQL',
    icon: '🔒',
    color: '#e10098',
    progress: 0,
    locked: true,
    xpReward: 250,
    difficulty: 'hard'
  }
}`,...(W=(V=m.parameters)==null?void 0:V.docs)==null?void 0:W.source}}};var U,J,O;u.parameters={...u.parameters,docs:{...(U=u.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    title: 'Premium Deep Dives',
    description: 'Unlock premium to access advanced content',
    icon: '⭐',
    color: '#fbbf24',
    progress: 0,
    locked: true,
    xpReward: 400,
    difficulty: 'hard'
  }
}`,...(O=(J=u.parameters)==null?void 0:J.docs)==null?void 0:O.source}}};var Q,q,_;g.parameters={...g.parameters,docs:{...(Q=g.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    title: 'Loading…',
    description: 'Fetching lesson details…',
    icon: '⏳',
    color: '#9ca3af',
    progress: 0,
    xpReward: 0,
    difficulty: 'easy'
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulated loading placeholder. Replace with a skeleton state when available in the component.'
      }
    },
    chromatic: {
      pauseAnimationAtEnd: true
    }
  }
}`,...(_=(q=g.parameters)==null?void 0:q.docs)==null?void 0:_.source}}};var j,X,$;f.parameters={...f.parameters,docs:{...(j=f.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    title: 'Failed to load',
    description: 'Please try again later',
    icon: '⚠️',
    color: '#ef4444',
    progress: 0,
    xpReward: 0,
    difficulty: 'easy'
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulated error placeholder. Use per-story MSW overrides on fetching components to trigger real 500/timeout states.'
      }
    }
  }
}`,...($=(X=f.parameters)==null?void 0:X.docs)==null?void 0:$.source}}};var K,N,Y;y.parameters={...y.parameters,docs:{...(K=y.parameters)==null?void 0:K.docs,source:{originalSource:`{
  render: args => {
    const [pressed, setPressed] = useState(0);
    return <View style={{
      gap: 12
    }}>
        <Text accessibilityRole="text" accessibilityLabel="pressed-count">
          Pressed: {pressed}
        </Text>
        {/* Helper trigger for deterministic testing */}
        <button aria-label="trigger" onClick={() => setPressed(x => x + 1)} style={{
        padding: 8
      }}>
          Trigger click
        </button>
        <LessonCard {...args} onPress={() => setPressed(x => x + 1)} />
      </View>;
  },
  args: {
    title: 'Click Me Lesson',
    description: 'Play test will click and assert counter',
    icon: '🧪',
    color: '#10b981',
    progress: 0.2,
    xpReward: 50,
    difficulty: 'easy'
  },
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText(/pressed-count/i)).toHaveTextContent('Pressed: 0');
    await userEvent.click(c.getByRole('button', {
      name: /trigger/i
    }));
    await expect(c.getByLabelText(/pressed-count/i)).toHaveTextContent('Pressed: 1');
  }
}`,...(Y=(N=y.parameters)==null?void 0:N.docs)==null?void 0:Y.source}}};var Z,ee,re;x.parameters={...x.parameters,docs:{...(Z=x.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  args: {
    title: 'HTML Basics',
    description: 'Introduction to HTML',
    icon: '🌐',
    color: '#e34c26',
    progress: 0.3,
    xpReward: 50,
    difficulty: 'easy'
  }
}`,...(re=(ee=x.parameters)==null?void 0:ee.docs)==null?void 0:re.source}}};var te,oe,se;b.parameters={...b.parameters,docs:{...(te=b.parameters)==null?void 0:te.docs,source:{originalSource:`{
  args: {
    title: 'CSS Grid & Flexbox',
    description: 'Layout techniques in CSS',
    icon: '🎨',
    color: '#1572b6',
    progress: 0.5,
    xpReward: 100,
    difficulty: 'medium'
  }
}`,...(se=(oe=b.parameters)==null?void 0:oe.docs)==null?void 0:se.source}}};var ne,ae,ce;h.parameters={...h.parameters,docs:{...(ne=h.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  args: {
    title: 'System Design',
    description: 'Architecture patterns and best practices',
    icon: '🏗️',
    color: '#ff6b6b',
    progress: 0.2,
    xpReward: 300,
    difficulty: 'hard'
  }
}`,...(ce=(ae=h.parameters)==null?void 0:ae.docs)==null?void 0:ce.source}}};var ie,le,de;w.parameters={...w.parameters,docs:{...(ie=w.parameters)==null?void 0:ie.docs,source:{originalSource:`{
  args: {
    title: 'Python Data Structures',
    description: 'Lists, dictionaries, and more',
    icon: '🐍',
    color: '#3776ab',
    progress: 0.75,
    xpReward: 120,
    difficulty: 'medium'
  }
}`,...(de=(le=w.parameters)==null?void 0:le.docs)==null?void 0:de.source}}};var pe,me,ue;L.parameters={...L.parameters,docs:{...(pe=L.parameters)==null?void 0:pe.docs,source:{originalSource:`{
  args: {
    title: 'Git Version Control',
    description: 'Master Git commands',
    icon: '🔀',
    color: '#f05032',
    progress: 0.9,
    xpReward: 80,
    difficulty: 'easy'
  }
}`,...(ue=(me=L.parameters)==null?void 0:me.docs)==null?void 0:ue.source}}};var ge,fe,ye;S.parameters={...S.parameters,docs:{...(ge=S.parameters)==null?void 0:ge.docs,source:{originalSource:`{
  args: {
    title: 'Docker Containers',
    description: 'Containerization with Docker',
    icon: '🐳',
    color: '#2496ed',
    progress: 0.4,
    xpReward: 180,
    difficulty: 'medium'
  }
}`,...(ye=(fe=S.parameters)==null?void 0:fe.docs)==null?void 0:ye.source}}};const Me=["Default","InProgress","Completed","Locked","Premium","Loading","ErrorState","Interactive","EasyLevel","MediumLevel","HardLevel","PythonLesson","GitLesson","DockerLesson"];export{p as Completed,l as Default,S as DockerLesson,x as EasyLevel,f as ErrorState,L as GitLesson,h as HardLevel,d as InProgress,y as Interactive,g as Loading,m as Locked,b as MediumLevel,u as Premium,w as PythonLesson,Me as __namedExportsOrder,De as default};
