import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { compileFixture } from "./location-fixtures.mjs";
import { renderToStaticMarkup } from "react-dom/server";

test("city boundaries distinguish unavailable, initialization and existing openings", async () => {
  let source = await readFile(new URL("../components/CityJobs.tsx", import.meta.url), "utf8");
  source = source.replace(/import \{ DataUnavailableError, listJobsWithMeta \} from "@\/lib\/reerhub";/, 'const {DataUnavailableError, listJobsWithMeta} = globalThis.cityStateFixture;')
    .replace(/import Link from "next\/link";/, 'const Link = ({children,href}) => <a href={href}>{children}</a>;')
    .replace(/import ServerJobBrowser from [^;]+;/, 'const ServerJobBrowser = () => <p>Existing verified openings</p>;')
    .replace(/import JobCard from [^;]+;/, 'const JobCard = () => null;')
    .replace(/import PageHeader from [^;]+;/, 'const PageHeader = ({title}) => <h1>{title}</h1>;')
    .replace(/import DiscoveryPrompt from [^;]+;/, 'const DiscoveryPrompt = () => null;')
    .replace(/import CatalogNotice, \{ catalogInitializing \} from "\.\/CatalogNotice";/, 'const catalogInitializing = (data) => data.catalogHasVerifiedJobs === false; const CatalogNotice = () => <p>Preparing first verified openings</p>;');
  class DataUnavailableError extends Error {}
  globalThis.cityStateFixture = { DataUnavailableError, listJobsWithMeta: async () => { throw new DataUnavailableError(); } };
  const { default: CityJobs } = await import(compileFixture(source));
  const props = { title: "Tech jobs in Pune", city: "Pune", blurb: "Official openings", heading: "Openings" };
  try {
    const unavailable = renderToStaticMarkup(await CityJobs(props));
    assert.match(unavailable, /temporarily unavailable/);
    assert.doesNotMatch(unavailable, /Expanding soon|Few open roles|No active/);
  } finally { delete globalThis.cityStateFixture; }
  for (const [result, expected] of [[{total:0, jobs:[], catalogHasVerifiedJobs:false}, /Preparing first verified/], [{total:1,jobs:[], catalogHasVerifiedJobs:true}, /Existing verified openings/]]) {
    globalThis.cityStateFixture = { DataUnavailableError, listJobsWithMeta: async () => result };
    const { default: Component } = await import(compileFixture(source + `\nexport const fixtureVariation = ${result.total};\n`));
    assert.match(renderToStaticMarkup(await Component(props)), expected);
  }
  delete globalThis.cityStateFixture;
});
