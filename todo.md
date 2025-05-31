- [x] always show results, without auth, even incomplete sessions
- [x] join round
- [x] leave round
- [x] hydration error
- [x] scroll on session finish
- [x] censor solves in contest results
- [x] streaming primitives
- [x] streaming resumability
- [x] streaming last move correctly (end stream instead of deleting it)
- [x] timer
- [ ] remove scrollToXXX after using it (maybe rename it to anchorId)

Hybrid results view:
- [x] legacy/new solve view toggle
- [ ] check if orpc ssr works on dokploy
- [ ] migrate to orpc
- [ ] remove NoSSR
- [ ] use custom query keys for revalidation
- [ ] rework OwnSolveInProgress row (before submission show the row like in old solve view)

Live streaming:
- [ ] disable it in prod
- [ ] deploy to experiments.vscubing.com
- [ ] make TwistySimulator api compliant with the standard notation
- [ ] pusher typesafety
- [ ] sync final solve time
- [ ] put simulator into a separate package
- [ ] try socket.io and aws implementations

Special contests:
- [ ] round status (registration|ongoing|finished) (+incomplete sessions warning)

Collaboration
