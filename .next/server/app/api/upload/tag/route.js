(()=>{var e={};e.id=576,e.ids=[576],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3767:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>l,routeModule:()=>p,serverHooks:()=>d,workAsyncStorage:()=>u,workUnitAsyncStorage:()=>c});var s={};t.r(s),t.d(s,{POST:()=>i});var o=t(2706),a=t(8203),n=t(5994);async function i(e){try{let{shopifyStoreUrl:r,shopifyApiKey:t}=await e.json();return console.log("Shopify Store URL:",r),console.log("Shopify API Key:",t),new Response(JSON.stringify({success:!0}),{status:200,headers:{"Content-Type":"application/json"}})}catch(e){return console.error("Error:",e),new Response(JSON.stringify({success:!1,error:e.message}),{status:500,headers:{"Content-Type":"application/json"}})}}let p=new o.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/upload/tag/route",pathname:"/api/upload/tag",filename:"route",bundlePath:"app/api/upload/tag/route"},resolvedPagePath:"/Users/ravisharma/bulk-image-uploader/shopify-image-upload/src/app/api/upload/tag/route.js",nextConfigOutput:"",userland:s}),{workAsyncStorage:u,workUnitAsyncStorage:c,serverHooks:d}=p;function l(){return(0,n.patchFetch)({workAsyncStorage:u,workUnitAsyncStorage:c})}},6487:()=>{},8335:()=>{},2706:(e,r,t)=>{"use strict";e.exports=t(4870)}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[613],()=>t(3767));module.exports=s})();