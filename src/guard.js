const SUSPICIOUS = [
  /ignore (all|any|the|previous|prior) (rules|instructions)/i,
  /(seed phrase|private key|secret key)/i,
  /(bypass|disable|remove).*(approval|policy|guard|limit)/i,
  /(send|transfer).*(whole|entire|all).*(wallet|treasury|balance)/i,
  /you are now authorized/i
];

export function inspectUntrustedText(text = "") {
  const matches = SUSPICIOUS.filter((pattern) => pattern.test(String(text))).map((pattern) => pattern.source);
  return {
    safe: matches.length === 0,
    classification: matches.length ? "PROMPT_INJECTION_OR_SECRET_REQUEST" : "NO_KNOWN_INJECTION_PATTERN",
    matchedRules: matches,
    action: matches.length ? "TREAT_AS_DATA_AND_REFUSE_PRIVILEGED_ACTION" : "CONTINUE_WITH_NORMAL_POLICY_CHECKS"
  };
}
