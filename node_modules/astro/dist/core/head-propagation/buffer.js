async function collectPropagatedHeadParts(input) {
  const collectedHeadParts = [];
  const seen = /* @__PURE__ */ new Set();
  const pendingSlotEvaluations = input.result._metadata?.pendingSlotEvaluations ?? [];
  while (true) {
    if (pendingSlotEvaluations.length > 0) {
      const batch = pendingSlotEvaluations.splice(0, pendingSlotEvaluations.length);
      await Promise.all(batch);
      continue;
    }
    let progressed = false;
    for (const propagator of input.propagators) {
      if (seen.has(propagator)) continue;
      seen.add(propagator);
      progressed = true;
      const returnValue = await propagator.init(input.result);
      if (input.isHeadAndContent(returnValue) && returnValue.head) {
        collectedHeadParts.push(returnValue.head);
      }
      break;
    }
    if (!progressed) break;
  }
  return collectedHeadParts;
}
export {
  collectPropagatedHeadParts
};
