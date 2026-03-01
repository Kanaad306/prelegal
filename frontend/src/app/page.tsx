"use client";

import { useState } from "react";

interface NdaValues {
  purpose: string;
  effectiveDate: string;
  mndaTermType: "expires" | "continues";
  mndaTermYears: string;
  confidentialityType: "years" | "perpetuity";
  confidentialityYears: string;
  governingLaw: string;
  jurisdiction: string;
  party1Company: string;
  party1Name: string;
  party1Title: string;
  party1Address: string;
  party2Company: string;
  party2Name: string;
  party2Title: string;
  party2Address: string;
}

const defaultValues: NdaValues = {
  purpose: "",
  effectiveDate: "",
  mndaTermType: "expires",
  mndaTermYears: "1",
  confidentialityType: "years",
  confidentialityYears: "1",
  governingLaw: "",
  jurisdiction: "",
  party1Company: "",
  party1Name: "",
  party1Title: "",
  party1Address: "",
  party2Company: "",
  party2Name: "",
  party2Title: "",
  party2Address: "",
};

/** Renders a form value inline: blue if filled, grey placeholder if empty. */
function F({ v, label }: { v: string; label: string }) {
  return v ? (
    <span className="nda-field-filled">{v}</span>
  ) : (
    <span className="nda-field-empty">[{label}]</span>
  );
}

function NdaPreview({ v }: { v: NdaValues }) {
  const mndaTermText =
    v.mndaTermType === "expires"
      ? `${v.mndaTermYears || "1"} year(s) from Effective Date`
      : "until terminated in accordance with the terms of the MNDA";

  const confTermText =
    v.confidentialityType === "perpetuity"
      ? "in perpetuity"
      : `${v.confidentialityYears || "1"} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws`;

  const formattedDate = v.effectiveDate
    ? new Date(v.effectiveDate + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="nda-document font-serif text-sm leading-relaxed text-gray-900 p-10 max-w-3xl mx-auto">
      {/* ── COVER PAGE ── */}
      <h1 className="text-2xl font-bold text-center mb-1 tracking-wide">
        Mutual Non-Disclosure Agreement
      </h1>
      <p className="text-center text-xs text-gray-500 mb-8">
        Common Paper Mutual NDA Standard Terms Version 1.0
      </p>

      <div className="border border-gray-300 rounded-lg overflow-hidden mb-8">
        {/* Purpose */}
        <div className="border-b border-gray-200 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
            Purpose
          </p>
          <p className="text-xs text-gray-400 mb-2">
            How Confidential Information may be used
          </p>
          <p className="text-sm min-h-[1.5rem]">
            <F v={v.purpose} label="Evaluating whether to enter into a business relationship with the other party." />
          </p>
        </div>

        {/* Effective Date */}
        <div className="border-b border-gray-200 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
            Effective Date
          </p>
          <p className="text-sm">
            <F v={formattedDate} label="Today's date" />
          </p>
        </div>

        {/* MNDA Term */}
        <div className="border-b border-gray-200 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
            MNDA Term
          </p>
          <p className="text-xs text-gray-400 mb-2">The length of this MNDA</p>
          <div className="space-y-1 text-sm">
            <p>
              {v.mndaTermType === "expires" ? "☑" : "☐"}{" "}
              Expires{" "}
              <span className={v.mndaTermType === "expires" ? "nda-field-filled" : ""}>
                {v.mndaTermYears || "1"} year(s)
              </span>{" "}
              from Effective Date.
            </p>
            <p>
              {v.mndaTermType === "continues" ? "☑" : "☐"}{" "}
              Continues until terminated in accordance with the terms of the MNDA.
            </p>
          </div>
        </div>

        {/* Term of Confidentiality */}
        <div className="border-b border-gray-200 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
            Term of Confidentiality
          </p>
          <p className="text-xs text-gray-400 mb-2">
            How long Confidential Information is protected
          </p>
          <div className="space-y-1 text-sm">
            <p>
              {v.confidentialityType === "years" ? "☑" : "☐"}{" "}
              <span className={v.confidentialityType === "years" ? "nda-field-filled" : ""}>
                {v.confidentialityYears || "1"} year(s)
              </span>{" "}
              from Effective Date, but in the case of trade secrets until
              Confidential Information is no longer considered a trade secret
              under applicable laws.
            </p>
            <p>
              {v.confidentialityType === "perpetuity" ? "☑" : "☐"} In perpetuity.
            </p>
          </div>
        </div>

        {/* Governing Law */}
        <div className="border-b border-gray-200 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
            Governing Law &amp; Jurisdiction
          </p>
          <p className="text-sm mb-1">
            Governing Law: <F v={v.governingLaw} label="Fill in state" />
          </p>
          <p className="text-sm">
            Jurisdiction: <F v={v.jurisdiction} label='e.g. "courts located in New Castle, DE"' />
          </p>
        </div>

        {/* MNDA Modifications */}
        <div className="border-b border-gray-200 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
            MNDA Modifications
          </p>
          <p className="text-sm text-gray-400 italic">
            List any modifications to the MNDA
          </p>
        </div>

        {/* Signature Table */}
        <div className="p-4">
          <p className="text-sm mb-4">
            By signing this Cover Page, each party agrees to enter into this
            MNDA as of the Effective Date.
          </p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-left font-semibold bg-gray-50 w-1/4"></th>
                <th className="border border-gray-300 p-2 text-center font-semibold bg-gray-50">
                  PARTY 1
                </th>
                <th className="border border-gray-300 p-2 text-center font-semibold bg-gray-50">
                  PARTY 2
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-medium text-gray-600">
                  Company
                </td>
                <td className="border border-gray-300 p-2">
                  <F v={v.party1Company} label="Company Name" />
                </td>
                <td className="border border-gray-300 p-2">
                  <F v={v.party2Company} label="Company Name" />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium text-gray-600">
                  Print Name
                </td>
                <td className="border border-gray-300 p-2">
                  <F v={v.party1Name} label="Full Name" />
                </td>
                <td className="border border-gray-300 p-2">
                  <F v={v.party2Name} label="Full Name" />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium text-gray-600">
                  Title
                </td>
                <td className="border border-gray-300 p-2">
                  <F v={v.party1Title} label="Title" />
                </td>
                <td className="border border-gray-300 p-2">
                  <F v={v.party2Title} label="Title" />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium text-gray-600">
                  Signature
                </td>
                <td className="border border-gray-300 p-2 h-10"></td>
                <td className="border border-gray-300 p-2 h-10"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium text-gray-600">
                  Notice Address
                </td>
                <td className="border border-gray-300 p-2">
                  <F v={v.party1Address} label="Email or postal address" />
                </td>
                <td className="border border-gray-300 p-2">
                  <F v={v.party2Address} label="Email or postal address" />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium text-gray-600">
                  Date
                </td>
                <td className="border border-gray-300 p-2 h-8"></td>
                <td className="border border-gray-300 p-2 h-8"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── STANDARD TERMS ── */}
      <h2 className="text-xl font-bold mb-6 text-center">Standard Terms</h2>

      <div className="space-y-4">
        <p>
          <strong>1. Introduction.</strong> This Mutual Non-Disclosure Agreement
          (which incorporates these Standard Terms and the Cover Page (defined
          below)) (&ldquo;<strong>MNDA</strong>&rdquo;) allows each party (&ldquo;
          <strong>Disclosing Party</strong>&rdquo;) to disclose or make available
          information in connection with the{" "}
          <F v={v.purpose} label="Purpose" /> which (1) the Disclosing Party
          identifies to the receiving party (&ldquo;<strong>Receiving Party</strong>
          &rdquo;) as &ldquo;confidential&rdquo;, &ldquo;proprietary&rdquo;, or the
          like or (2) should be reasonably understood as confidential or
          proprietary due to its nature and the circumstances of its disclosure
          (&ldquo;<strong>Confidential Information</strong>&rdquo;). Each
          party&rsquo;s Confidential Information also includes the existence and
          status of the parties&rsquo; discussions and information on the Cover
          Page. Confidential Information includes technical or business
          information, product designs or roadmaps, requirements, pricing,
          security and compliance documentation, technology, inventions and
          know-how. To use this MNDA, the parties must complete and sign a cover
          page incorporating these Standard Terms (&ldquo;<strong>Cover Page</strong>
          &rdquo;). Each party is identified on the Cover Page and capitalized
          terms have the meanings given herein or on the Cover Page.
        </p>

        <p>
          <strong>2. Use and Protection of Confidential Information.</strong> The
          Receiving Party shall: (a) use Confidential Information solely for the{" "}
          <F v={v.purpose} label="Purpose" />; (b) not disclose Confidential
          Information to third parties without the Disclosing Party&rsquo;s prior
          written approval, except that the Receiving Party may disclose
          Confidential Information to its employees, agents, advisors, contractors
          and other representatives having a reasonable need to know for the{" "}
          <F v={v.purpose} label="Purpose" />, provided these representatives are
          bound by confidentiality obligations no less protective of the Disclosing
          Party than the applicable terms in this MNDA and the Receiving Party
          remains responsible for their compliance with this MNDA; and (c) protect
          Confidential Information using at least the same protections the
          Receiving Party uses for its own similar information but no less than a
          reasonable standard of care.
        </p>

        <p>
          <strong>3. Exceptions.</strong> The Receiving Party&rsquo;s obligations
          in this MNDA do not apply to information that it can demonstrate: (a) is
          or becomes publicly available through no fault of the Receiving Party;
          (b) it rightfully knew or possessed prior to receipt from the Disclosing
          Party without confidentiality restrictions; (c) it rightfully obtained
          from a third party without confidentiality restrictions; or (d) it
          independently developed without using or referencing the Confidential
          Information.
        </p>

        <p>
          <strong>4. Disclosures Required by Law.</strong> The Receiving Party may
          disclose Confidential Information to the extent required by law,
          regulation or regulatory authority, subpoena or court order, provided (to
          the extent legally permitted) it provides the Disclosing Party reasonable
          advance notice of the required disclosure and reasonably cooperates, at
          the Disclosing Party&rsquo;s expense, with the Disclosing Party&rsquo;s
          efforts to obtain confidential treatment for the Confidential Information.
        </p>

        <p>
          <strong>5. Term and Termination.</strong> This MNDA commences on the{" "}
          <F v={formattedDate} label="Effective Date" /> and expires at the end of
          the{" "}
          <span className={v.mndaTermType ? "nda-field-filled" : "nda-field-empty"}>
            {mndaTermText}
          </span>
          . Either party may terminate this MNDA for any or no reason upon written
          notice to the other party. The Receiving Party&rsquo;s obligations
          relating to Confidential Information will survive for the{" "}
          <span className="nda-field-filled">{confTermText}</span>, despite any
          expiration or termination of this MNDA.
        </p>

        <p>
          <strong>6. Return or Destruction of Confidential Information.</strong>{" "}
          Upon expiration or termination of this MNDA or upon the Disclosing
          Party&rsquo;s earlier request, the Receiving Party will: (a) cease using
          Confidential Information; (b) promptly after the Disclosing Party&rsquo;s
          written request, destroy all Confidential Information in the Receiving
          Party&rsquo;s possession or control or return it to the Disclosing Party;
          and (c) if requested by the Disclosing Party, confirm its compliance with
          these obligations in writing. As an exception to subsection (b), the
          Receiving Party may retain Confidential Information in accordance with its
          standard backup or record retention policies or as required by law, but
          the terms of this MNDA will continue to apply to the retained
          Confidential Information.
        </p>

        <p>
          <strong>7. Proprietary Rights.</strong> The Disclosing Party retains all
          of its intellectual property and other rights in its Confidential
          Information and its disclosure to the Receiving Party grants no license
          under such rights.
        </p>

        <p>
          <strong>8. Disclaimer.</strong> ALL CONFIDENTIAL INFORMATION IS PROVIDED
          &ldquo;AS IS&rdquo;, WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING
          THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A
          PARTICULAR PURPOSE.
        </p>

        <p>
          <strong>9. Governing Law and Jurisdiction.</strong> This MNDA and all
          matters relating hereto are governed by, and construed in accordance
          with, the laws of the State of{" "}
          <F v={v.governingLaw} label="Governing Law" />, without regard to the
          conflict of laws provisions of such{" "}
          <F v={v.governingLaw} label="Governing Law" />. Any legal suit, action,
          or proceeding relating to this MNDA must be instituted in the federal or
          state courts located in{" "}
          <F v={v.jurisdiction} label="Jurisdiction" />. Each party irrevocably
          submits to the exclusive jurisdiction of such{" "}
          <F v={v.jurisdiction} label="Jurisdiction" /> in any such suit, action,
          or proceeding.
        </p>

        <p>
          <strong>10. Equitable Relief.</strong> A breach of this MNDA may cause
          irreparable harm for which monetary damages are an insufficient remedy.
          Upon a breach of this MNDA, the Disclosing Party is entitled to seek
          appropriate equitable relief, including an injunction, in addition to its
          other remedies.
        </p>

        <p>
          <strong>11. General.</strong> Neither party has an obligation under this
          MNDA to disclose Confidential Information to the other or proceed with any
          proposed transaction. Neither party may assign this MNDA without the prior
          written consent of the other party, except that either party may assign
          this MNDA in connection with a merger, reorganization, acquisition or
          other transfer of all or substantially all its assets or voting
          securities. Any assignment in violation of this Section is null and void.
          This MNDA will bind and inure to the benefit of each party&rsquo;s
          permitted successors and assigns. Waivers must be signed by the waiving
          party&rsquo;s authorized representative and cannot be implied from
          conduct. If any provision of this MNDA is held unenforceable, it will be
          limited to the minimum extent necessary so the rest of this MNDA remains
          in effect. This MNDA (including the Cover Page) constitutes the entire
          agreement of the parties with respect to its subject matter, and
          supersedes all prior and contemporaneous understandings, agreements,
          representations, and warranties, whether written or oral, regarding such
          subject matter. This MNDA may only be amended, modified, waived, or
          supplemented by an agreement in writing signed by both parties. Notices,
          requests and approvals under this MNDA must be sent in writing to the
          email or postal addresses on the Cover Page and are deemed delivered on
          receipt. This MNDA may be executed in counterparts, including electronic
          copies, each of which is deemed an original and which together form the
          same agreement.
        </p>
      </div>

      <p className="mt-8 text-xs text-gray-400 text-center">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use
        under CC BY 4.0.
      </p>
    </div>
  );
}

export default function Page() {
  const [values, setValues] = useState<NdaValues>(defaultValues);

  function set(field: keyof NdaValues) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => setValues((prev) => ({ ...prev, [field]: e.target.value }));
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* ── LEFT PANEL: FORM ── */}
      <aside className="no-print w-96 flex-shrink-0 flex flex-col bg-[#f7f8fc] border-r border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-navy px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-brand-light font-black text-lg">Prelegal</span>
          </div>
          <h1 className="text-white font-bold text-base">Mutual NDA Creator</h1>
          <p className="text-gray-400 text-xs mt-0.5">
            Fill in the fields — the document updates live.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Basic Terms */}
          <div className="form-section">
            <p className="form-section-title">Basic Terms</p>

            <div className="mb-3">
              <label className="form-label">Purpose</label>
              <textarea
                className="form-input resize-none"
                rows={3}
                placeholder="e.g. Evaluating whether to enter into a business relationship"
                value={values.purpose}
                onChange={set("purpose")}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Effective Date</label>
              <input
                type="date"
                className="form-input"
                value={values.effectiveDate}
                onChange={set("effectiveDate")}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">MNDA Term</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="mndaTermType"
                    value="expires"
                    checked={values.mndaTermType === "expires"}
                    onChange={set("mndaTermType")}
                    className="text-brand"
                  />
                  Expires after
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="form-input w-14 px-2 py-1 text-center"
                    value={values.mndaTermYears}
                    onChange={set("mndaTermYears")}
                    disabled={values.mndaTermType !== "expires"}
                  />
                  year(s)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="mndaTermType"
                    value="continues"
                    checked={values.mndaTermType === "continues"}
                    onChange={set("mndaTermType")}
                    className="text-brand"
                  />
                  Continues until terminated
                </label>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Term of Confidentiality</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="confidentialityType"
                    value="years"
                    checked={values.confidentialityType === "years"}
                    onChange={set("confidentialityType")}
                    className="text-brand"
                  />
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="form-input w-14 px-2 py-1 text-center"
                    value={values.confidentialityYears}
                    onChange={set("confidentialityYears")}
                    disabled={values.confidentialityType !== "years"}
                  />
                  year(s) from Effective Date
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="confidentialityType"
                    value="perpetuity"
                    checked={values.confidentialityType === "perpetuity"}
                    onChange={set("confidentialityType")}
                    className="text-brand"
                  />
                  In perpetuity
                </label>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Governing Law (State)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Delaware"
                value={values.governingLaw}
                onChange={set("governingLaw")}
              />
            </div>

            <div>
              <label className="form-label">Jurisdiction</label>
              <input
                type="text"
                className="form-input"
                placeholder='e.g. courts located in New Castle, DE'
                value={values.jurisdiction}
                onChange={set("jurisdiction")}
              />
            </div>
          </div>

          {/* Party 1 */}
          <div className="form-section">
            <p className="form-section-title">Party 1</p>
            <div className="space-y-3">
              <div>
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Acme Corp"
                  value={values.party1Company}
                  onChange={set("party1Company")}
                />
              </div>
              <div>
                <label className="form-label">Contact Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Jane Smith"
                  value={values.party1Name}
                  onChange={set("party1Name")}
                />
              </div>
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="CEO"
                  value={values.party1Title}
                  onChange={set("party1Title")}
                />
              </div>
              <div>
                <label className="form-label">Notice Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="jane@acme.com"
                  value={values.party1Address}
                  onChange={set("party1Address")}
                />
              </div>
            </div>
          </div>

          {/* Party 2 */}
          <div className="form-section">
            <p className="form-section-title">Party 2</p>
            <div className="space-y-3">
              <div>
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Beta Inc"
                  value={values.party2Company}
                  onChange={set("party2Company")}
                />
              </div>
              <div>
                <label className="form-label">Contact Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={values.party2Name}
                  onChange={set("party2Name")}
                />
              </div>
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="CTO"
                  value={values.party2Title}
                  onChange={set("party2Title")}
                />
              </div>
              <div>
                <label className="form-label">Notice Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="john@betainc.com"
                  value={values.party2Address}
                  onChange={set("party2Address")}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL: PREVIEW ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Preview toolbar */}
        <div className="no-print flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <div>
            <span className="text-sm font-semibold text-gray-700">
              Document Preview
            </span>
            <span className="ml-2 text-xs text-gray-400">
              Updates as you type
            </span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v11"
              />
            </svg>
            Download PDF
          </button>
        </div>

        {/* Scrollable preview area */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="my-8 shadow-lg bg-white rounded-md mx-auto max-w-3xl">
            <NdaPreview v={values} />
          </div>
        </div>
      </main>
    </div>
  );
}
