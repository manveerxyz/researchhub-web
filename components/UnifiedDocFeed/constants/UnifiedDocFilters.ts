import icons from "~/config/themes/icons";

export const topLevelFilters = {
  "/": {
    label: "Frontpage",
    value: "/",
    icon: icons.globeLight,
  },
  "/my-hubs": {
    label: "My Hubs",
    value: "/my-hubs",
    icon: null,
  },
};

export const UnifiedDocFilters = {
  // intentional ordering
  ALL: "all",
  PAPER: "paper",
  POSTS: "posts",
  HYPOTHESIS: "hypothesis",
};

export const UnifiedDocFilterLabels = {
  ALL: "All",
  HYPOTHESIS: "Hypotheses",
  PAPER: "Papers",
  POSTS: "Posts",
};

export const feedTypeOpts = {
  all: {
    value: "all",
    label: "All",
  },
  paper: {
    value: "paper",
    label: "Papers",
  },
  post: {
    value: "post",
    label: "Posts",
  },
  question: {
    value: "question",
    label: "Questions",
  },
  "meta-study": {
    value: "meta-study",
    label: "Meta-Studies",
  },
  bounty: {
    value: "bounty",
    label: "Bounties",
  },
};

export const sortOpts = {
  hot: {
    value: "hot",
    label: "Trending",
    selectedLabel: "Trending",
    icon: icons.fire,
    disableScope: true,
    availableFor: [
      feedTypeOpts["all"].value,
      feedTypeOpts["paper"].value,
      feedTypeOpts["post"].value,
      feedTypeOpts["question"].value,
      feedTypeOpts["meta-study"].value,
      feedTypeOpts["bounty"].value,
    ],
  },
  // "expiring_soon": {
  //   value: "expiring_soon",
  //   label: "Expiring Soon",
  //   selectedLabel: "Expiring Soon",
  //   icon: icons.clock,
  //   disableScope: true,
  //   availableFor: [
  //     feedTypeOpts["bounty"].value,
  //   ],
  // },
  // "rsc_offered": {
  //   value: "rsc_offered",
  //   label: "RSC Offered",
  //   selectedLabel: "RSC Offered",
  //   icon: icons.clock,
  //   disableScope: true,
  //   availableFor: [
  //     feedTypeOpts["bounty"].value,
  //   ],
  // },
  newest: {
    value: "newest",
    label: "Newest",
    selectedLabel: "Newest",
    icon: icons.bolt,
    disableScope: false,
    availableFor: [
      feedTypeOpts["all"].value,
      feedTypeOpts["paper"].value,
      feedTypeOpts["post"].value,
      feedTypeOpts["question"].value,
      feedTypeOpts["meta-study"].value,
      feedTypeOpts["bounty"].value,
    ],
  },
  most_discussed: {
    value: "most_discussed",
    label: "Most Discussed",
    selectedLabel: "Discussed",
    icon: icons.commentsAlt,
    disableScope: false,
    availableFor: [
      feedTypeOpts["all"].value,
      feedTypeOpts["paper"].value,
      feedTypeOpts["post"].value,
      feedTypeOpts["question"].value,
      feedTypeOpts["meta-study"].value,
      feedTypeOpts["bounty"].value,
    ],
  },
  top_rated: {
    value: "top_rated",
    label: "Most Upvoted",
    selectedLabel: "Upvoted",
    icon: icons.up,
    disableScope: false,
    availableFor: [
      feedTypeOpts["all"].value,
      feedTypeOpts["paper"].value,
      feedTypeOpts["post"].value,
      feedTypeOpts["question"].value,
      feedTypeOpts["meta-study"].value,
      feedTypeOpts["bounty"].value,
    ],
  },
};

export const tagFilters = {
  peer_reviewed: {
    value: "peer_reviewed",
    label: "Peer reviewed",
    availableFor: [
      feedTypeOpts["all"].value,
      feedTypeOpts["paper"].value,
      feedTypeOpts["post"].value,
    ],
  },
  open_access: {
    value: "open_access",
    label: "Open access",
    availableFor: [feedTypeOpts["all"].value, feedTypeOpts["paper"].value],
  },
  expired: {
    value: "expired",
    label: "Show expired bounties",
    availableFor: [feedTypeOpts["bounty"].value],
  },
  answered: {
    value: "answered",
    label: "Show answered",
    availableFor: [feedTypeOpts["question"].value],
  },
};

export const scopeOptions = {
  today: {
    value: "today",
    valueForApi: "today",
    label: "Today",
    isDefault: true,
  },
  week: {
    value: "week",
    valueForApi: "week",
    label: "This Week",
  },
  month: {
    value: "month",
    valueForApi: "month",
    label: "This Month",
  },
  year: {
    value: "year",
    valueForApi: "year",
    label: "This Year",
  },
  "all-time": {
    value: "all-time",
    valueForApi: "all_time",
    label: "All Time",
  },
};
