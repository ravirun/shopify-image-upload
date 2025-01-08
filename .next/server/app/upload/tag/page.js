(()=>{var e={};e.id=845,e.ids=[845],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},9121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3873:e=>{"use strict";e.exports=require("path")},9551:e=>{"use strict";e.exports=require("url")},7048:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>i.a,__next_app__:()=>c,pages:()=>p,routeModule:()=>u,tree:()=>d});var s=r(260),a=r(8203),o=r(5155),i=r.n(o),l=r(7292),n={};for(let e in l)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(n[e]=()=>l[e]);r.d(t,n);let d=["",{children:["upload",{children:["tag",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,3912)),"/Users/ravisharma/bulk-image-uploader/shopify-image-upload/src/app/upload/tag/page.js"]}]},{}]},{metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,440))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(r.bind(r,2804)),"/Users/ravisharma/bulk-image-uploader/shopify-image-upload/src/app/layout.js"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,9937,23)),"next/dist/client/components/not-found-error"],metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,440))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}],p=["/Users/ravisharma/bulk-image-uploader/shopify-image-upload/src/app/upload/tag/page.js"],c={require:r,loadChunk:()=>Promise.resolve()},u=new s.AppPageRouteModule({definition:{kind:a.RouteKind.APP_PAGE,page:"/upload/tag/page",pathname:"/upload/tag",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},3327:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,3219,23)),Promise.resolve().then(r.t.bind(r,4863,23)),Promise.resolve().then(r.t.bind(r,5155,23)),Promise.resolve().then(r.t.bind(r,9350,23)),Promise.resolve().then(r.t.bind(r,6313,23)),Promise.resolve().then(r.t.bind(r,8530,23)),Promise.resolve().then(r.t.bind(r,8921,23))},3159:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,6959,23)),Promise.resolve().then(r.t.bind(r,3875,23)),Promise.resolve().then(r.t.bind(r,8903,23)),Promise.resolve().then(r.t.bind(r,4178,23)),Promise.resolve().then(r.t.bind(r,6013,23)),Promise.resolve().then(r.t.bind(r,7190,23)),Promise.resolve().then(r.t.bind(r,1365,23))},8705:()=>{},1857:()=>{},6478:(e,t,r)=>{Promise.resolve().then(r.bind(r,3912))},8230:(e,t,r)=>{Promise.resolve().then(r.bind(r,3443))},9334:(e,t,r)=>{"use strict";var s=r(8686);r.o(s,"useRouter")&&r.d(t,{useRouter:function(){return s.useRouter}})},3443:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>l});var s=r(5512),a=r(8009),o=r(9334);let i=()=>{let[e,t]=(0,a.useState)([]),[r,o]=(0,a.useState)(!1),[i,l]=(0,a.useState)(""),[n,d]=(0,a.useState)(""),[p,c]=(0,a.useState)("");(0,a.useEffect)(()=>{let e=sessionStorage.getItem("shopifyStoreUrl"),t=sessionStorage.getItem("shopifyApiKey");e&&d(e),t&&c(t)},[]);let u=async()=>{if(!n||!p){l("Please provide Shopify Store URL and API Key.");return}o(!0),l("Fetching products from Shopify...");try{let e=await fetch("/api/fetch-shopify-products",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({storeUrl:n,apiKey:p})}),r=await e.json();e.ok?(t(r.products),l(`Successfully fetched ${r.products.length} products.`)):l(`Failed to fetch products: ${r.error}`)}catch(e){l(`Error fetching products: ${e.message}`)}finally{o(!1)}};return(0,s.jsxs)("div",{className:"p-4",children:[(0,s.jsx)("p",{children:i}),(0,s.jsx)("button",{onClick:u,className:"bg-green-600 text-white rounded py-2 px-4 hover:bg-green-700 transition mt-4",children:"Fetch Products"}),r?(0,s.jsx)("p",{className:"mt-4",children:"Loading Shopify products..."}):e.length>0?(0,s.jsxs)("div",{className:"mt-6 overflow-x-auto",children:[(0,s.jsx)("h3",{className:"text-lg font-semibold mb-4",children:"Shopify Products:"}),(0,s.jsxs)("table",{className:"min-w-full border-collapse border border-gray-200",children:[(0,s.jsx)("thead",{className:"bg-gray-100",children:(0,s.jsxs)("tr",{children:[(0,s.jsx)("th",{className:"border border-gray-200 px-4 py-2 text-left",children:"#"}),(0,s.jsx)("th",{className:"border border-gray-200 px-4 py-2 text-left",children:"Title"}),(0,s.jsx)("th",{className:"border border-gray-200 px-4 py-2 text-left",children:"Tags"})]})}),(0,s.jsx)("tbody",{children:e.map((e,t)=>(0,s.jsxs)("tr",{className:"hover:bg-gray-50",children:[(0,s.jsx)("td",{className:"border border-gray-200 px-4 py-2",children:t+1}),(0,s.jsx)("td",{className:"border border-gray-200 px-4 py-2",children:e.title}),(0,s.jsx)("td",{className:"border border-gray-200 px-4 py-2",children:e.tags.length>0?e.tags.join(", "):"No Tags"})]},t))})]})]}):(0,s.jsx)("p",{className:"mt-4",children:"No products to display."})]})},l=()=>{let[e,t]=(0,a.useState)([]),[r,l]=(0,a.useState)(""),[n,d]=(0,a.useState)(new Set),[p,c]=(0,a.useState)(null),[u,h]=(0,a.useState)(null),m=(0,o.useRouter)();(0,a.useEffect)(()=>{},[m]);let g=async()=>{if(!p||!u)return l("Please provide Shopify Store URL and API Key.");if(0===e.length)return l("No folders selected.");l("Checking product by tag...");let t={};e.forEach(e=>{let r=e.webkitRelativePath.split("/")[0];t[r]||(t[r]=[]),t[r].push(e)});let r=Object.keys(t);try{let e=await fetch("/api/check-tag/tag",{method:"POST",body:JSON.stringify({folderNames:r,storeUrl:p,apiKey:u}),headers:{"Content-Type":"application/json"}}),s=await e.json();e.ok?(l("Tag found. Uploading folders..."),await f(t)):l(`Tag not found: ${s.error}`)}catch(e){l(`Error checking tag: ${e.message}`)}},f=async e=>{let t=new FormData;Object.keys(e).forEach(r=>{e[r].forEach(e=>{t.append(`${r}/${e.name}`,e)})}),t.append("shopifyStoreUrl",p),t.append("shopifyApiKey",u);try{let e=await fetch("/api/upload/tag",{method:"POST",body:t}),r=await e.json();e.ok?l("Folders uploaded successfully."):l(`Upload failed: ${r.error}`)}catch(e){l(`Error uploading folders: ${e.message}`)}},b=r=>{let s=new Set(n);s.delete(r);let a=e.filter(e=>!e.webkitRelativePath.startsWith(r));d(s),t(a)};return(0,s.jsx)("div",{className:"container mx-auto p-8",children:(0,s.jsxs)("div",{className:"bg-white shadow rounded-lg p-6",children:[(0,s.jsx)("h1",{className:"text-2xl font-bold mb-4",children:"Shopify Folder Upload Tool"}),(0,s.jsx)("input",{type:"file",webkitdirectory:"true",multiple:!0,onChange:e=>{let r=Array.from(e.target.files);t(e=>[...e,...r]);let s=new Set([...n]);r.forEach(e=>{let t=e.webkitRelativePath.split("/")[0];s.add(t)}),d(s)},className:"block w-full border border-gray-300 rounded p-2 mb-4"}),(0,s.jsx)("button",{onClick:g,className:"bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 transition",children:"Upload Folders"}),(0,s.jsx)("p",{className:"mt-4 text-gray-700",children:r}),(0,s.jsxs)("div",{className:"mt-6",children:[(0,s.jsx)("h3",{className:"text-lg font-semibold",children:"Selected Folders:"}),(0,s.jsx)("ul",{className:"list-disc pl-6",children:[...n].map((e,t)=>(0,s.jsxs)("li",{className:"flex items-center justify-between",children:[(0,s.jsx)("span",{children:e}),(0,s.jsx)("button",{onClick:()=>b(e),className:"ml-4 bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600 transition",children:"Delete"})]},t))})]}),p&&u&&(0,s.jsx)(i,{storeUrl:p,apiKey:u})]})})}},2804:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>d,metadata:()=>n});var s=r(2740),a=r(3627),o=r.n(a),i=r(4874),l=r.n(i);r(1135);let n={title:"Create Next App",description:"Generated by create next app"};function d({children:e}){return(0,s.jsx)("html",{lang:"en",children:(0,s.jsx)("body",{className:`${o().variable} ${l().variable} antialiased`,children:e})})}},3912:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});let s=(0,r(6760).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/Users/ravisharma/bulk-image-uploader/shopify-image-upload/src/app/upload/tag/page.js\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/ravisharma/bulk-image-uploader/shopify-image-upload/src/app/upload/tag/page.js","default")},440:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>a});var s=r(8077);let a=async e=>[{type:"image/x-icon",sizes:"16x16",url:(0,s.fillMetadataSegment)(".",await e.params,"favicon.ico")+""}]},1135:()=>{}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[613,137,77],()=>r(7048));module.exports=s})();