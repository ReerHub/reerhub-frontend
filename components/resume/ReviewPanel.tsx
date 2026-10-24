"use client";

import { useMemo, useState } from "react";
import type { ResumeDocument } from "@/lib/resume/document";
import { compareJobKeywords, reviewResume } from "@/lib/resume/review";

export default function ReviewPanel({
  document,
  onSection,
}: {
  document: ResumeDocument;
  onSection: (section: string) => void;
}) {
  const [jobDescription, setJobDescription] = useState("");
  const findings = useMemo(() => reviewResume(document), [document]);
  const keywords = useMemo(
    () => compareJobKeywords(document, jobDescription),
    [document, jobDescription],
  );
  return (
    <div className="ai-panel review-panel">
      <h2>Review before you send</h2>
      <p>
        Practical checks to help you finish your resume. These are writing
        prompts, not an ATS score or a hiring prediction. You decide what is
        relevant.
      </p>
      {findings.length ? (
        <ul className="review-findings">
          {findings.map((finding) => (
            <li key={finding.id}>
              <h3>{finding.title}</h3>
              <p>{finding.detail}</p>
              <button
                className="button secondary"
                type="button"
                onClick={() => onSection(finding.section)}
              >
                Review section
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p role="status">
          The basic checks are clear. Read the PDF once more to confirm every
          fact and link before sending.
        </p>
      )}
      <hr />
      <h2>Compare a job description</h2>
      <p>
        See which familiar tech terms appear in both the job description and
        your visible resume sections. This comparison runs on your device. The
        pasted description stays in this tab and is not saved or sent to AI.
      </p>
      <label className="field">
        Job description
        <textarea
          rows={8}
          maxLength={20000}
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the role’s requirements here"
        />
      </label>
      {jobDescription.trim() && (
        <>
          <h3>Included in your resume</h3>
          <p>
            {keywords.included.length
              ? keywords.included.join(" · ")
              : "No terms from this vocabulary appear in both yet."}
          </p>
          <h3>Not mentioned in your resume</h3>
          <p>
            {keywords.notMentioned.length
              ? keywords.notMentioned.join(" · ")
              : "No additional terms from this vocabulary were found."}
          </p>
          <button
            type="button"
            className="button secondary"
            onClick={() => setJobDescription("")}
          >
            Clear job description
          </button>
        </>
      )}
      <p className="muted">
        This uses a limited, explicit tech vocabulary with common aliases. It
        does not understand proficiency, context, negation or equivalent
        experience. Contact details, section headings and hidden sections are
        excluded. A matching word is not evidence that you meet a requirement.
        Add a term only when your own experience supports it; you do not need
        every term.
      </p>
    </div>
  );
}
