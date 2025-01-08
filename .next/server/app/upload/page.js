(()=>{var e={};e.id=994,e.ids=[994],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},9121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3873:e=>{"use strict";e.exports=require("path")},9551:e=>{"use strict";e.exports=require("url")},7976:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>l.a,__next_app__:()=>u,pages:()=>p,routeModule:()=>c,tree:()=>d});var a=r(260),s=r(8203),o=r(5155),l=r.n(o),i=r(7292),n={};for(let e in i)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(n[e]=()=>i[e]);r.d(t,n);let d=["",{children:["upload",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,5405)),"/Users/ravisharma/bulk-image-uploader/shopify-image-upload/src/app/upload/page.js"]}]},{metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,440))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(r.bind(r,2804)),"/Users/ravisharma/bulk-image-uploader/shopify-image-upload/src/app/layout.js"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,9937,23)),"next/dist/client/components/not-found-error"],metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,440))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}],p=["/Users/ravisharma/bulk-image-uploader/shopify-image-upload/src/app/upload/page.js"],u={require:r,loadChunk:()=>Promise.resolve()},c=new a.AppPageRouteModule({definition:{kind:s.RouteKind.APP_PAGE,page:"/upload/page",pathname:"/upload",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},3327:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,3219,23)),Promise.resolve().then(r.t.bind(r,4863,23)),Promise.resolve().then(r.t.bind(r,5155,23)),Promise.resolve().then(r.t.bind(r,9350,23)),Promise.resolve().then(r.t.bind(r,6313,23)),Promise.resolve().then(r.t.bind(r,8530,23)),Promise.resolve().then(r.t.bind(r,8921,23))},3159:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,6959,23)),Promise.resolve().then(r.t.bind(r,3875,23)),Promise.resolve().then(r.t.bind(r,8903,23)),Promise.resolve().then(r.t.bind(r,4178,23)),Promise.resolve().then(r.t.bind(r,6013,23)),Promise.resolve().then(r.t.bind(r,7190,23)),Promise.resolve().then(r.t.bind(r,1365,23))},8705:()=>{},1857:()=>{},4681:(e,t,r)=>{Promise.resolve().then(r.bind(r,5405))},1129:(e,t,r)=>{Promise.resolve().then(r.bind(r,553))},553:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>o});var a=r(5512),s=r(8009);let o=()=>{let[e,t]=(0,s.useState)([]),[r,o]=(0,s.useState)(""),[l,i]=(0,s.useState)(new Set),[n,d]=(0,s.useState)("title"),[p,u]=(0,s.useState)([]),[c,m]=(0,s.useState)(null),[h,f]=(0,s.useState)(null);(0,s.useEffect)(()=>{},[]);let b=async()=>{if(!c||!h)return o("Please provide Shopify Store URL and API Key.");if(0===e.length)return console.log("No folders selected."),o("No folders selected.");o("Uploading folders..."),console.log("Preparing form data for upload");let t=new FormData,r={};e.forEach(e=>{let t=e.webkitRelativePath.split("/")[0];if(!e.type.startsWith("image/")){console.log(`Skipping non-image file: ${e.name}`);return}r[t]||(r[t]=[]),r[t].push(e),console.log(`Appending file: ${e.webkitRelativePath} to folder: ${t}`)}),Object.keys(r).forEach(e=>{r[e].sort((e,t)=>{let r=e=>{let t=e.split(".")[0].match(/\d+/);return t?parseInt(t[0],10):NaN},a=r(e.name),s=r(t.name);return isNaN(a)||isNaN(s)?isNaN(a)?1:isNaN(s)?-1:0:s-a})}),Object.keys(r).forEach(e=>{r[e].forEach(r=>{t.append(`${e}/${r.name}`,r)})}),t.append("storeUrl",c),t.append("apiKey",h),t.append("apiOption",n),console.log(`Sending upload request to /api/upload/${n}`);let a=await fetch(`/api/upload/${n}`,{method:"POST",body:t}),s=await a.json();a.ok?(o("Folders uploaded successfully."),console.log("Upload successful:",s),console.log(s.folderUploads)):(o(`Upload failed: ${s.error}`),console.error("Upload failed:",s.error))},v=r=>{let a=new Set(l);a.delete(r);let s=e.filter(e=>!e.webkitRelativePath.startsWith(r));i(a),t(s),console.log(`Deleted folder: ${r}`)};return(0,a.jsx)("div",{className:"container mx-auto p-8",children:(0,a.jsxs)("div",{className:"bg-white shadow rounded-lg p-6",children:[(0,a.jsx)("h1",{className:"text-2xl font-bold mb-4",children:"Shopify Folder Upload Tool"}),(0,a.jsx)("input",{type:"file",webkitdirectory:"true",multiple:!0,onChange:e=>{let r=Array.from(e.target.files);t(e=>[...e,...r]);let a=new Set([...l]);r.forEach(e=>{let t=e.webkitRelativePath.split("/")[0];a.add(t)}),i(a),console.log("Files selected:",r),console.log("Selected folders:",Array.from(a))},className:"block w-full border border-gray-300 rounded p-2 mb-4"}),(0,a.jsxs)("div",{className:"mb-4",children:[(0,a.jsx)("label",{htmlFor:"apiOption",className:"block text-sm font-medium mb-1",children:"Upload by:"}),(0,a.jsxs)("select",{id:"apiOption",value:n,onChange:e=>d(e.target.value),className:"block w-full border border-gray-300 rounded p-2",children:[(0,a.jsx)("option",{value:"title",children:"Title"}),(0,a.jsx)("option",{value:"sku",children:"SKU"}),(0,a.jsx)("option",{value:"id",children:"ID"})]})]}),(0,a.jsx)("button",{onClick:b,className:"bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 transition",children:"Upload Folders"}),(0,a.jsx)("p",{className:"mt-4 text-gray-700",children:r}),(0,a.jsxs)("div",{className:"mt-6",children:[(0,a.jsx)("h3",{className:"text-lg font-semibold",children:"Selected Folders:"}),(0,a.jsx)("ul",{className:"list-disc pl-6",children:[...l].map((e,t)=>(0,a.jsxs)("li",{className:"flex items-center justify-between",children:[(0,a.jsx)("span",{children:e}),(0,a.jsx)("button",{onClick:()=>v(e),className:"ml-4 bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600 transition",children:"Delete"})]},t))})]})]})})}},2804:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>d,metadata:()=>n});var a=r(2740),s=r(3627),o=r.n(s),l=r(4874),i=r.n(l);r(1135);let n={title:"Create Next App",description:"Generated by create next app"};function d({children:e}){return(0,a.jsx)("html",{lang:"en",children:(0,a.jsx)("body",{className:`${o().variable} ${i().variable} antialiased`,children:e})})}},5405:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>a});let a=(0,r(4379).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/Users/ravisharma/bulk-image-uploader/shopify-image-upload/src/app/upload/page.js\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/ravisharma/bulk-image-uploader/shopify-image-upload/src/app/upload/page.js","default")},440:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});var a=r(8077);let s=async e=>[{type:"image/x-icon",sizes:"16x16",url:(0,a.fillMetadataSegment)(".",await e.params,"favicon.ico")+""}]},1135:()=>{}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[613,137,77],()=>r(7976));module.exports=a})();