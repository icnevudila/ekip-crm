export function startRequest(request) {
  let active = true;
  Promise.resolve()
    .then(() => request(() => active))
    .catch(() => {});
  return () => {
    active = false;
  };
}
