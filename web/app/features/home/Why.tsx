import algoliaLogo from "../../../public/images/algolia.svg";
import appbaseLogo from "../../../public/images/appbase.svg";
import elasticLogo from "../../../public/images/elastic-logo.svg";
import Philosophy from "./Philosophy.mdx";

export default function Why() {
  return (
    <>
      <h2 id="why">Why RefinerDB and not X?</h2>
      There are already some great offerings that can very capably power this UX.
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <ul>
            <li>
              <a href="https://www.elastic.co/">Elasticsearch</a>
            </li>
            <li>
              <a href="https://www.algolia.com/">Algolia</a>
            </li>
            <li>
              <a href="https://www.appbase.io/">Appbase</a>
            </li>
            <li>And many more...</li>
          </ul>

          <p>However, these solutions generally...</p>
          <ul className="p-6 pl-12 mb-0 text-red-900 bg-red-100 rounded">
            <li>
              Require you to <b>copy items from your database to their system</b>.
            </li>
            <li>
              EITHER are tricky and{" "}
              <b>time consuming to leverage their APIs to support this specific UX</b>.
            </li>
            <li>
              OR provide <b>UI components that are a little too prescriptive</b> and hard
              to customize to specific UI needs.
            </li>
            <li>
              Introduce another element to the your app's architecture. For simple
              situations, this often feels like overkill.
            </li>
          </ul>
        </div>
        <div className="flex flex-col justify-center gap-8 px-12 py-4 bg-gray-200 rounded">
          <img src={elasticLogo} alt="Elasticsearch" />
          <img src={algoliaLogo} alt="Algolia" />
          <img src={appbaseLogo} alt="Appbase" />
        </div>
      </div>
      <Philosophy />
    </>
  );
}
