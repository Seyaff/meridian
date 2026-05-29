import { NextRequest, NextResponse } from "next/server";


const publicRoutes = ["/" , "/login" , "/signup" , "/forgot-password"  , "/reset-password" , "/verify-email" ]
const privateRoutes = ["/chat"]


function isPublicRoute  (pathname : string)  {
    return publicRoutes.includes(pathname)
}

function isPrivateRoute (pathname: string) {
    return privateRoutes.includes(pathname)
}


export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[Proxy Executing] Requesting path: ${pathname}`);
  const token = request.cookies.get('accessToken')?.value; 

  const isPublic = isPublicRoute(pathname)
  const isPrivate = isPrivateRoute(pathname)

  if(isPublic && token) {
    return NextResponse.redirect(new URL("/chat" , request.url))
    
  }

  if(isPrivate && !token) {
    return NextResponse.redirect(new URL("/login" , request.url))
  }

  

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};




