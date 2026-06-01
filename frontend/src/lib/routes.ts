/** Central route builders — keep chat URLs short and stable (slug-based). */

export const routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  verifyEmail: "/verify-email",
  search: "/search",
  userProfile: (username: string) => `/search/${encodeURIComponent(username)}`,
  chatHome: "/chat",
  chatInbox: "/chat/inbox",
  chatThread: (slug: string) => `/chat/${encodeURIComponent(slug)}`,
  account: "/account",
} as const;
