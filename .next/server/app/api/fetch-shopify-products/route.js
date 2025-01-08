(()=>{var e={};e.id=644,e.ids=[644],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3571:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>f,routeModule:()=>d,serverHooks:()=>h,workAsyncStorage:()=>c,workUnitAsyncStorage:()=>l});var s={};r.r(s),r.d(s,{GET:()=>u,POST:()=>p});var o=r(2706),a=r(8203),n=r(5994),i=r(9187);async function p(e){try{let{storeUrl:t,apiKey:r}=await e.json();if(!t||!r)return i.NextResponse.json({error:"Store URL and API Key are required."},{status:400});let s=async()=>{let e=[],s=!0,o=null;for(;s;){let a=`
          query ($cursor: String) {
            products(first: 50, after: $cursor) {
              edges {
                node {
                  title
                  tags
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,n=o?{cursor:o}:{},i=await fetch(`${t}/admin/api/2023-10/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":r},body:JSON.stringify({query:a,variables:n})}),p=await i.json();if(!i.ok||!p.data){let e=p.errors?p.errors.map(e=>e.message).join(", "):"Failed to fetch products";throw Error(e)}let u=p.data.products.edges||[];e=e.concat(u.map(e=>({title:e.node.title||"Untitled Product",tags:e.node.tags||[]}))),s=p.data.products.pageInfo.hasNextPage,o=p.data.products.pageInfo.endCursor}return e},o=await s();return i.NextResponse.json({products:o})}catch(e){return i.NextResponse.json({error:`Error: ${e.message}`},{status:500})}}async function u(){return i.NextResponse.json({message:"Method Not Allowed"},{status:405})}let d=new o.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/fetch-shopify-products/route",pathname:"/api/fetch-shopify-products",filename:"route",bundlePath:"app/api/fetch-shopify-products/route"},resolvedPagePath:"/Users/ravisharma/bulk-image-uploader/shopify-image-upload/src/app/api/fetch-shopify-products/route.js",nextConfigOutput:"",userland:s}),{workAsyncStorage:c,workUnitAsyncStorage:l,serverHooks:h}=d;function f(){return(0,n.patchFetch)({workAsyncStorage:c,workUnitAsyncStorage:l})}},6487:()=>{},8335:()=>{}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[613,452],()=>r(3571));module.exports=s})();