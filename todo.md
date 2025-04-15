- [x] posthog analytics
- [x] stop using NODE_ENV
- [x] pb
- [x] DNF avg in contest leaderboard
- [x] refactor getPersonalBestSubquery
- [x] avg leaderboard
- [x] fancy white glowing outline effect on own result / after jumping to a solve
- [x] make contest row height same as other rows
- [x] add indexes for timeMs and avgMs
- [x] fix scroll and glow
- [x] admin on prod
    - [x] implement
    - [x] are you ABSOLUTELY SURE?
- [x] toast adjust "single personal best" text
- [x] rework logo homepage/landing link
- [x] use node-cron 
- [x] make vendor/twisty a microservice 
    - [x] scaffold the microservice
    - [x] connect it to staging
    - [x] connect it on prod
    - [x] add auth
- [ ] solve on mobile
- [ ] abort solve on escape
- [ ] dnf all solves for admins
- [ ] make admins "capable" of everything
- [ ] boring stuff (cookies, privacy policy, etc)
- [ ] devtools to skip session
- [ ] see what we can do with redirect on discipline change between results/solve page

BEFORE RELEASE:
- [ ] new posthog project

AFTER RELEASE:
- [ ] include ongoing in leaderboard if capabilities=view_results
- [ ] average personal best toast & avg 
- [ ] fix discipline: string everywhere
- [ ] skip inspection by default and play the solve automatically
- [ ] delete round sessions with no results & dnf round sessions with too little results
    - [ ] on contest close
    - [ ] migration
