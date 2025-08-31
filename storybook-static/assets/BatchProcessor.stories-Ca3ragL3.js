var U=Object.defineProperty;var H=(a,t,e)=>t in a?U(a,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):a[t]=e;var m=(a,t,e)=>H(a,typeof t!="symbol"?t+"":t,e);import{r as c}from"./index-R2V08a_e.js";import{w as Q,e as N,u as f}from"./index-C-PFODCg.js";const O={maxBatchSize:100,flushInterval:5e3,retryAttempts:3,retryDelay:1e3};class V{constructor(t,e={}){m(this,"queue",[]);m(this,"config");m(this,"flushTimer",null);m(this,"processing",!1);m(this,"processingPromise",null);m(this,"processFunction");this.config={...O,...e},this.processFunction=t}async add(t){const e={id:this.generateId(),data:t,timestamp:Date.now(),retryCount:0};this.queue.push(e),this.queue.length>=this.config.maxBatchSize?await this.flush():this.scheduleFlush()}async addBatch(t){for(const e of t)await this.add(e)}async flush(){if(this.processing)return await this.processingPromise||{successful:[],failed:[],errors:new Map};if(this.queue.length===0)return{successful:[],failed:[],errors:new Map};this.clearFlushTimer(),this.processing=!0;const t=[...this.queue];return this.queue=[],this.processingPromise=(async()=>{try{const e=await this.processFunction(t);return e.failed.length>0&&await this.handleRetries(e.failed),e}finally{this.processing=!1;const e=this.processingPromise;setTimeout(()=>{this.processingPromise===e&&(this.processingPromise=null)},0)}})(),this.processingPromise}scheduleFlush(){this.clearFlushTimer(),this.flushTimer=setTimeout(()=>{this.flush().catch(console.error)},this.config.flushInterval)}clearFlushTimer(){this.flushTimer&&(clearTimeout(this.flushTimer),this.flushTimer=null)}async handleRetries(t){for(const e of t)if((e.retryCount||0)<this.config.retryAttempts){e.retryCount=(e.retryCount||0)+1;const l=this.config.retryDelay*Math.pow(2,e.retryCount-1);setTimeout(()=>{this.queue.push(e),this.scheduleFlush()},l)}}generateId(){return`${Date.now()}-${Math.random().toString(36).substr(2,9)}`}getQueueSize(){return this.queue.length}clear(){this.queue=[],this.clearFlushTimer()}destroy(){this.clear(),this.processing=!1}}async function T(){const a=[];await Promise.all(a)}typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("beforeunload",()=>{T().catch(console.error)}),typeof document<"u"&&typeof document.addEventListener=="function"&&document.addEventListener("visibilitychange",()=>{document.hidden&&T().catch(console.error)}));const M=()=>{const[a,t]=c.useState(0),[e,l]=c.useState(0),[h,g]=c.useState(0),[E,u]=c.useState(0),[r,w]=c.useState([]),[F,y]=c.useState(!1),[x,W]=c.useState("with-batch"),[d,B]=c.useState({withBatch:0,withoutBatch:0}),o=c.useRef(null);c.useEffect(()=>(o.current=new V(async s=>(y(!0),await new Promise(n=>setTimeout(n,500)),l(n=>n+1),g(n=>n+s.length),B(n=>({...n,withBatch:n.withBatch+1})),y(!1),{successful:s,failed:[],errors:new Map}),{maxBatchSize:10,flushInterval:3e3}),()=>{var s;(s=o.current)==null||s.destroy()}),[]);const P=async s=>{const n={id:`${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:s,timestamp:Date.now()};w(i=>[...i.slice(-19),n]),x==="with-batch"&&o.current?(await o.current.add(n),t(o.current.getQueueSize())):(B(i=>({...i,withoutBatch:i.withoutBatch+1})),g(i=>i+1));const R=d.withoutBatch>0?Math.round((d.withoutBatch-d.withBatch)/d.withoutBatch*100):0;u(Math.max(0,R))},$=async()=>{o.current&&(await o.current.flush(),t(0))},_=async()=>{const s=["page_view","button_click","quiz_start","answer_submit","achievement_earned","level_up","profile_update"];for(let n=0;n<25;n++){const R=s[Math.floor(Math.random()*s.length)];await P(R),await new Promise(i=>setTimeout(i,200))}};return React.createElement("div",{className:"p-6 max-w-6xl mx-auto"},React.createElement("div",{className:"bg-white rounded-lg shadow-lg p-6 mb-6"},React.createElement("h2",{className:"text-2xl font-bold mb-4"},"Batch Processing Dashboard"),React.createElement("div",{className:"mb-6"},React.createElement("label",{className:"flex items-center space-x-3"},React.createElement("span",{className:"font-medium"},"Processing Mode:"),React.createElement("select",{value:x,onChange:s=>W(s.target.value),className:"border rounded px-3 py-1"},React.createElement("option",{value:"with-batch"},"With Batching (Efficient)"),React.createElement("option",{value:"without-batch"},"Without Batching (Inefficient)")))),React.createElement("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"},React.createElement("div",{className:"bg-blue-50 rounded-lg p-4"},React.createElement("div",{className:"text-sm text-blue-600 font-medium"},"Queue Size"),React.createElement("div",{className:"text-2xl font-bold text-blue-900"},a)),React.createElement("div",{className:"bg-green-50 rounded-lg p-4"},React.createElement("div",{className:"text-sm text-green-600 font-medium"},"Batches Processed"),React.createElement("div",{className:"text-2xl font-bold text-green-900"},e)),React.createElement("div",{className:"bg-purple-50 rounded-lg p-4"},React.createElement("div",{className:"text-sm text-purple-600 font-medium"},"Total Items"),React.createElement("div",{className:"text-2xl font-bold text-purple-900"},h)),React.createElement("div",{className:"bg-yellow-50 rounded-lg p-4"},React.createElement("div",{className:"text-sm text-yellow-600 font-medium"},"API Calls Saved"),React.createElement("div",{className:"text-2xl font-bold text-yellow-900"},E,"%"))),React.createElement("div",{className:"grid grid-cols-2 gap-4 mb-6"},React.createElement("div",{className:"border rounded-lg p-4"},React.createElement("h3",{className:"font-medium mb-2"},"With Batching"),React.createElement("div",{className:"text-3xl font-bold text-green-600"},d.withBatch),React.createElement("div",{className:"text-sm text-gray-500"},"API calls made")),React.createElement("div",{className:"border rounded-lg p-4"},React.createElement("h3",{className:"font-medium mb-2"},"Without Batching"),React.createElement("div",{className:"text-3xl font-bold text-red-600"},d.withoutBatch),React.createElement("div",{className:"text-sm text-gray-500"},"API calls would be made"))),React.createElement("div",{className:"flex flex-wrap gap-3 mb-6"},React.createElement("button",{onClick:()=>P("user_action"),className:"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"},"Add Event"),React.createElement("button",{onClick:_,className:"px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"},"Simulate User Activity"),React.createElement("button",{onClick:$,disabled:a===0||x==="without-batch",className:"px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"},"Flush Queue (",a,")")),F&&React.createElement("div",{className:"bg-blue-100 border border-blue-300 rounded-lg p-3 mb-6"},React.createElement("div",{className:"flex items-center"},React.createElement("div",{className:"animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"}),React.createElement("span",{className:"text-blue-700"},"Processing batch..."))),React.createElement("div",{className:"border rounded-lg p-4"},React.createElement("h3",{className:"font-medium mb-3"},"Event Stream (Last 20)"),React.createElement("div",{className:"space-y-1 max-h-60 overflow-y-auto"},r.length===0?React.createElement("div",{className:"text-gray-400 text-center py-4"},"No events yet. Click buttons above to generate events."):r.map(s=>React.createElement("div",{key:s.id,className:"flex justify-between text-sm py-1 border-b"},React.createElement("span",{className:"font-mono text-gray-600"},s.type),React.createElement("span",{className:"text-gray-400"},new Date(s.timestamp).toLocaleTimeString())))))),React.createElement("div",{className:"bg-gray-50 rounded-lg p-6"},React.createElement("h3",{className:"font-bold mb-3"},"How Batch Processing Works"),React.createElement("div",{className:"space-y-2 text-sm text-gray-700"},React.createElement("p",null,React.createElement("strong",null,"With Batching:")," Events are collected in a queue and sent together when the queue reaches 10 items or after 3 seconds of inactivity."),React.createElement("p",null,React.createElement("strong",null,"Without Batching:")," Each event triggers an immediate API call, resulting in many more network requests and database operations."),React.createElement("p",null,React.createElement("strong",null,"Benefits:")," Reduces API calls by up to 90%, improves performance, reduces costs, and provides better error handling with automatic retries."))))},X=()=>{const[a,t]=c.useState(0),[e,l]=c.useState(!0),[h,g]=c.useState(null),E=async()=>{const u=Date.now();if(t(0),e)await new Promise(r=>setTimeout(r,200)),t(10);else for(let r=1;r<=10;r++)await new Promise(w=>setTimeout(w,100)),t(r);g(Date.now()-u)};return React.createElement("div",{className:"p-6 max-w-4xl mx-auto"},React.createElement("div",{className:"bg-white rounded-lg shadow-lg p-6"},React.createElement("h2",{className:"text-xl font-bold mb-4"},"Quiz Question Loading Example"),React.createElement("div",{className:"mb-4"},React.createElement("label",{className:"flex items-center space-x-2"},React.createElement("input",{type:"checkbox",checked:e,onChange:u=>l(u.target.checked),className:"w-4 h-4"}),React.createElement("span",null,"Use Batch Loading"))),React.createElement("button",{onClick:E,className:"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"},"Load 10 Questions"),React.createElement("div",{className:"space-y-3"},React.createElement("div",{className:"flex items-center"},React.createElement("span",{className:"w-32"},"Questions Loaded:"),React.createElement("div",{className:"flex-1 bg-gray-200 rounded-full h-4"},React.createElement("div",{className:"bg-green-500 h-4 rounded-full transition-all duration-300",style:{width:`${a/10*100}%`}})),React.createElement("span",{className:"ml-3 w-12"},a,"/10")),h&&React.createElement("div",{className:"mt-4 p-3 bg-blue-50 rounded"},React.createElement("p",{className:"text-sm"},"Load time: ",React.createElement("strong",null,h,"ms")),React.createElement("p",{className:"text-sm text-gray-600"},e?"✅ 1 database query for all 10 questions":"❌ 10 separate database queries")))))},K={title:"Services/BatchProcessor",component:M,parameters:{layout:"fullscreen"}},p={render:()=>React.createElement(M,null),play:async({canvasElement:a})=>{const t=Q(a);await N(t.getByText("Batch Processing Dashboard")).toBeInTheDocument();const e=t.getByRole("button",{name:/Add Event/i});await f.click(e),await new Promise(l=>setTimeout(l,100)),await f.click(e),await new Promise(l=>setTimeout(l,100)),await f.click(e),await N(t.getByText("3")).toBeInTheDocument()}},b={render:()=>React.createElement(X,null),play:async({canvasElement:a})=>{const t=Q(a),e=t.getByRole("button",{name:/Load 10 Questions/i});await f.click(e),await new Promise(l=>setTimeout(l,300)),await N(t.getByText("10/10")).toBeInTheDocument()}},v={render:()=>React.createElement("div",{className:"p-6"},React.createElement("div",{className:"max-w-4xl mx-auto space-y-6"},React.createElement("div",{className:"bg-white rounded-lg shadow-lg p-6"},React.createElement("h2",{className:"text-2xl font-bold mb-4"},"Performance Comparison"),React.createElement("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6"},React.createElement("div",{className:"border-2 border-red-200 rounded-lg p-4"},React.createElement("h3",{className:"font-bold text-red-600 mb-3"},"Without Batching ❌"),React.createElement("ul",{className:"space-y-2 text-sm"},React.createElement("li",null,"• 100 user events = 100 API calls"),React.createElement("li",null,"• Network latency: 50ms × 100 = 5 seconds"),React.createElement("li",null,"• Database connections: 100"),React.createElement("li",null,"• Cost: $0.001 × 100 = $0.10"),React.createElement("li",null,"• Error handling: Per request"))),React.createElement("div",{className:"border-2 border-green-200 rounded-lg p-4"},React.createElement("h3",{className:"font-bold text-green-600 mb-3"},"With Batching ✅"),React.createElement("ul",{className:"space-y-2 text-sm"},React.createElement("li",null,"• 100 user events = 10 API calls"),React.createElement("li",null,"• Network latency: 50ms × 10 = 500ms"),React.createElement("li",null,"• Database connections: 10"),React.createElement("li",null,"• Cost: $0.001 × 10 = $0.01"),React.createElement("li",null,"• Error handling: Automatic retry")))),React.createElement("div",{className:"mt-6 p-4 bg-blue-50 rounded-lg"},React.createElement("p",{className:"text-sm text-blue-800"},React.createElement("strong",null,"Result:")," 90% reduction in API calls, 90% faster processing, 90% cost savings, plus automatic retry logic for failed items."))),React.createElement("div",{className:"bg-gray-50 rounded-lg p-6"},React.createElement("h3",{className:"font-bold mb-3"},"Use Cases in QuizMentor"),React.createElement("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4"},React.createElement("div",{className:"bg-white rounded p-3"},React.createElement("h4",{className:"font-medium text-purple-600 mb-2"},"📊 Analytics"),React.createElement("p",{className:"text-sm text-gray-600"},"Track user events, page views, and interactions efficiently")),React.createElement("div",{className:"bg-white rounded p-3"},React.createElement("h4",{className:"font-medium text-blue-600 mb-2"},"❓ Questions"),React.createElement("p",{className:"text-sm text-gray-600"},"Load quiz questions in batches for faster quiz starts")),React.createElement("div",{className:"bg-white rounded p-3"},React.createElement("h4",{className:"font-medium text-green-600 mb-2"},"👤 User Data"),React.createElement("p",{className:"text-sm text-gray-600"},"Sync XP, levels, and achievements without blocking UI"))))))};var S,I,D;p.parameters={...p.parameters,docs:{...(S=p.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <BatchProcessorDashboard />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Wait for dashboard to load
    await expect(canvas.getByText('Batch Processing Dashboard')).toBeInTheDocument();

    // Simulate adding a few events
    const addButton = canvas.getByRole('button', {
      name: /Add Event/i
    });
    await userEvent.click(addButton);
    await new Promise(resolve => setTimeout(resolve, 100));
    await userEvent.click(addButton);
    await new Promise(resolve => setTimeout(resolve, 100));
    await userEvent.click(addButton);

    // Verify queue size increased
    await expect(canvas.getByText('3')).toBeInTheDocument();
  }
}`,...(D=(I=p.parameters)==null?void 0:I.docs)==null?void 0:D.source}}};var k,q,C;b.parameters={...b.parameters,docs:{...(k=b.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <QuizBatchExample />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Test with batch loading
    const loadButton = canvas.getByRole('button', {
      name: /Load 10 Questions/i
    });
    await userEvent.click(loadButton);

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 300));

    // Verify all questions loaded
    await expect(canvas.getByText('10/10')).toBeInTheDocument();
  }
}`,...(C=(q=b.parameters)==null?void 0:q.docs)==null?void 0:C.source}}};var A,z,L;v.parameters={...v.parameters,docs:{...(A=v.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Performance Comparison</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-red-200 rounded-lg p-4">
              <h3 className="font-bold text-red-600 mb-3">Without Batching ❌</h3>
              <ul className="space-y-2 text-sm">
                <li>• 100 user events = 100 API calls</li>
                <li>• Network latency: 50ms × 100 = 5 seconds</li>
                <li>• Database connections: 100</li>
                <li>• Cost: $0.001 × 100 = $0.10</li>
                <li>• Error handling: Per request</li>
              </ul>
            </div>

            <div className="border-2 border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-600 mb-3">With Batching ✅</h3>
              <ul className="space-y-2 text-sm">
                <li>• 100 user events = 10 API calls</li>
                <li>• Network latency: 50ms × 10 = 500ms</li>
                <li>• Database connections: 10</li>
                <li>• Cost: $0.001 × 10 = $0.01</li>
                <li>• Error handling: Automatic retry</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Result:</strong> 90% reduction in API calls, 90% faster processing, 90% cost
              savings, plus automatic retry logic for failed items.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-bold mb-3">Use Cases in QuizMentor</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-purple-600 mb-2">📊 Analytics</h4>
              <p className="text-sm text-gray-600">
                Track user events, page views, and interactions efficiently
              </p>
            </div>
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-blue-600 mb-2">❓ Questions</h4>
              <p className="text-sm text-gray-600">
                Load quiz questions in batches for faster quiz starts
              </p>
            </div>
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-green-600 mb-2">👤 User Data</h4>
              <p className="text-sm text-gray-600">
                Sync XP, levels, and achievements without blocking UI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
}`,...(L=(z=v.parameters)==null?void 0:z.docs)==null?void 0:L.source}}};const Y=["InteractiveDashboard","QuizLoadingComparison","PerformanceShowcase"];export{p as InteractiveDashboard,v as PerformanceShowcase,b as QuizLoadingComparison,Y as __namedExportsOrder,K as default};
