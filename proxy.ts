import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/research(.*)",
  "/api/suggestions(.*)",
  "/api/transcript(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jinja2|ttf|woff2?|ico|gif|svg|png|jpg|jpeg|webp)).*)",
    "/(api|trpc)(.*)",
  ],
};
